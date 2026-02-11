let allSeekers = [];

document.addEventListener("DOMContentLoaded", () => {
  loadSeekers();

  // Search Listener
  document.getElementById("searchInput").addEventListener("keyup", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allSeekers.filter(
      (s) =>
        (s.first_name && s.first_name.toLowerCase().includes(term)) ||
        (s.last_name && s.last_name.toLowerCase().includes(term)) ||
        (s.skills && s.skills.toLowerCase().includes(term)),
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

// --- 1. FETCH DATA (WITH CACHE BUSTER) ---
async function loadSeekers() {
  try {
    // Added ?t= to prevent caching
    const res = await fetch(
      `../api/admin/jobseekers.php?t=${new Date().getTime()}`,
    );

    if (!res.ok) throw new Error("HTTP Status: " + res.status);

    const response = await res.json();

    if (response.message === "Unauthorized") {
      window.location.href = "login.html";
      return;
    }

    if (response.status) {
      allSeekers = response.data;
      document.getElementById("total-count").innerText = allSeekers.length;
      renderTable(allSeekers);
    } else {
      document.getElementById("seekers-table-body").innerHTML =
        `<tr><td colspan="6" class="px-6 py-4 text-center">No job seekers found.</td></tr>`;
    }
  } catch (err) {
    console.error("Error:", err);
    document.getElementById("seekers-table-body").innerHTML =
      `<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Failed to load data.</td></tr>`;
  }
}

// --- 2. OPEN PROFILE MODAL (PREVIEW) ---
async function openProfileModal(userId) {
  // Reset Modal
  document.getElementById("prof-name").innerText = "Loading...";
  document.getElementById("prof-avatar-img").classList.add("hidden");
  document.getElementById("prof-avatar-initial").classList.remove("hidden");
  document.getElementById("prof-avatar-initial").innerText = "...";

  // Show Modal
  toggleModal("profileModal", true);

  try {
    // Fetch detailed profile including Bio
    const res = await fetch(`../api/users/get_profile.php?id=${userId}`);
    const result = await res.json();

    if (result.status) {
      const p = result.data;
      document.getElementById("prof-name").innerText =
        `${p.first_name} ${p.last_name}`;
      document.getElementById("prof-email-link").href = `mailto:${p.email}`;

      // Contact Details
      document.getElementById("prof-email").innerHTML =
        `<i class="fas fa-envelope mr-1"></i> ${p.email}`;
      document.getElementById("prof-phone").innerHTML = p.mobile
        ? `<i class="fas fa-phone mr-1"></i> ${p.mobile}`
        : `<span class="text-gray-400 italic">No mobile</span>`;

      // Avatar
      if (p.profile_pic) {
        document.getElementById("prof-avatar-img").src =
          "../api/" + p.profile_pic;
        document.getElementById("prof-avatar-img").classList.remove("hidden");
        document.getElementById("prof-avatar-initial").classList.add("hidden");
      } else {
        document.getElementById("prof-avatar-initial").innerText =
          p.first_name.charAt(0);
      }

      // Details
      document.getElementById("prof-exp").innerText = p.experience || "Fresher";
      document.getElementById("prof-edu").innerText = p.education || "N/A";
      document.getElementById("prof-bio").innerText =
        p.bio || "No bio provided.";

      // Skills
      const skillsContainer = document.getElementById("prof-skills");
      skillsContainer.innerHTML = "";
      if (p.skills) {
        p.skills.split(",").forEach((s) => {
          skillsContainer.innerHTML += `<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-300 font-medium">${s.trim()}</span>`;
        });
      } else {
        skillsContainer.innerHTML =
          "<span class='text-gray-400 text-sm'>No specific skills listed.</span>";
      }
    } else {
      alert("Failed to load profile details.");
      closeModal();
    }
  } catch (err) {
    console.error(err);
    alert("Server Error");
    closeModal();
  }
}

// --- 3. DELETE FUNCTION ---
async function deleteUser(id) {
  if (
    !confirm(
      "Are you sure you want to delete this user? This cannot be undone.",
    )
  )
    return;

  try {
    const res = await fetch("../api/admin/delete_user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: id }),
    });
    const result = await res.json();

    if (result.status) {
      alert("User Deleted");
      loadSeekers(); // Refresh table
    } else {
      alert(result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server Error");
  }
}

// --- 4. HELPER: TOGGLE MODAL ---
function toggleModal(id, show) {
  const modal = document.getElementById(id);
  const content = document.getElementById("profileContent");
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
  toggleModal("profileModal", false);
}

// --- 5. RENDER TABLE ---
function renderTable(data) {
  const tbody = document.getElementById("seekers-table-body");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No matching candidates found.</td></tr>`;
    return;
  }

  data.forEach((s) => {
    const initial = s.first_name ? s.first_name.charAt(0).toUpperCase() : "U";
    const fullName = `${s.first_name} ${s.last_name}`;

    let skillsHtml =
      '<span class="text-gray-400 text-xs">No skills listed</span>';
    if (s.skills) {
      skillsHtml = s.skills
        .split(",")
        .slice(0, 3)
        .map(
          (skill) =>
            `<span class="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded text-[10px] mr-1">${skill.trim()}</span>`,
        )
        .join("");
      if (s.skills.split(",").length > 3)
        skillsHtml += `<span class="text-[10px] text-gray-400 ml-1">+more</span>`;
    }

    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50 transition border-b border-gray-100 group";

    tr.innerHTML = `
                <td class="px-6 py-4 cursor-pointer" onclick="openProfileModal(${s.user_id})">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg border border-green-200">
                            ${initial}
                        </div>
                        <div>
                            <div class="font-bold text-gray-800 group-hover:text-primary transition">${fullName}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-y-1">${skillsHtml}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-gray-800 font-medium text-xs">${s.experience || "Fresher"}</div>
                    <div class="text-xs text-gray-400 truncate max-w-[150px]">${s.education || "Edu N/A"}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-gray-600 text-xs"><i class="fas fa-envelope mr-1"></i> ${s.email}</div>
                    <div class="text-gray-500 text-xs mt-1"><i class="fas fa-phone mr-1"></i> ${s.mobile || "N/A"}</div>
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">${new Date(s.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="openProfileModal(${s.user_id})" class="text-blue-400 hover:text-blue-600 transition p-2" title="View Profile">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteUser(${s.user_id})" class="text-gray-400 hover:text-red-500 transition p-2" title="Delete User">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
    tbody.appendChild(tr);
  });
}
