document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const errorBox = document.getElementById('errorMsg');
  const successBox = document.getElementById('successMsg');
  const passwordInput = document.getElementById('pwd');
  const confirmPasswordInput = document.getElementById('confirmpwd');
  const termsCheckbox = document.getElementById('terms');

  function showError(message) {
    successBox.style.display = 'none';
    errorBox.querySelector('.alert-text').textContent = message;
    errorBox.style.display = 'flex';
  }

  function showSuccess(message) {
    errorBox.style.display = 'none';
    successBox.querySelector('.alert-text').textContent = message;
    successBox.style.display = 'flex';
  }

  function hideAlerts() {
    errorBox.style.display = 'none';
    successBox.style.display = 'none';
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlerts();

    const fullname = document.getElementById('fullname').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!fullname || !username || !password || !confirmPassword) {
      showError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    if (!termsCheckbox.checked) {
      showError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, username, password })
      });

      const data = await res.json();

      if (data.success) {
        showSuccess('Account created successfully! Please sign in.');
        registerForm.reset();
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1800); // brief pause so the user actually sees the message
      } else {
        showError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Register request failed:', err);
      showError('Something went wrong. Please try again.');
    }
  });
});