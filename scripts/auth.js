// Authentication JavaScript
function showLogin() {
  document.getElementById("loginForm").classList.add("active")
  document.getElementById("registerForm").classList.remove("active")
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  event.target.classList.add("active")
}

function showRegister() {
  document.getElementById("registerForm").classList.add("active")
  document.getElementById("loginForm").classList.remove("active")
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  event.target.classList.add("active")
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId)
  const button = event.target.closest(".toggle-password")
  const icon = button.querySelector("i")

  if (input.type === "password") {
    input.type = "text"
    icon.classList.remove("fa-eye")
    icon.classList.add("fa-eye-slash")
  } else {
    input.type = "password"
    icon.classList.remove("fa-eye-slash")
    icon.classList.add("fa-eye")
  }
}

function login() {
  event.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const rememberMe = document.getElementById("rememberMe").checked

  // Basic validation
  if (!email || !password) {
    alert("Please fill in all fields")
    return
  }

  // Here you would typically make an API call to your backend
  console.log("Login attempt:", { email, password, rememberMe })

  // For demo purposes, simulate successful login
  localStorage.setItem("isLoggedIn", "true")
  localStorage.setItem("userEmail", email)

  // Redirect to dashboard
  window.location.href = "dashboard.html"
}

function register() {
  event.preventDefault()

  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  const email = document.getElementById("registerEmail").value
  const phone = document.getElementById("phone").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const agreeTerms = document.getElementById("agreeTerms").checked

  // Basic validation
  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    alert("Please fill in all fields")
    return
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match")
    return
  }

  if (!agreeTerms) {
    alert("Please agree to the terms and conditions")
    return
  }

  // Here you would typically make an API call to your backend
  console.log("Registration attempt:", { firstName, lastName, email, phone, password })

  // For demo purposes, simulate successful registration
  localStorage.setItem("isLoggedIn", "true")
  localStorage.setItem("userEmail", email)
  localStorage.setItem("userName", `${firstName} ${lastName}`)

  // Redirect to dashboard
  window.location.href = "dashboard.html"
}

// Check if user is already logged in
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {
    window.location.href = "dashboard.html"
  }
})
