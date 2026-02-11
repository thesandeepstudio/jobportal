let allCompanies = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCompanies();

  // Search Listener
  document.getElementById("searchInput").addEventListener("keyup", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allCompanies.filter(
      (comp) =>
        (comp.company_name && comp.company_name.toLowerCase().includes(term)) ||
        (comp.industry && comp.industry.toLowerCase().includes(term)),
    );
    renderTable(filtered);
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (confirm("Are you sure you want to logout?")) {
      await fetch("../api/logout.php");
      window.location.href = "login.html";
    }
  });
});

// --- 1. FETCH COMPANIES ---
async function loadCompanies() {
  try {
    const res = await fetch("../api/admin/companies.php");
    const response = await res.json();

    if (response.status) {
      allCompanies = response.data;
      document.getElementById("total-count").innerText = allCompanies.length;
      renderTable(allCompanies);
    } else {
      document.getElementById("companies-table-body").innerHTML =
        `<tr><td colspan="6" class="px-6 py-4 text-center">No companies found.</td></tr>`;
    }
  } catch (err) {
    console.error("Error:", err);
    document.getElementById("companies-table-body").innerHTML =
      `<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Failed to load data.</td></tr>`;
  }
}

// --- 2. OPEN COMPANY MODAL ---
function openCompanyModal(index) {
  // Since we loaded all data in loadCompanies(), we don't need another API call.
  // We can just use the data from the allCompanies array.
  const comp = allCompanies[index];
  if (!comp) return;

  // Fill Data
  document.getElementById("comp-name").innerText = comp.company_name;
  document.getElementById("comp-industry").innerText =
    comp.industry || "Industry N/A";
  document.getElementById("comp-location").innerText =
    comp.location || "Remote";
  document.getElementById("comp-size").innerText = comp.company_size || "N/A";
  document.getElementById("comp-jobs").innerText = comp.job_count || "0";

  // Contact
  document.getElementById("comp-email").innerHTML =
    `<i class="fas fa-envelope mr-1"></i> ${comp.email}`;
  document.getElementById("comp-phone").innerHTML = comp.mobile
    ? `<i class="fas fa-phone mr-1"></i> ${comp.mobile}`
    : `<span class="text-gray-400 italic">No mobile</span>`;
  document.getElementById("comp-email-link").href = `mailto:${comp.email}`;

  // Logo Initials
  const initial = comp.company_name
    ? comp.company_name.charAt(0).toUpperCase()
    : "C";
  document.getElementById("comp-logo").innerText = initial;

  // Show Modal
  toggleModal(true);
}

// --- 3. DELETE COMPANY ---
async function deleteCompany(userId) {
  if (
    !confirm(
      "Are you sure? This will delete the company account and ALL their posted jobs. This cannot be undone.",
    )
  )
    return;

  try {
    const res = await fetch("../api/admin/delete_user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const result = await res.json();

    if (result.status) {
      alert("Company Deleted");
      loadCompanies(); // Refresh table
    } else {
      alert(result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server Error");
  }
}

// --- 4. HELPER: TOGGLE MODAL ---
function toggleModal(show) {
  const modal = document.getElementById("companyModal");
  const content = document.getElementById("modalContent");
  if (show) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      content.classList.remove("scale-95", "opacity-0");
      content.classList.add("scale-100", "opacity-100");
    }, 10);
  } else {
    content.classList.remove("scale-100", "opacity-100");
    content.classList.add("scale-95", "opacity-0");
    setTimeout(() => modal.classList.add("hidden"), 300);
  }
}
function closeModal() {
  toggleModal(false);
}

// --- 5. RENDER TABLE ---
function renderTable(data) {
  const tbody = document.getElementById("companies-table-body");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No matching companies found.</td></tr>`;
    return;
  }

  data.forEach((comp, index) => {
    const initial = comp.company_name
      ? comp.company_name.charAt(0).toUpperCase()
      : "C";
    const bgColors = [
      "bg-red-100 text-red-600",
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
      "bg-yellow-100 text-yellow-600",
    ];
    // Use index to pick color consistently
    const randomColor = bgColors[index % bgColors.length];

    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50 transition border-b border-gray-100 group";

    tr.innerHTML = `
                <td class="px-6 py-4 cursor-pointer" onclick="openCompanyModal(${index})">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg ${randomColor} flex items-center justify-center font-bold text-lg shadow-sm">
                            ${initial}
                        </div>
                        <div>
                            <div class="font-bold text-gray-800 group-hover:text-primary transition">${comp.company_name}</div>
                            <div class="text-xs text-gray-400">${comp.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-gray-700 font-medium">${comp.industry || "N/A"}</div>
                    <div class="text-xs text-gray-400">${comp.company_size || "Size N/A"}</div>
                </td>
                <td class="px-6 py-4 text-gray-600">
                    <i class="fas fa-map-marker-alt text-gray-300 mr-1"></i> ${comp.location || "Remote"}
                </td>
                <td class="px-6 py-4">
                    <span class="bg-blue-50 text-blue-700 py-1 px-3 rounded-md text-xs font-bold border border-blue-100">
                        ${comp.job_count} Active Jobs
                    </span>
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">${new Date(comp.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="openCompanyModal(${index})" class="text-blue-400 hover:text-blue-600 transition p-2" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteCompany(${comp.user_id})" class="text-gray-400 hover:text-red-500 transition p-2" title="Delete Company">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
    tbody.appendChild(tr);
  });
}
