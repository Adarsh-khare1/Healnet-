// chatbot.js
const chatBody = document.getElementById("chatBody");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Local session token count (optional per session)
let sessionTokens = 0;

// Backend URLs
const BACKEND_BASE_URL = "https://healnet-0eyd.onrender.com";
const CHAT_URL = `${BACKEND_BASE_URL}/chat`;
const TOKENS_URL = `${BACKEND_BASE_URL}/tokens`;

// ----------------------
// Append messages
// ----------------------
function appendMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-message" : "bot-message";
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// ----------------------
// Update token display
// ----------------------
function updateTokenDisplay(globalTokens = 0) {
  let tokenDiv = document.querySelector(".token-info");
  if (!tokenDiv) {
    tokenDiv = document.createElement("div");
    tokenDiv.className = "token-info";
    chatBody.appendChild(tokenDiv);
  }
  tokenDiv.textContent = `Session tokens: ${sessionTokens} | Global tokens: ${globalTokens}`;
}

// ----------------------
// Fetch global tokens from DB
// ----------------------
async function fetchGlobalTokens() {
  try {
    const res = await fetch(TOKENS_URL);
    if (!res.ok) throw new Error("Failed to fetch global tokens");
    const data = await res.json();
    updateTokenDisplay(data.totalTokens);
  } catch (err) {
    console.error("Error fetching global tokens:", err);
  }
}

// ----------------------
// Send message to backend
// ----------------------
async function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;

  appendMessage(msg, "user");
  userInput.value = "";

  try {
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();

    appendMessage(data.reply, "bot");

    // Update session tokens
    sessionTokens += data.tokensUsed;

    // Use global tokens from backend
    updateTokenDisplay(data.totalTokens);

  } catch (err) {
    console.error("Chat error:", err);
    appendMessage("⚠️ Sorry, I’m having trouble right now. Please try again.", "bot");
  }
}

// ----------------------
// Event listeners
// ----------------------
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
sendBtn.addEventListener("click", sendMessage);

// ----------------------
// Reset session tokens only
// ----------------------
function resetTokens() {
  sessionTokens = 0;
  const resetDiv = document.createElement("div");
  resetDiv.className = "token-info";
  resetDiv.textContent = "Session tokens reset to 0";
  chatBody.appendChild(resetDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// ----------------------
// Initialize: fetch global tokens
// ----------------------
fetchGlobalTokens();
