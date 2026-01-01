// auth/js/login.js

// GET FORM ELEMENTS
const loginForm = document.getElementById("jobseeker-form");
const emailInput = document.getElementById("email_id");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");

// FORM SUBMIT
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showError("Please fill all fields!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // check content type
    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.error("Server response is not JSON:", text);
      showError("Server error! Try again.");
      return;
    }

    if (!data.status) {
      showError(data.message);
      return;
    }

    // SUCCESS: store token and user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // REDIRECT based on role
    if (data.user.role === "jobseeker") {
      window.location.href = "../jobseeker/dashboard.html";
    } else {
      window.location.href = "../employer/dashboard.html";
    }
  } catch (err) {
    console.error(err);
    showError("Server error! Try again.");
  }
});

// SHOW / HIDE PASSWORD
function togglePassword(id, element) {
  const input = document.getElementById(id);
  const img = element.querySelector("img");

  if (input.type === "password") {
    input.type = "text";
    img.src = "../Assets/icons/unhide.png";
  } else {
    input.type = "password";
    img.src = "../Assets/icons/hide.png";
  }
}

// ERROR FUNCTIONS
function showError(msg) {
  emailError.innerText = msg;
}

function clearError() {
  emailError.innerText = "";
}
