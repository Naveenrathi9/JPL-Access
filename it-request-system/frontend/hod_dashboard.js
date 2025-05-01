//const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://jpl-z0s7.onrender.com";;

// Check if user is logged in
function checkAuth() {
  const isHodLoggedIn = localStorage.getItem("isHodLoggedIn");
  if (!isHodLoggedIn) {
    window.location.href = "hod_login.html";
    return false;
  }
  return true;
}

// Get the current HOD's email (username)
function getCurrentHodEmail() {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    console.error("No logged-in user found");
    return null;
  }
  return loggedInUser.toLowerCase();
}

// Filter requests by current HOD's email
function filterByCurrentHod(requests) {
  const hodEmail = getCurrentHodEmail();
  if (!hodEmail) {
    console.warn("No HOD email found - showing no requests");
    return [];
  }
  
  return requests.filter(request => {
    if (!request.hodEmail) {
      console.warn("Request missing hodEmail:", request._id);
      return false;
    }
    return request.hodEmail.toLowerCase() === hodEmail;
  });
}

// Load and display requests
async function loadRequests() {
  if (!checkAuth()) return;

  try {
    // Fetch requests from backend
    const response = await fetch(`${BASE_URL}/api/requests`);
    if (!response.ok) {
      throw new Error("Failed to fetch requests");
    }

    const allRequests = await response.json();
    console.log("Loaded requests from backend:", allRequests);

    // Filter requests for current HOD only
    const hodRequests = filterByCurrentHod(allRequests);
    
    // Update localStorage with filtered data
    localStorage.setItem("requests", JSON.stringify(hodRequests));

    // Update UI with filtered requests
    updateStats(hodRequests);
    displayRequests(hodRequests);
  } catch (error) {
    console.error("Error loading requests:", error);
    // Show error message to user
    const tbody = document.getElementById("requestsTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-danger">
            <i class="fas fa-exclamation-circle"></i>
            Failed to load requests. Please try again later.
          </td>
        </tr>
      `;
    }
  }
}

// Update statistics
function updateStats(requests) {
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status.hod === "pending").length,
    approved: requests.filter((r) => r.status.hod === "approved").length,
    rejected: requests.filter((r) => r.status.hod === "rejected").length,
  };

  document.getElementById("totalRequests").textContent = stats.total;
  document.getElementById("pendingRequests").textContent = stats.pending;
  document.getElementById("approvedRequests").textContent = stats.approved;
  document.getElementById("rejectedRequests").textContent = stats.rejected;
}

// [Rest of the functions remain exactly the same...]
// Format status text, displayRequests, getStatusBadgeClass, 
// handleAction, handleSearch, handleFilter, logout, initDashboard
// ...

// Format status text
function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Display requests in table
function displayRequests(requests, filter = "all") {
  console.log("Displaying requests:", requests, "with filter:", filter);
  const tbody = document.getElementById("requestsTableBody");
  if (!tbody) {
    console.error("Table body element not found");
    return;
  }
  tbody.innerHTML = "";

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status && r.status.hod === filter);

  filteredRequests.forEach((request) => {
    if (!request.status) {
      console.error("Request missing status:", request);
      return;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>#${request._id || ""}</td>
            <td>${request.name || ""}</td>
            <td>${request.department || ""}</td>
            <td>${request.item || ""}</td>
           <td>${request.specialAllowance || ""}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(request.status.hr)}">
                    HR: ${formatStatus(request.status.hr)}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(request.status.hod)}">
                    HOD: ${formatStatus(request.status.hod)}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(request.status.ithod)}">
                    IT: ${formatStatus(request.status.ithod)}
                </span>
            </td>
            <td>
                ${
                  request.status.hod === "pending"
                    ? `
                    <button class="btn btn-sm btn-outline-success action-btn approve" data-id="${request._id}" data-role="hod">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger action-btn reject" data-id="${request._id}" data-role="hod">
                        <i class="fas fa-times"></i>
                    </button>
                `
                    : ""
                }
            </td>
        `;

    tbody.appendChild(tr);
  });
}

// Get appropriate Bootstrap badge class for status
function getStatusBadgeClass(status) {
  if (!status) return "bg-secondary";

  switch (status.toLowerCase()) {
    case "pending":
      return "bg-warning text-dark";
    case "approved":
      return "bg-success";
    case "rejected":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
}

// Handle request actions (approve, reject)
async function handleAction(e) {
  const btn = e.target.closest(".action-btn");
  if (!btn) return;

  try {
    const id = btn.dataset.id;
    const role = btn.dataset.role || "hod";
    const action = btn.classList.contains("approve")
      ? "approved"
      : btn.classList.contains("reject")
      ? "rejected"
      : null;

    if (!action) return;

    // Disable button while processing
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Send update to backend using GET /api/approve with query params
    const url = new URL(`${BASE_URL}/api/approve`);
    url.searchParams.append("id", id);
    url.searchParams.append("type", role);
    url.searchParams.append("status", action);

    const response = await fetch(url.toString(), {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to ${action} request`);
    }

    // Reload requests to get updated data
    await loadRequests();
  } catch (error) {
    console.error("Error handling action:", error);
    // Show error message
    alert(`Failed to ${action} request. Please try again.`);
    // Re-enable button
    if (btn) {
      btn.disabled = false;
      btn.innerHTML =
        action === "approved"
          ? '<i class="fas fa-check"></i>'
          : '<i class="fas fa-times"></i>';
    }
  }
}

// Handle search functionality
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");
  const filtered = requests.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm) ||
      r.department.toLowerCase().includes(searchTerm) ||
      r.item.toLowerCase().includes(searchTerm)
  );
  displayRequests(filtered);
}

// Handle filter buttons
function handleFilter(e) {
  const btn = e.target.closest(".btn");
  if (!btn || !btn.dataset.filter) return;

  document.querySelectorAll("[data-filter]").forEach((el) => {
    el.classList.remove("active");
  });
  btn.classList.add("active");

  const filter = btn.dataset.filter;
  const role = btn.dataset.role || "hod";
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status[role] === filter);

  displayRequests(filteredRequests);
}

// Logout functionality
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "hod_login.html";
}

// Initialize dashboard
function initDashboard() {
  if (!checkAuth()) return;
  console.log("Initializing HOD dashboard...");
  loadRequests();

  // Add event listeners
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
  document.querySelector(".btn-group").addEventListener("click", handleFilter);
  document
    .getElementById("requestsTableBody")
    .addEventListener("click", function (e) {
      const btn = e.target.closest(".action-btn");
      if (btn) {
        e.preventDefault();
        handleAction(e);
      }
    });

  // Auto-refresh every 30 seconds
  setInterval(loadRequests, 100000);
}

// Run initialization when page loads
document.addEventListener("DOMContentLoaded", initDashboard);
