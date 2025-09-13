// Get DOM elements
const chatBody = document.getElementById("chatBody");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Total tokens from backend
let totalTokensUsed = 0;

// Helper: append message to chat
function appendMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-message" : "bot-message";
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Display total tokens
function updateTokenDisplay() {
  let tokenDiv = document.querySelector(".token-info");
  if (!tokenDiv) {
    tokenDiv = document.createElement("div");
    tokenDiv.className = "token-info";
    chatBody.appendChild(tokenDiv);
  }
  tokenDiv.textContent = `Total tokens used: ${totalTokensUsed}`;
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

// Send message to backend
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
    // Update tokens used
    totalTokensUsed = data.totalTokens || totalTokensUsed;
    updateTokenDisplay();
  } catch (err) {
    console.error("Chat error:", err);
    appendMessage("⚠️ Sorry, I’m having trouble right now. Please try again.", "bot");
  }
}

// Event listeners
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
sendBtn.addEventListener("click", sendMessage);

// Initialize chat
fetchTotalTokens();
