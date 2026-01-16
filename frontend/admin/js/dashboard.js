// Fetch total users and companies
async function loadDashboardData() {
  try {
    const res = await fetch("/admin/total-users", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch data");

    const data = await res.json();

    document.getElementById("total-users").innerText = data.users;
    document.getElementById("total-companies").innerText = data.companies;
  } catch (err) {
    console.error("Error loading dashboard data:", err);
    document.getElementById("total-users").innerText = "Error";
    document.getElementById("total-companies").innerText = "Error";
  }
}

// Logout button
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/admin/logout", { credentials: "include" });
      window.location.href = "/admin/login.html";
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed");
    }
  });
}

window.addEventListener("DOMContentLoaded", loadDashboardData);
