document
  .getElementById("adminLoginForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/admin/dashboard.html";
      } else {
        document.getElementById("error-msg").innerText =
          data.message || "Login failed";
      }
    } catch (err) {
      console.error(err);
      document.getElementById("error-msg").innerText = "Server error";
    }
  });

//   password  hide and and unhide
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "Password";
  togglePassword.src = isPassword
    ? "../../Assets/icons/unhide.png"
    : "../../Assets/icons/hide.png";
});
