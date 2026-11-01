// Render the users list
function renderUsers(tableBody, users) {
  tableBody.innerHTML = "";

  users.forEach((user) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    <button class="editBtn">Edit</button>
                    <button class="deleteBtn">Delete</button>
                </td>
            `;

    tableBody.appendChild(row);
  });
}

async function fetchUsers() {
  const tableBody = document.querySelector("#usersTable tbody");
  if (!tableBody) return;

  try {
    const res = await fetch("/api/admin/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    if (data.success) {
      renderUsers(tableBody, data.users);
    } else {
      showError("Failed to load users.", data.message);
    }
  } catch (err) {
    console.error("Something went wrong:", err);
    showError("Something went wrong. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", fetchUsers);
