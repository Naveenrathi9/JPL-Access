// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const submitButton = this.querySelector('button[type="submit"]');
    const buttonText = submitButton.innerHTML;

    // Show loading state
    submitButton.innerHTML = '<div class="spinner"></div>Logging in...';
    submitButton.classList.add("loading");
    submitButton.disabled = true;

    // Hardcoded HR credentials
    if (username === "123" && password === "123") {
      messageDiv.textContent = "Login successful! Redirecting...";
      messageDiv.className = "login-message success";

      // Store HR login state
      localStorage.setItem("isHRLoggedIn", "true");

      // Redirect to HR dashboard
      setTimeout(() => {
        window.location.href = "hr_dashboard.html";
      }, 1500);
    } else {
      messageDiv.textContent = "Invalid username or password";
      messageDiv.className = "login-message error";

      // Reset button state
      submitButton.innerHTML = buttonText;
      submitButton.classList.remove("loading");
      submitButton.disabled = false;
    }
  });
});
