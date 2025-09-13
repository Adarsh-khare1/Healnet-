// Fake counselor accounts (replace with real backend later)
const counselors = [
  { username: "sharma", password: "1234", name: "Dr. Sharma" },
  { username: "mehta", password: "5678", name: "Dr. Mehta" },
  { username: "gupta", password: "5678", name: "Dr. Gupta" }
];

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const counselorNameEl = document.getElementById("counselorName");
const appointmentsDiv = document.getElementById("counselorAppointments");

let loggedInCounselor = null;

// Login submit
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const counselor = counselors.find(
    c => c.username === username && c.password === password
  );

  if (counselor) {
    loggedInCounselor = counselor;
    localStorage.setItem("loggedInCounselor", JSON.stringify(counselor));

    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");

    loadAppointments();
  } else {
    loginError.textContent = "Invalid username or password!";
  }
});

// Load appointments for logged-in counselor
function loadAppointments() {
  if (!loggedInCounselor) return;

  counselorNameEl.textContent = "Welcome, " + loggedInCounselor.name;

  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  let myAppointments = appointments.filter(appt => appt.counselor === loggedInCounselor.name);

  if (myAppointments.length === 0) {
    appointmentsDiv.innerHTML = "<p>No appointments booked yet.</p>";
    return;
  }

  appointmentsDiv.innerHTML = myAppointments.map(appt => {
    const isFinal = appt.status === "Completed" || appt.status === "Canceled";

    return `
      <div class="appointment-card">
        <p><strong>Student ID:</strong> ${appt.anonId}</p>
        <p><strong>Date:</strong> ${appt.date}</p>
        <p><strong>Time:</strong> ${appt.time}</p>
        <p><strong>Status:</strong> ${appt.status || "Scheduled"}</p>

        ${!isFinal ? `
          <button onclick="markCompleted('${appt.anonId}', '${appt.date}', '${appt.time}')">
            Mark Completed
          </button>
          <button onclick="cancelAppointment('${appt.anonId}', '${appt.date}', '${appt.time}')">
            Cancel
          </button>
        ` : ""}
      </div>
    `;
  }).join("");
}

// Mark appointment completed
function markCompleted(anonId, date, time) {
  if (!confirm("Mark this appointment as completed?")) return;

  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  let idx = appointments.findIndex(a => a.anonId === anonId && a.date === date && a.time === time);

  if (idx !== -1) {
    appointments[idx].status = "Completed";
    localStorage.setItem("appointments", JSON.stringify(appointments));
    loadAppointments();
  }
}

// Cancel appointment
function cancelAppointment(anonId, date, time) {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  const index = appointments.findIndex(a => a.anonId === anonId && a.date === date && a.time === time);

  if (index !== -1) {
    appointments[index].status = "Canceled";
    localStorage.setItem("appointments", JSON.stringify(appointments));
    loadAppointments();

    // Optional: notify user if they're on booking page
    if (typeof showUserMessage === "function") {
      showUserMessage(`Your appointment on ${date} at ${time} has been canceled by the counselor.`, "error");
    }
  }
}
