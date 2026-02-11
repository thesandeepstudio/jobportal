let allJobs = [];

document.addEventListener("DOMContentLoaded", () => {
  loadJobs();

  // Search Listener
  document.getElementById("searchInput").addEventListener("keyup", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(term) ||
        j.company_name.toLowerCase().includes(term),
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

// --- 1. FETCH JOBS (WITH CACHE BUSTER) ---
async function loadJobs() {
  try {
    const res = await fetch(`../api/admin/jobs.php?t=${new Date().getTime()}`);

    if (!res.ok) throw new Error("HTTP Status: " + res.status);

    const result = await res.json();

    if (result.message === "Unauthorized") {
      alert("Session expired. Please login again.");
      window.location.href = "login.html";
      return;
    }

    if (result.status) {
      allJobs = result.data;
      document.getElementById("total-count").innerText = allJobs.length;
      renderTable(allJobs);
    } else {
      console.warn(result.message);
      document.getElementById("jobs-table-body").innerHTML =
        `<tr><td colspan="6" class="px-6 py-4 text-center">No jobs found.</td></tr>`;
    }
  } catch (err) {
    console.error("Error loading jobs:", err);
    document.getElementById("jobs-table-body").innerHTML =
      `<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Failed to load data.</td></tr>`;
  }
}

// --- 2. OPEN PREVIEW MODAL ---
function openJobModal(index) {
  const job = allJobs.find((j) => j.id == index);
  if (!job) return;

  // Fill Modal
  document.getElementById("modal-title").innerText = job.title;
  document.getElementById("modal-company").innerText = job.company_name;
  document.getElementById("modal-location").innerText = job.location;
  document.getElementById("modal-salary").innerText = job.salary || "N/A";
  document.getElementById("modal-type").innerText = job.job_type;
  document.getElementById("modal-cat").innerText = job.category;
  document.getElementById("modal-date").innerText = new Date(
    job.created_at,
  ).toLocaleDateString();
  document.getElementById("modal-desc").innerText = job.description;
  document.getElementById("modal-icon").innerText = job.company_name
    .charAt(0)
    .toUpperCase();

  // Status Badge logic for modal
  const badge = document.getElementById("modal-status-badge");
  const btnApprove = document.getElementById("btn-approve");
  const btnReject = document.getElementById("btn-reject");

  // Clone to remove old listeners
  const newApprove = btnApprove.cloneNode(true);
  const newReject = btnReject.cloneNode(true);
  btnApprove.parentNode.replaceChild(newApprove, btnApprove);
  btnReject.parentNode.replaceChild(newReject, btnReject);

  // Add listeners
  newApprove.onclick = () => updateJobStatus(job.id, "active");
  newReject.onclick = () => updateJobStatus(job.id, "rejected");

  // Show/Hide Buttons based on status
  if (job.status === "pending") {
    badge.className =
      "px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700";
    badge.innerText = "Pending";
    newApprove.classList.remove("hidden");
    newReject.classList.remove("hidden");
  } else {
    // If already active or rejected, hide action buttons
    newApprove.classList.add("hidden");
    newReject.classList.add("hidden");

    if (job.status === "active") {
      badge.className =
        "px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700";
      badge.innerText = "Active";
    } else {
      badge.className =
        "px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700";
      badge.innerText = "Rejected";
    }
  }

  toggleModal(true);
}

// --- 3. APPROVE / REJECT JOB ---
async function updateJobStatus(id, status) {
  if (!confirm(`Are you sure you want to mark this job as ${status}?`)) return;

  try {
    const res = await fetch("../api/admin/update_job_status.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: id, status: status }),
    });

    const result = await res.json();

    if (result.status) {
      alert(`Job marked as ${status}`);
      closeModal();
      loadJobs(); // Refresh table
    } else {
      alert("Error: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server communication failed.");
  }
}

// --- 4. DELETE JOB ---
async function deleteJob(id) {
  if (!confirm("Are you sure you want to delete this job post?")) return;

  try {
    const res = await fetch("../api/admin/delete_job.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: id }),
    });
    const result = await res.json();

    if (result.status) {
      alert("Job Deleted");
      loadJobs();
    } else {
      alert(result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server Error");
  }
}

// --- 5. HELPER: TOGGLE MODAL ---
function toggleModal(show) {
  const modal = document.getElementById("jobModal");
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

// --- 6. RENDER TABLE ---
function renderTable(data) {
  const tbody = document.getElementById("jobs-table-body");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No matching jobs found.</td></tr>`;
    return;
  }

  data.forEach((job) => {
    // Status Badge
    let statusBadge = "";
    if (job.status === "active")
      statusBadge = `<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">Active</span>`;
    else if (job.status === "pending")
      statusBadge = `<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200">Pending</span>`;
    else
      statusBadge = `<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">Rejected</span>`;

    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50 transition border-b border-gray-100 group";

    tr.innerHTML = `
                <td class="px-6 py-4 cursor-pointer" onclick="openJobModal(${job.id})">
                    <div class="font-bold text-gray-800 group-hover:text-primary transition">${job.title}</div>
                </td>
                <td class="px-6 py-4 text-gray-600 font-medium">${job.company_name}</td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-700">${job.job_type}</div>
                    <div class="text-xs text-gray-400">${job.category || "General"}</div>
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">${new Date(job.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="openJobModal(${job.id})" class="text-blue-400 hover:text-blue-600 transition p-2" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteJob(${job.id})" class="text-gray-400 hover:text-red-500 transition p-2" title="Delete Job">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
    tbody.appendChild(tr);
  });
}

// --- 7. FILTERS ---
function filterJobs(status) {
  // Reset Button Styles
  ["all", "active", "pending", "rejected"].forEach((s) => {
    const btn = document.getElementById(`filter-${s}`);
    if (s === status) {
      btn.className =
        "px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-800 font-bold shadow-sm transition";
    } else {
      btn.className =
        "px-4 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-800 transition";
    }
  });

  if (status === "all") renderTable(allJobs);
  else renderTable(allJobs.filter((j) => j.status === status));
}
