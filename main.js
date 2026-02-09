document.addEventListener("DOMContentLoaded", () => {
    const chatbotIcon = document.getElementById("chatbot-icon");
    const chatbox = document.getElementById("chatbox");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.querySelector("#chat-footer button");
    const messagesContainer = document.getElementById("messages");

    if (!chatbotIcon || !chatbox || !userInput || !sendBtn || !messagesContainer) {
        console.error("Some chat elements are missing from the DOM!", { chatbotIcon, chatbox, userInput, sendBtn, messagesContainer });
        return;
    }

    window.toggleChat = function () {
        chatbox.style.display = (chatbox.style.display === "block") ? "none" : "block";
    };
    chatbotIcon.addEventListener("click", toggleChat);

    window.sendMessage = async function () {
        let message = userInput.value.trim();
        if (!message) return;

        let userMsg = document.createElement("div");
        userMsg.classList.add("message", "user-message");
        userMsg.textContent = message;
        messagesContainer.appendChild(userMsg);
        userInput.value = "";

        let typingIndicator = document.createElement("div");
        typingIndicator.classList.add("message", "typing");
        typingIndicator.textContent = "Bot is typing...";
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            let response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message })
            });

            let data = await response.json();
            messagesContainer.removeChild(typingIndicator);

            let botReply = document.createElement("div");
            botReply.classList.add("message", "bot-message");
            botReply.textContent = data.response || "No response from server.";
            messagesContainer.appendChild(botReply);
        } catch (error) {
            console.error("Error:", error);
            messagesContainer.removeChild(typingIndicator);

            let errorMsg = document.createElement("div");
            errorMsg.classList.add("message", "bot-message");
            errorMsg.textContent = "Error connecting to chatbot.";
            messagesContainer.appendChild(errorMsg);
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    if (document.querySelector('.text')) {
        new Typed('.text', {
            strings: ['Web Developer', 'Mobile App Developer', 'Machine Learning Enthusiast'],
            typeSpeed: 100,
            backSpeed: 50,
            loop: true
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    document.querySelectorAll('.progress').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = width; }, 500);
    });

    const menuIcon = document.getElementById('menu-icon');
    const navbar = document.getElementById('navbar');
    if (menuIcon && navbar) {
        menuIcon.addEventListener('click', () => navbar.classList.toggle('active'));
    }

    document.querySelectorAll('.radial-bar').forEach(bar => {
        const percentage = bar.getAttribute('data-percentage');
        bar.style.background = `conic-gradient(#0ef ${percentage}%, #333 ${percentage}% 100%)`;
    });
    function toggleMenu() {
            const navbar = document.querySelector('.navbar');
            navbar.classList.toggle('active');
        }

        // Close menu when clicking on a navigation item
        document.querySelectorAll('.navbar a').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelector('.navbar').classList.remove('active');
            });
        });

        // Add active class to the current navigation item
        const navLinks = document.querySelectorAll('.navbar a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
            });
        });

    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 100, density: { enable: true, value_area: 800 } },
                color: { value: '#ffffff' },
                shape: { type: 'circle' },
                opacity: { value: 0.7, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
                line_linked: { enable: false },
                move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'bubble' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    bubble: { distance: 200, size: 6, duration: 2, opacity: 0.8, speed: 3 },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
        
    }

   
        });
        

