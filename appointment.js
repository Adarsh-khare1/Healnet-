const form = document.getElementById("appointmentForm");
const popup = document.getElementById("popup");
const historyDiv = document.getElementById("appointmentHistory");
const anonIdSpan = document.getElementById("anonId");

// Generate or get Anonymous ID
function getAnonId() {
  let id = localStorage.getItem("anonID");
  if (!id) {
    id = "CC-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    localStorage.setItem("anonID", id);
  }
  return id;
}
const anonId = getAnonId();
anonIdSpan.textContent = anonId;

// Load saved appointments and fix missing status
document.addEventListener("DOMContentLoaded", () => {
  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

  // Ensure each appointment has a status
  appointments = appointments.map(a => {
    if(!a.status) a.status = "Scheduled";
    return a;
  });

  localStorage.setItem("appointments", JSON.stringify(appointments));
  showAppointments();
});

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const appointment = {
    anonId: anonId,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    counselor: document.getElementById("counselor").value,
    status: "Scheduled"
  };

  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointments.push(appointment);
  localStorage.setItem("appointments", JSON.stringify(appointments));

  // Show popup confirmation
  popup.classList.remove("hidden");

  // Update history
  showAppointments();

  // Reset form
  form.reset();
});

// Show all appointments
function showAppointments() {
  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  if (appointments.length === 0) {
    historyDiv.innerHTML = "<p>No appointments found.</p>";
    return;
  }

  historyDiv.innerHTML = appointments.map(appt => {
    const canceledClass = appt.status === "Canceled" ? "canceled" : "";
    return `
      <div class="appointment-card ${canceledClass}">
        <p><strong>ID:</strong> ${appt.anonId}</p>
        <p><strong>Date:</strong> ${appt.date}</p>
        <p><strong>Time:</strong> ${appt.time}</p>
        <p><strong>Counselor:</strong> ${appt.counselor}</p>
        <p><strong>Status:</strong> ${appt.status}</p>
      </div>
    `;
  }).join("");
}

// Close popup
function closePopup() {
  popup.classList.add("hidden");
}

// Show user message
function showUserMessage(msg, type = "success") {
  const messageBox = document.getElementById("userMessage");
  messageBox.textContent = msg;
  messageBox.style.backgroundColor = type === "success" ? "#4caf50" : "#f44336";
  messageBox.classList.remove("hidden");

  setTimeout(() => {
    messageBox.classList.add("hidden");
  }, 5000);
}

// Counselor cancels appointment
function cancelAppointment(anonId, date, time) {
  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  const index = appointments.findIndex(a => a.anonId === anonId && a.date === date && a.time === time);

  if(index !== -1){
    appointments[index].status = "Canceled";
    localStorage.setItem("appointments", JSON.stringify(appointments));
    showAppointments();
    showUserMessage(`Your appointment on ${date} at ${time} has been canceled by the counselor.`, "error");
  }
}
