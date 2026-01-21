document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ELEMENT SELECTORS ---
    const jobForm = document.getElementById("jobseeker-form");
    const empForm1 = document.getElementById("employer-form");
    const empForm2 = document.getElementById("employer-detail-form");
    const radioInputs = document.querySelectorAll("input[name='userType']");
    const continueBtn = document.getElementById("continueBtn");
    const emailError = document.getElementById("emailError");

    // --- 2. TOGGLE USER TYPE (Job Seeker vs Employer) ---
    radioInputs.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'jobseeker') {
                // Show Job Seeker, Hide Employer
                jobForm.classList.remove('hidden');
                empForm1.classList.add('hidden');
                empForm2.classList.add('hidden');
            } else {
                // Show Employer Step 1, Hide Job Seeker
                jobForm.classList.add('hidden');
                empForm1.classList.remove('hidden');
                empForm2.classList.add('hidden');
            }
        });
    });

    // --- 3. CUSTOM DROPDOWN LOGIC ---
    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(select => {
        const selectedDisplay = select.querySelector('.selected');
        const optionsContainer = select.querySelector('.options');
        // Map the hidden input based on data-name
        const inputId = select.getAttribute('data-name') + 'Input'; 
        const realInput = document.getElementById(inputId);

        // Toggle Dropdown
        selectedDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close others
            document.querySelectorAll('.options').forEach(opt => {
                if (opt !== optionsContainer) opt.classList.add('hidden');
            });
            optionsContainer.classList.toggle('hidden');
        });

        // Select Option
        select.querySelectorAll('.options div').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                // Update UI text (keep the arrow)
                selectedDisplay.childNodes[0].nodeValue = option.innerText + " "; 
                // Update Hidden Input
                if(realInput) realInput.value = option.innerText;
                // Close Dropdown
                optionsContainer.classList.add('hidden');
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.options').forEach(opt => opt.classList.add('hidden'));
    });

    // --- 4. EMPLOYER CONTINUE BUTTON (Step 1 -> Step 2) ---
    continueBtn.addEventListener('click', () => {
        const size = document.getElementById("companySizeInput").value;
        const industry = document.getElementById("industryInput").value;

        if (!size || !industry) {
            alert("Please select both Company Size and Industry.");
            return;
        }

        // Hide Step 1, Show Step 2
        empForm1.classList.add('hidden');
        empForm2.classList.remove('hidden');
    });

    // --- 5. PASSWORD TOGGLE ---
    window.togglePassword = function(id, element) {
        const input = document.getElementById(id);
        const img = element.querySelector("img");
        
        if (input.type === "password") {
            input.type = "text";
            // FIX: Use ../ to go up one level from auth/ folder
            img.src = "../assets/Icons/unhide.png"; 
        } else {
            input.type = "password";
            // FIX: Use ../ to go up one level from auth/ folder
            img.src = "../assets/Icons/hide.png";
        }
    };

    // --- 6. REGISTRATION SUBMISSION ---
    
    // JOB SEEKER SUBMIT
    document.getElementById("registerBtn").addEventListener("click", async (e) => {
        e.preventDefault();
        if(emailError) emailError.innerText = "";

        const data = {
            role: "jobseeker",
            first_name: document.getElementById("first_name").value.trim(),
            last_name: document.getElementById("last_name").value.trim(),
            email: document.getElementById("email_id").value.trim(),
            mobile: document.getElementById("mobile_number").value.trim(),
            password: document.getElementById("password").value.trim(),
            confirm: document.getElementById("confirm-password").value.trim()
        };

        if (!data.first_name || !data.last_name || !data.email || !data.password) {
            alert("Please fill all fields"); return;
        }
        if (data.password !== data.confirm) {
            alert("Passwords do not match"); return;
        }

        sendRegister(data);
    });

    // EMPLOYER SUBMIT
    document.getElementById("employersRegisterBtn").addEventListener("click", async (e) => {
        e.preventDefault();

        const data = {
            role: "employer",
            company_size: document.getElementById("companySizeInput").value,
            industry: document.getElementById("industryInput").value,
            company_name: document.getElementById("company_name").value.trim(),
            location: document.getElementById("company_location").value.trim(),
            email: document.getElementById("company_email").value.trim(),
            mobile: document.getElementById("company_mobile").value.trim(),
            password: document.getElementById("company_password").value.trim(),
            confirm: document.getElementById("company_confirm_password").value.trim()
        };

        if (!data.company_name || !data.email || !data.password) {
            alert("Please fill all fields"); return;
        }
        if (data.password !== data.confirm) {
            alert("Passwords do not match"); return;
        }

        sendRegister(data);
    });

    // --- 7. SEND TO PHP BACKEND ---
    async function sendRegister(payload) {
        try {
            // FIX: Changed path to "../api/register.php"
            // Explanation: 
            // Current file is accessed via register.html (inside /auth/)
            // We need to go up (../) to root, then down into api/
            const res = await fetch("../api/register.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // Check if response is valid
            if (!res.ok) {
                throw new Error(`HTTP Error: ${res.status}`);
            }

            const result = await res.json();

            if (result.status) {
                alert("Registration Successful! Please Login.");
                window.location.href = "login.html";
            } else {
                alert(result.message || "Registration failed");
            }

        } catch (err) {
            console.error(err);
            alert("Server Error. Please check console.");
        }
    }
});