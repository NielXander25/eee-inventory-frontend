const API_URL = 'http://localhost:5000/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('errorMessage');

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorDiv.textContent = data.message || 'Login failed';
      return;
    }

    // ✅ Save auth data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // ✅ Go to app
    window.location.href = '../index.html';

  } catch (err) {
    errorDiv.textContent = 'Server error. Try again.';
  }
});
