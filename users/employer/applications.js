document.addEventListener("DOMContentLoaded", async () => {
        // LOGOUT
        document
          .getElementById("logoutBtn")
          .addEventListener("click", async () => {
            if (confirm("Logout?")) {
              await fetch("../../api/logout.php");
              window.location.href = "../../auth/login.html";
            }
          });

        // LOAD JOBS
        try {
          const res = await fetch("../../api/jobs/list_employer.php");
          const result = await res.json();
          const grid = document.getElementById("jobsGrid");
          grid.innerHTML = "";

          if (result.status && result.data.length > 0) {
            result.data.forEach((job) => {
              const hasApplicants = job.applicant_count > 0;
              const btnClass = hasApplicants
                ? "bg-primary text-white hover:bg-blue-600 shadow-md ring-2 ring-blue-100 ring-offset-1"
                : "bg-gray-100 text-gray-400 cursor-not-allowed";

              const safeTitle = job.title.replace(/'/g, "\\'");
              const clickAction = hasApplicants
                ? `onclick="openApplicantsModal(${job.id}, '${safeTitle}')"`
                : "";

              grid.innerHTML += `
                    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-lg transition">
                        <h3 class="font-bold text-gray-800 text-lg">${job.title}</h3>
                        <p class="text-sm text-gray-500 mb-4">Posted: ${new Date(job.created_at).toLocaleDateString()}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-2xl font-bold ${hasApplicants ? "text-primary" : "text-gray-300"}">${job.applicant_count} Applicants</span>
                            <button ${clickAction} class="px-4 py-2 rounded-md text-sm font-bold transition ${btnClass}">View List</button>
                        </div>
                    </div>
                `;
            });
          } else {
            grid.innerHTML = `<p class="col-span-3 text-center text-gray-500">No jobs posted.</p>`;
          }
        } catch (err) {
          console.error("Load Jobs Error:", err);
        }
      });

      // --- 1. APPLICANT LIST MODAL ---
      async function openApplicantsModal(jobId, jobTitle) {
        document.getElementById("modal-job-title").innerText = jobTitle;
        const tbody = document.getElementById("modalTableBody");
        const empty = document.getElementById("modalEmptyState");

        tbody.innerHTML =
          '<tr><td colspan="4" class="px-6 py-10 text-center text-gray-400"><i class="fas fa-circle-notch fa-spin mr-2"></i> Loading candidates...</td></tr>';
        empty.classList.add("hidden");

        toggleModal("appModal", true);

        try {
          const res = await fetch(
            `../../api/jobs/get_applicants.php?job_id=${jobId}`,
          );
          const result = await res.json();

          tbody.innerHTML = "";

          if (result.status && result.data.length > 0) {
            result.data.forEach((app) => {
              let avatarHtml = "";
              if (app.profile_pic) {
                const imgPath = "../../api/" + app.profile_pic;
                avatarHtml = `<img src="${imgPath}" class="w-8 h-8 rounded-full object-cover border border-gray-200" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                              <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm hidden">${app.first_name.charAt(0)}</div>`;
              } else {
                avatarHtml = `<div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">${app.first_name.charAt(0)}</div>`;
              }

              const row = `
                    <tr onclick="openProfileModal(${app.user_id})" class="hover:bg-blue-50 transition group cursor-pointer border-b border-gray-50 last:border-0">
                        <td class="px-6 py-4 align-top">
                            <div class="flex items-center gap-3">
                                ${avatarHtml}
                                <div class="text-sm font-bold text-gray-800 group-hover:text-primary transition">${app.first_name} ${app.last_name}</div>
                            </div>
                        </td>
                        <td class="px-6 py-4 align-top">
                            <div class="text-sm font-medium text-gray-900 mb-1">${app.experience || "Fresher"}</div>
                            <div class="flex flex-wrap gap-1">
                                ${(app.skills || "N/A")
                                  .split(",")
                                  .map(
                                    (s) =>
                                      `<span class="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">${s.trim()}</span>`,
                                  )
                                  .join("")}
                            </div>
                        </td>
                        <td class="px-6 py-4 align-top">
                            <div class="text-sm text-gray-800 font-medium mb-1">${app.email}</div>
                            <div class="text-xs text-gray-500">${app.mobile}</div>
                        </td>
                        <td class="px-6 py-4 align-top text-right text-xs text-gray-400 font-medium">
                            ${new Date(app.applied_at).toLocaleDateString()}
                        </td>
                    </tr>
                `;
              tbody.innerHTML += row;
            });
          } else {
            tbody.innerHTML = "";
            empty.classList.remove("hidden");
          }
        } catch (err) {
          console.error(err);
          tbody.innerHTML =
            '<tr><td colspan="4" class="text-center text-red-500 py-6">Failed to load data.</td></tr>';
        }
      }

      // --- 2. PROFILE MODAL ---
      async function openProfileModal(userId) {
        if (!userId) {
          alert("Error: User ID missing");
          return;
        }

        document.getElementById("prof-name").innerText = "Loading...";
        document.getElementById("prof-avatar-img").classList.add("hidden");
        document.getElementById("prof-avatar-img").src = "";
        document
          .getElementById("prof-avatar-initial")
          .classList.remove("hidden");
        document.getElementById("prof-avatar-initial").innerText = "...";

        toggleModal("profileModal", true);

        try {
          const res = await fetch(
            `../../api/users/get_profile.php?id=${userId}`,
          );
          const result = await res.json();

          if (result.status) {
            const p = result.data;
            document.getElementById("prof-name").innerText =
              `${p.first_name} ${p.last_name}`;
            document.getElementById("prof-headline").innerText = p.bio
              ? "Candidate"
              : "Job Seeker";

            // AVATAR LOGIC
            if (p.profile_pic) {
              const fullPath = "../../api/" + p.profile_pic;
              const imgEl = document.getElementById("prof-avatar-img");
              const initEl = document.getElementById("prof-avatar-initial");

              imgEl.src = fullPath;
              imgEl.classList.remove("hidden");
              initEl.classList.add("hidden");
            } else {
              document.getElementById("prof-avatar-initial").innerText =
                p.first_name.charAt(0);
            }

            // --- GMAIL COMPOSE LINK LOGIC ---
            const subject = encodeURIComponent(
              `Regarding your job application - ${p.first_name} ${p.last_name}`,
            );
            const body = encodeURIComponent(
              `Hello ${p.first_name},\n\nWe have reviewed your profile and would like to...`,
            );
            document.getElementById("prof-email-link").href =
              `https://mail.google.com/mail/?view=cm&fs=1&to=${p.email}&su=${subject}&body=${body}`;

            document.getElementById("prof-exp").innerText =
              p.experience || "Fresher";
            document.getElementById("prof-edu").innerText =
              p.education || "N/A";
            document.getElementById("prof-bio").innerText =
              p.bio || "No bio provided.";

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
            alert("Error: " + result.message);
            closeModal("profileModal");
          }
        } catch (err) {
          console.error(err);
        }
      }

      // --- HELPER: TOGGLE MODAL ---
      function toggleModal(id, show) {
        const modal = document.getElementById(id);
        const content =
          id === "appModal"
            ? document.getElementById("modalContent")
            : document.getElementById("profileContent");

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

      function closeModal(id) {
        toggleModal(id, false);
      }
