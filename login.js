document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");

  // Demo credentials
  const adminUsername = "admin";
  const adminPassword = "campus123";

  if (username === adminUsername && password === adminPassword) {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "admin.html";
  } else {
    errorMsg.textContent = "Invalid username or password!";
  }
});
