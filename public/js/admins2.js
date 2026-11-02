// Render the users list
function renderAdmins(tableBody, admins) {
  tableBody.innerHTML = "";

  admins.forEach((admin) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                <td>${admin.id}</td>
                <td>${admin.name}</td>
                <td>${admin.username}</td>
                <td>${admin.role}</td>
            `;

    tableBody.appendChild(row);
  });
}

async function fetchAdmins() {
  const tableBody = document.querySelector("#usersTable tbody");
  if (!tableBody) return;

  try {
    const res = await fetch("/api/admin/admins", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    if (data.success) {
      renderAdmins(tableBody, data.admins);
    } else {
      showError("Failed to load admins.", data.message);
    }
  } catch (err) {
    console.error("Something went wrong:", err);
    showError("Something went wrong. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", fetchAdmins);
