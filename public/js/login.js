document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorBox = document.getElementById('errorMsg');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('pwd');

  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
    });
  }

  function showError(message) {
    errorBox.querySelector('.alert-text').textContent = message;
    errorBox.style.display = 'flex';
  }

  function hideError() {
    errorBox.style.display = 'none';
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop normal page reload
    hideError();

    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showError('Please fill in both fields.');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = 'dashboard.html';
      } else {
        showError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      showError('Something went wrong. Please try again.');
    }
  });
});