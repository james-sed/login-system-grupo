document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('reset-email-box');
  const step2 = document.getElementById('new-pass-box');

  const emailForm = document.getElementById('emailForm');
  const errorBox1 = document.getElementById('errorMsg1');

  const resetForm = document.getElementById('resetForm');
  const errorBox2 = document.getElementById('errorMsg2');
  const successBox2 = document.getElementById('successMsg2');

  let confirmedEmail = ''; // carried over from step 1 into step 2

  function showError(box, message) {
    box.querySelector('.alert-text').textContent = message;
    box.style.display = 'flex';
  }

  function hideError(box) {
    box.style.display = 'none';
  }

  // STEP 1: check the email exists, then reveal step 2
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorBox1);

    const email = document.getElementById('email').value.trim();

    if (!email) {
      showError(errorBox1, 'Please enter your email.');
      return;
    }

    try {
      const res = await fetch('/api/user/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        confirmedEmail = email;
        step1.style.display = 'none';
        step2.style.display = 'block';
      } else {
        showError(errorBox1, data.message || 'Email not found.');
      }
    } catch (err) {
      console.error('Email check failed:', err);
      showError(errorBox1, 'Something went wrong. Please try again.');
    }
  });

  // STEP 2: set the new password
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorBox2);
    successBox2.style.display = 'none';

    const password = document.getElementById('newpwd').value;
    const confirmPassword = document.getElementById('confirmnewpwd').value;

    if (!password || !confirmPassword) {
      showError(errorBox2, 'Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      showError(errorBox2, 'Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/user/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: confirmedEmail,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        resetForm.reset();
        successBox2.style.display = 'flex';
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1800);
      } else {
        showError(errorBox2, data.message || 'Password reset failed. Please try again.');
      }
    } catch (err) {
      console.error('Reset request failed:', err);
      showError(errorBox2, 'Something went wrong. Please try again.');
    }
  });
});