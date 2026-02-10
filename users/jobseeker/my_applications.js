document.addEventListener("DOMContentLoaded", async () => {
  // Logout Logic
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("../../api/logout.php");
    window.location.href = "../../auth/login.html";
  });

  // Fetch Applications
  try {
    const res = await fetch("../../api/jobs/my_applications.php");
    const result = await res.json();
    const tbody = document.getElementById("appTableBody");
    tbody.innerHTML = "";

    if (result.status && result.data.length > 0) {
      result.data.forEach((app) => {
        // Status Color Logic
        let statusColor = "bg-yellow-100 text-yellow-800"; // Applied
        if (app.status === "interview")
          statusColor = "bg-blue-100 text-blue-800";
        if (app.status === "rejected") statusColor = "bg-red-100 text-red-800";
        if (app.status === "hired") statusColor = "bg-green-100 text-green-800";

        const row = `
                            <tr>
                                <td class="px-6 py-4 font-bold text-gray-800">${app.company_name}</td>
                                <td class="px-6 py-4 text-gray-600">${app.title} <br> <span class="text-xs text-gray-400">${app.location}</span></td>
                                <td class="px-6 py-4 text-gray-500">${new Date(app.applied_at).toLocaleDateString()}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                                        ${app.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        `;
        tbody.innerHTML += row;
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No applications yet. <a href="dashboard.html" class="text-primary">Find a job</a></td></tr>`;
    }
  } catch (err) {
    console.error(err);
  }
});
