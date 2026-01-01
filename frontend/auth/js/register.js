// GET FORMS

const jobForm = document.getElementById("jobseeker-form");
const empForm = document.getElementById("employer-form");
const empDetailForm = document.getElementById("employer-detail-form");

// STATE FLAG
let isEmployerStep2 = false;

// USER TYPE SWITCH

const radios = document.querySelectorAll("input[name='userType']");

window.addEventListener("load", () => {
  const checked = document.querySelector("input[name='userType']:checked");

  if (checked.value === "jobseeker") {
    jobForm.style.display = "block";
    empForm.style.display = "none";
    if (empDetailForm) empDetailForm.style.display = "none";
  } else {
    jobForm.style.display = "none";
    empForm.style.display = "block";
    if (empDetailForm) empDetailForm.style.display = "none";
  }
});

// radio switch
radios.forEach((radio) => {
  radio.addEventListener("change", function () {
    if (this.value === "jobseeker") {
      jobForm.style.display = "block";
      empForm.style.display = "none";
      if (empDetailForm) empDetailForm.style.display = "none";
    } else {
      jobForm.style.display = "none";
      empForm.style.display = "block";
      if (empDetailForm) empDetailForm.style.display = "none";
    }
    isEmployerStep2 = false;
  });
});

// PASSWORD SHOW / HIDE

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

// CUSTOM DROPDOWNS

document.querySelectorAll(".custom-select").forEach((select) => {
  select.addEventListener("click", function (e) {
    document.querySelectorAll(".custom-select").forEach((s) => {
      if (s !== select) s.classList.remove("active");
    });
    this.classList.toggle("active");
    e.stopPropagation();
  });

  select.querySelectorAll(".options div").forEach((opt) => {
    opt.addEventListener("click", function (e) {
      select.querySelector(".selected").innerText = this.innerText;

      const name = select.getAttribute("data-name");
      document.getElementById(name + "Input").value = this.innerText;

      select.classList.remove("active");
      e.stopPropagation();
    });
  });
});

// close dropdown
document.addEventListener("click", () => {
  document
    .querySelectorAll(".custom-select")
    .forEach((s) => s.classList.remove("active"));
});

// EMPLOYER CONTINUE

document.getElementById("continueBtn").addEventListener("click", () => {
  const size = document.getElementById("companySizeInput").value;
  const industry = document.getElementById("industryInput").value;

  if (!size || !industry) {
    alert("Please select company size & industry.");
    return;
  }

  empForm.style.display = "none";
  empDetailForm.style.display = "block";
  isEmployerStep2 = true;
});

// register buttons
const registerBtn = document.getElementById("registerBtn");
const employersRegisterBtn = document.getElementById("employersRegisterBtn");

const emailError = document.getElementById("emailError");

// Email Validation
function validEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function showError(msg) {
  emailError.innerText = msg;
}

function clearError() {
  emailError.innerText = "";
}

// Job seekers Registration
registerBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  clearError();

  const first = document.getElementById("first_name").value.trim();
  const last = document.getElementById("last_name").value.trim();
  const email = document.getElementById("email_id").value.trim();
  const mobile = document.getElementById("mobile_number").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm-password").value.trim();

  if (!first || !last || !email || !mobile || !password) {
    alert("Please fill all fields!");
    return;
  }

  if (!validEmail(email)) {
    showError("Invalid email!");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  sendRegister({
    role: "jobseeker",
    first_name: first,
    last_name: last,
    email,
    mobile,
    password,
  });
});

// Employers Registration

employersRegisterBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  clearError();

  const size = document.getElementById("companySizeInput").value;
  const industry = document.getElementById("industryInput").value;
  const company = document.getElementById("company_name").value.trim();
  const location = document.getElementById("company_location").value.trim();
  const email = document.getElementById("company_email").value.trim();
  const mobile = document.getElementById("company_mobile").value.trim();
  const password = document.getElementById("company_password").value.trim();
  const confirm = document
    .getElementById("company_confirm_password")
    .value.trim();

  if (
    !company ||
    !location ||
    !email ||
    !mobile ||
    !password ||
    !size ||
    !industry
  ) {
    alert("Please fill all employer fields!");
    return;
  }

  if (!validEmail(email)) {
    showError("Invalid email!");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  sendRegister({
    role: "employer",
    company_name: company,
    location,
    email,
    mobile,
    password,
    company_size: size,
    industry,
  });
});

// send to the backend
async function sendRegister(data) {
  try {
    const res = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    alert(result.message);

    if (result.status) {
      window.location.href = "login.html";
    }
  } catch (err) {
    console.log(err);
    alert("Server error!");
  }
}
