function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("active");
}

function postQuestion() {
  const input = document.getElementById("questionInput");
  const category = document.getElementById("categorySelect").value;
  const list = document.getElementById("questionsList");

  if (input.value.trim() === "") {
    alert("Please type a question!");
    return;
  }

  // Create card
  const card = document.createElement("div");
  card.className = "question-card animate";
  card.innerHTML = `
    <h3>${input.value}</h3>
    <span class="tag ${category.toLowerCase()}">${category}</span>
    <p class="meta">Posted just now | <span class="likes">0 Likes</span></p>
    <button class="like-btn" onclick="likeQuestion(this)">👍 Like</button>
  `;

  list.prepend(card);
  input.value = "";
}

function likeQuestion(btn) {
  let likes = btn.parentElement.querySelector(".likes");
  let count = parseInt(likes.innerText.split(" ")[0]);
  likes.innerText = (count + 1) + " Likes";
  btn.classList.add("liked");
  setTimeout(() => btn.classList.remove("liked"), 400);
}
