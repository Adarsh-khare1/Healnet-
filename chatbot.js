// chatbot.js
const chatBody = document.getElementById("chatBody");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Local session token count
let totalTokensUsed = parseInt(localStorage.getItem("totalTokensUsed")) || 0;

// Append messages
function appendMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-message" : "bot-message";
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Send message
async function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;

  appendMessage(msg, "user");
  userInput.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();

    appendMessage(data.reply, "bot");

    // Update tokens
    totalTokensUsed += data.tokensUsed;
    localStorage.setItem("totalTokensUsed", totalTokensUsed);

    // Show token info
    const tokenDiv = document.createElement("div");
    tokenDiv.className = "token-info";
    tokenDiv.textContent = `Your tokens: ${totalTokensUsed} | Global tokens: ${data.totalTokens}`;
    chatBody.appendChild(tokenDiv);

    chatBody.scrollTop = chatBody.scrollHeight;
  } catch (err) {
    console.error("Chat error:", err);
    appendMessage("⚠️ Sorry, I’m having trouble right now. Please try again.", "bot");
  }
}

// Events
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
sendBtn.addEventListener("click", sendMessage);

// Reset
function resetTokens() {
  totalTokensUsed = 0;
  localStorage.setItem("totalTokensUsed", 0);
  const resetDiv = document.createElement("div");
  resetDiv.className = "token-info";
  resetDiv.textContent = "Session tokens reset to 0";
  chatBody.appendChild(resetDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}
