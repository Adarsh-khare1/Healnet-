const chatBody = document.getElementById("chatBody");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let totalTokensUsed = 0;

// Append message helper
function appendMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-message" : "bot-message";
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Fetch total tokens from backend
async function fetchTotalTokens() {
  try {
    const res = await fetch("https://healnet-0eyd.onrender.com/tokens");
    const data = await res.json();
    totalTokensUsed = data.totalTokens || 0;
    updateTokenDisplay();
  } catch (err) {
    console.error("Failed to fetch total tokens", err);
  }
}

// Update token info in chat
function updateTokenDisplay() {
  const tokenDiv = document.querySelector(".token-info") || document.createElement("div");
  tokenDiv.className = "token-info";
  tokenDiv.textContent = `Total tokens used: ${totalTokensUsed}`;
  if (!tokenDiv.parentNode) chatBody.appendChild(tokenDiv);
}

// Send message
async function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;
  appendMessage(msg, "user");
  userInput.value = "";

  try {
    const res = await fetch("https://healnet-0eyd.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    appendMessage(data.reply, "bot");

    totalTokensUsed = data.totalTokens;
    updateTokenDisplay();
  } catch (err) {
    console.error("Chat error:", err);
    appendMessage("⚠️ Sorry, I’m having trouble right now. Please try again.", "bot");
  }
}

// Send on Enter
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Send on button click
sendBtn.addEventListener("click", sendMessage);

// Fetch tokens on page load
fetchTotalTokens();
