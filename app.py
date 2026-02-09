from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import faiss
import pickle
import numpy as np
import openai
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from huggingface_hub import login
from transformers import AutoTokenizer
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get API keys from .env
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Validate API keys
if not HUGGINGFACE_TOKEN or not OPENAI_API_KEY:
    raise ValueError("Missing API keys. Check your .env file.")

# Login to HuggingFace Hub
login(HUGGINGFACE_TOKEN)

# Load the SentenceTransformer model
model_name = "sentence-transformers/all-MiniLM-L6-v2"
embedding_model = SentenceTransformer(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Load saved models safely
try:
    faiss_index = faiss.read_index("faiss_index.bin")
    vectorizer = joblib.load("tfidf_vectorizer.pkl")
    question_embeddings = np.load("question_embeddings.npy")
    with open("responses.pkl", "rb") as file:
        responses = pickle.load(file)
        if not isinstance(responses, dict):
            raise ValueError("responses.pkl must contain a dictionary.")
except FileNotFoundError as e:
    raise FileNotFoundError(f"Missing required file: {e}")

# Set OpenAI API key
openai.api_key = OPENAI_API_KEY

# Initialize FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Model
class ChatRequest(BaseModel):
    message: str

# Rule-Based Response
def rule_based_response(user_input):
    return responses.get(user_input.lower().strip(), None)

# Intent-Based Response
def intent_based_response(user_input):
    user_vec = vectorizer.transform([user_input])
    similarities = cosine_similarity(user_vec, vectorizer.transform(responses.keys())).flatten()
    
    best_match_idx = np.argmax(similarities)
    best_score = similarities[best_match_idx]

    if best_score > 0.6:
        return responses[list(responses.keys())[best_match_idx]]
    return None

# RAG-Based Response
def rag_response(user_input):
    user_embedding = np.array(embedding_model.encode([user_input]), dtype=np.float32)
    _, idx = faiss_index.search(user_embedding, k=1)
    
    best_match_idx = idx[0][0]
    if 0 <= best_match_idx < len(responses):
        return responses[list(responses.keys())[best_match_idx]]
    return None

# GPT-4 LLM Response (Fallback)
def llm_response(user_input):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful chatbot for a portfolio. If you don't know the answer, say 'I don't know.'"},
                {"role": "user", "content": user_input}
            ]
        )
        return response["choices"][0]["message"]["content"]
    except openai.error.OpenAIError as e:
        return f"Sorry, I couldn't process your request. Error: {e}"

# Home Route
@app.get("/")
async def home():
    return {"message": "Chatbot API is running. Use the /chat endpoint to interact."}

# Chat Route
@app.post("/chat")
async def chatbot(request: ChatRequest):
    user_input = request.message.strip().lower()

    # Rule-Based Response
    response = rule_based_response(user_input)
    if response:
        return {"response": response, "method": "Rule-Based"}

    # Intent-Based Response
    response = intent_based_response(user_input)
    if response:
        return {"response": response, "method": "Intent-Based"}

    # RAG Model
    response = rag_response(user_input)
    if response:
        return {"response": response, "method": "RAG"}

    # GPT-4 LLM Response (Fallback)
    return {"response": llm_response(user_input), "method": "LLM"}
