// Tab switcher
function openTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelector(`[onclick="openTab('${tabId}')"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
}

// Modal
function openModal(videoUrl) {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");
  frame.src = videoUrl;
  modal.style.display = "flex";
}
function closeModal() {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");
  frame.src = "";
  modal.style.display = "none";
}

// Navbar toggle (mobile)
function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("active");
}
