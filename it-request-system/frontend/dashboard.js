//const BASE_URL = "https://jpl-admin.onrender.com";
const BASE_URL = "https://jpl-z0s7.onrender.com";
// Check if user is logged in
function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) {
    window.location.href = "login.html";
    return false;
  }
  return true;
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

    const requests = await response.json();
    console.log("Loaded requests from backend:", requests);

    // Update localStorage with latest data
    localStorage.setItem("requests", JSON.stringify(requests));

    // Update UI
    updateStats(requests);
    displayRequests(requests);
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
    pending: requests.filter((r) => r.status.ithod === "pending").length,
    approved: requests.filter((r) => r.status.ithod === "approved").length,
    rejected: requests.filter((r) => r.status.ithod === "rejected").length,
  };

  document.getElementById("totalRequests").textContent = stats.total;
  document.getElementById("pendingRequests").textContent = stats.pending;
  document.getElementById("approvedRequests").textContent = stats.approved;
  document.getElementById("rejectedRequests").textContent = stats.rejected;
}

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
      : requests.filter((r) => r.status && r.status.ithod === filter);

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
            <td>${request.location || ""}</td>
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
                  request.status.ithod === "pending"
                    ? `
                    <button class="btn btn-sm btn-outline-success action-btn approve" data-id="${request._id}" data-role="ithod">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger action-btn reject" data-id="${request._id}" data-role="ithod">
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

// Handle request actions (approve, reject, delete)
async function handleAction(e) {
  const btn = e.target.closest(".action-btn");
  if (!btn) return;

  try {
    const id = btn.dataset.id;
    const role = btn.dataset.role || "ithod";
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
  const role = btn.dataset.role || "ithod";
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
  window.location.href = "login.html";
}

// Initialize dashboard
function initDashboard() {
  if (!checkAuth()) return;
  console.log("Initializing dashboard...");
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
  setInterval(loadRequests, 30000);
}

// Run initialization when page loads
document.addEventListener("DOMContentLoaded", initDashboard);
