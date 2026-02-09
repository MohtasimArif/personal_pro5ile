import pickle

# Load responses.pkl file
with open("responses.pkl", "rb") as file:
    responses = pickle.load(file)

# Check the type of data
print(type(responses))

# Print the content
print(responses)
