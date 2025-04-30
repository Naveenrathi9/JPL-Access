const hodEmail = {
  "Unit Head Office": "hod@example.com",
  "Operation & Maintenance": "naveenrathi556@gmail.com",
  "Operations, Chemistry": "hod@example.com",
  "Coal Quality Management": "hod@example.com",
  "Boiler Maintenance": "hod@example.com",
  "Turbine & Auxiliaries": "hod@example.com",
  "CHP, AHP, Bio Mass, Ash Management": "hod@example.com",
  "Electrical": "hod@example.com",
  "Control & Instrumentation": "hod@example.com",
  "Technical Services": "hod@example.com",
  "Coal Management Group": "hod@example.com",
  "Ash management": "hod@example.com",
  "LAQ": "hod@example.com",
  "Finance & Accounts": "hod@example.com",
  "HR ES CSR Medical, Town Maint": "hod@example.com",
  "Admin": "hod@example.com",
  "HR": "hod@example.com",
  "Medical": "hod@example.com",
  "Corporate HR": "hod@example.com",
  "CSR": "hod@example.com",
  "Information Technology": "hod@example.com",
  "MM&C": "hod@example.com",
  "EHS": "hod@example.com",
  "Solar, Mechanical Project, Civil, Plant Horticulture": "hod@example.com",
  "Electrical Project, TL": "hod@example.com",
  "Mines and CPP": "hod@example.com",
  "JIPT": "hod@example.com",
  "IV/1": "hod@example.com",
  "Sector 1 E": "hod@example.com",
  "IV/2-3": "hod@example.com",
  "Security": "hod@example.com",
};

// Designations that qualify for Special Allowance
const specialAllowanceDesignations = [
  "Others",
  "Apprentice",
  "Junior Engineer" 
];

// Auto-fill HOD email
document.getElementById("department").addEventListener("change", function() {
  const selectedDept = this.value;
  const hodEmailInput = document.getElementById("hodEmail");
  hodEmailInput.value = hodEmail[selectedDept] || "";
});

// Set and lock Special Allowance based on designation
document.querySelector('select[name="designation"]').addEventListener('change', function() {
  const designation = this.value;
  const radioYes = document.querySelector('input[name="specialAllowance"][value="YES"]');
  const radioNo = document.querySelector('input[name="specialAllowance"][value="NO"]');
  
  // Check if designation qualifies for special allowance
  const qualifiesForAllowance = specialAllowanceDesignations.includes(designation);
  
  // Set the value and disable the radio buttons
  radioYes.checked = qualifiesForAllowance;
  radioNo.checked = !qualifiesForAllowance;
  radioYes.disabled = true;
  radioNo.disabled = true;
  
  // Add visual indication that field is auto-set
  const radioGroup = document.querySelector('.radio-group');
  if (qualifiesForAllowance) {
    radioGroup.classList.add('allowance-yes');
    radioGroup.classList.remove('allowance-no');
  } else {
    radioGroup.classList.add('allowance-no');
    radioGroup.classList.remove('allowance-yes');
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Trigger designation change if one is already selected
  const designationSelect = document.querySelector('select[name="designation"]');
  if (designationSelect.value) {
    designationSelect.dispatchEvent(new Event('change'));
  }
});

// Form submit
document.getElementById("requestForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const form = e.target;

  const formData = {
    name: form.name.value,
    employeeCode: form.employeeCode.value,
    designation: form.designation.value,
    email: form.email.value,
    department: form.department.value,
    location: form.location.value,
    specialAllowance: document.querySelector('input[name="specialAllowance"]:checked').value,
    item: form.item.value,
    reason: form.reason.value,
    hodEmail: form.hodEmail.value,
  };

  console.log("Sending to backend:", formData);

  // const BASE_URL = "https://jpl-admin.onrender.com";
  const BASE_URL = "https://jpl-z0s7.onrender.com";

  try {
    const res = await fetch(`${BASE_URL}/api/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    console.log("Response from backend:", result);

    const responseMessage = document.getElementById("responseMessage");
    responseMessage.textContent = result.message || "Request submitted successfully!";
    responseMessage.style.display = "block";
    responseMessage.style.color = res.ok ? "green" : "red";

    if (res.ok) {
      form.reset();
      document.getElementById("hodEmail").value = "";
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        responseMessage.style.display = "none";
      }, 5000);
    }
  } catch (err) {
    console.error("Error:", err);
    const responseMessage = document.getElementById("responseMessage");
    responseMessage.textContent = "Submission failed. Please try again.";
    responseMessage.style.color = "red";
    responseMessage.style.display = "block";
  }
});
