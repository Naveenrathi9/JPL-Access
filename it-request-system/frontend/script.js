document.addEventListener('DOMContentLoaded', function() {
  // Form navigation
  const formSections = document.querySelectorAll('.form-section');
  const progressSteps = document.querySelectorAll('.progress-step');
  const btnNext = document.querySelectorAll('.btn-next');
  const btnPrev = document.querySelectorAll('.btn-prev');
  const submitButton = document.getElementById('submitButton');
  const successModal = document.getElementById('successModal');
  const printReceipt = document.getElementById('printReceipt');
  const newRequest = document.getElementById('newRequest');
  const fileInput = document.querySelector('input[type="file"]');
  const fileName = document.querySelector('.file-name');
  const charCount = document.getElementById('charCount');
  const reasonTextarea = document.getElementById('reason');
  
  // HOD Email mapping
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

  let currentSection = 0;

  // Show first section by default
  showSection(currentSection);

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
    const radioGroup = document.querySelector('.radio-group');
    
    // Check if designation qualifies for special allowance
    const qualifiesForAllowance = specialAllowanceDesignations.includes(designation);
    
    // Set the value and disable the radio buttons
    radioYes.checked = qualifiesForAllowance;
    radioNo.checked = !qualifiesForAllowance;
    radioYes.disabled = true;
    radioNo.disabled = true;
    
    // Add visual indication that field is auto-set
    if (qualifiesForAllowance) {
      radioGroup.classList.add('allowance-yes');
      radioGroup.classList.remove('allowance-no');
    } else {
      radioGroup.classList.add('allowance-no');
      radioGroup.classList.remove('allowance-yes');
    }
  });

  // Initialize designation on page load
  const designationSelect = document.querySelector('select[name="designation"]');
  if (designationSelect.value) {
    designationSelect.dispatchEvent(new Event('change'));
  }

  // Next button click handler
  btnNext.forEach(btn => {
    btn.addEventListener('click', function() {
      if (validateSection(currentSection)) {
        currentSection++;
        showSection(currentSection);
        updateProgress();
      }
    });
  });

  // Previous button click handler
  btnPrev.forEach(btn => {
    btn.addEventListener('click', function() {
      currentSection--;
      showSection(currentSection);
      updateProgress();
    });
  });

  // File input change handler
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
        fileName.textContent = this.files[0].name;
      } else {
        fileName.textContent = 'No file chosen';
      }
    });
  }

  // Character counter for reason textarea
  if (reasonTextarea) {
    reasonTextarea.addEventListener('input', function() {
      charCount.textContent = this.value.length;
    });
  }

  // Form submission handler
  if (submitButton) {
    submitButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (validateSection(currentSection)) {
        submitForm();
      }
    });
  }

  // Print receipt button
  if (printReceipt) {
    printReceipt.addEventListener('click', function() {
      window.print();
    });
  }

  // New request button
  if (newRequest) {
    newRequest.addEventListener('click', function() {
      successModal.classList.remove('active');
      currentSection = 0;
      showSection(currentSection);
      updateProgress();
      document.getElementById('requestForm').reset();
      fileName.textContent = 'No file chosen';
      charCount.textContent = '0';
      document.getElementById('hodEmail').value = '';
      
      // Reset radio buttons
      const radioYes = document.querySelector('input[name="specialAllowance"][value="YES"]');
      const radioNo = document.querySelector('input[name="specialAllowance"][value="NO"]');
      const radioGroup = document.querySelector('.radio-group');
      radioYes.checked = false;
      radioNo.checked = true;
      radioYes.disabled = false;
      radioNo.disabled = false;
      radioGroup.classList.remove('allowance-yes', 'allowance-no');
    });
  }

  // Show specific section
  function showSection(index) {
    formSections.forEach((section, i) => {
      section.classList.toggle('active', i === index);
    });
    
    // Update review section if we're on the review step
    if (index === 2) {
      updateReviewSection();
    }
  }

  // Update progress indicator
  function updateProgress() {
    progressSteps.forEach((step, i) => {
      step.classList.toggle('active', i <= currentSection);
    });
  }

  // Validate current section
  function validateSection(index) {
    const currentSection = formSections[index];
    const inputs = currentSection.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('error');
        isValid = false;
      } else {
        input.classList.remove('error');
      }
    });
    
    if (!isValid) {
      alert('Please fill in all required fields');
    }
    
    return isValid;
  }

  // Update review section with entered data
  function updateReviewSection() {
    const personalInfoReview = document.getElementById('personalInfoReview');
    const equipmentReview = document.getElementById('equipmentReview');
    
    // Personal Info
    let personalInfoHTML = `
      <div class="review-details">
        <div class="review-field">
          <label>Name</label>
          <p>${document.getElementById('name').value}</p>
        </div>
        <div class="review-field">
          <label>Employee Code</label>
          <p>${document.getElementById('employeeCode').value}</p>
        </div>
        <div class="review-field">
          <label>Designation</label>
          <p>${document.getElementById('designation').value}</p>
        </div>
        <div class="review-field">
          <label>Special Exception</label>
          <p>${document.querySelector('input[name="specialAllowance"]:checked').value}</p>
        </div>
        <div class="review-field">
          <label>User Email</label>
          <p>${document.getElementById('email').value}</p>
        </div>
        <div class="review-field">
          <label>Department</label>
          <p>${document.getElementById('department').value}</p>
        </div>
        <div class="review-field">
          <label>HOD Email</label>
          <p>${document.getElementById('hodEmail').value}</p>
        </div>
        <div class="review-field">
          <label>Location</label>
          <p>${document.getElementById('location').value}</p>
        </div>
      </div>
    `;
    
    // Equipment Details
    let equipmentHTML = `
      <div class="review-details">
        <div class="review-field">
          <label>Selected Item</label>
          <p>${document.getElementById('item').value}</p>
        </div>
        <div class="review-field full-width">
          <label>Reason</label>
          <p>${document.getElementById('reason').value || 'N/A'}</p>
        </div>
    `;
    
    if (fileInput.files.length > 0) {
      equipmentHTML += `
        <div class="review-field">
          <label>Attached File</label>
          <p>${fileInput.files[0].name} (${formatFileSize(fileInput.files[0].size)})</p>
        </div>
      `;
    }
    
    equipmentHTML += `</div>`;
    
    personalInfoReview.innerHTML = personalInfoHTML;
    equipmentReview.innerHTML = equipmentHTML;
  }

  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Submit form data
  async function submitForm() {
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;
    
    const form = document.getElementById('requestForm');
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

    console.log('Sending to backend:', formData);

    try {
      const BASE_URL = "https://jpl-z0s7.onrender.com";
      //const BASE_URL = "http://localhost:5000";
      const res = await fetch(`${BASE_URL}/api/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      console.log('Response from backend:', result);

      if (res.ok) {
        // Show success modal
        successModal.classList.add('active');
        // Generate random request ID
        const requestId = 'IT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
        document.querySelector('#successModal strong').textContent = requestId;
      } else {
        // Show error message
        const responseMessage = document.createElement('div');
        responseMessage.className = 'error';
        responseMessage.textContent = result.message || 'Submission failed. Please try again.';
        document.querySelector('.form-container').appendChild(responseMessage);
        setTimeout(() => {
          responseMessage.remove();
        }, 5000);
      }
    } catch (err) {
      console.error('Error:', err);
      const responseMessage = document.createElement('div');
      responseMessage.className = 'error';
      responseMessage.textContent = 'Submission failed. Please try again.';
      document.querySelector('.form-container').appendChild(responseMessage);
      setTimeout(() => {
        responseMessage.remove();
      }, 5000);
    } finally {
      submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
      submitButton.disabled = false;
    }
  }
});
