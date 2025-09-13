const questions = document.querySelectorAll(".question");
const progressBar = document.querySelector(".progress-bar");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const resultBox = document.getElementById("result");
const resultText = document.getElementById("resultText");
let currentStep = 0;

function showStep(step){
  questions.forEach((q,i)=>{
    q.classList.remove("active");
    if(i === step) q.classList.add("active");
  });
  progressBar.style.width = ((step+1)/questions.length)*100 + "%";
  prevBtn.style.display = step === 0 ? "none" : "inline-block";
  nextBtn.textContent = step === questions.length -1 ? "Submit" : "Next";
}

nextBtn.addEventListener("click", ()=>{
  if(currentStep < questions.length-1){
    currentStep++;
    showStep(currentStep);
  } else {
    document.getElementById("screeningForm").style.display = "none";
    resultBox.style.display = "block";
    resultText.textContent = "Mock Result: Moderate Depression + Mild Anxiety (demo)";
    resultBox.scrollIntoView({behavior:"smooth"});
  }
});

prevBtn.addEventListener("click", ()=>{
  if(currentStep > 0){
    currentStep--;
    showStep(currentStep);
  }
});

showStep(currentStep);
