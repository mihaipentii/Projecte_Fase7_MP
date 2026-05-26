/* 
   auth.js — Authentication module
   Handles login, logout, session check,
   and protecting the UI when logged out. */

// Current session user (null = not logged in)
let currentUser = null;

//  API calls 

async function apiLogin(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

async function apiLogout() {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  return res.json();
}

async function apiGetMe() {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  return res.json();
}

//  Session check on page load 
async function initAuth() {
  const res = await apiGetMe().catch(() => ({ success: false }));

  if (res.success) {
    setLoggedIn(res.user);
  } else {
    setLoggedOut();
    showPage('page-login');
  }
}

//  State helpers 

function setLoggedIn(user) {
  currentUser = user;

  // Show/hide navbar items
  document.getElementById('nav-app-links').style.display = 'flex';
  document.getElementById('nav-logout-btn').style.display = 'flex';
  document.getElementById('nav-user-name').textContent = user.name;

  // Show admin badge if applicable
  const adminBadge = document.getElementById('nav-admin-badge');
  if (adminBadge) adminBadge.style.display = user.role === 'admin' ? 'inline' : 'none';
}

function setLoggedOut() {
  currentUser = null;
  document.getElementById('nav-app-links').style.display = 'none';
  document.getElementById('nav-logout-btn').style.display = 'none';
}

//  Login form handler 

function initLoginPage() {
  // If already logged in, skip to home
  if (currentUser) {
    showPage('page-home');
    return;
  }

  document.getElementById('login-error').textContent = '';
}

function initLoginForm() {
  document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl  = document.getElementById('login-error');
    const btn      = document.getElementById('login-btn');

    // Client-side validation
    if (!username || !password) {
      errorEl.textContent = 'Please enter both username and password.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in…';
    errorEl.textContent = '';

    try {
      const res = await apiLogin(username, password);

      if (res.success) {
        setLoggedIn(res.user);
        showToast(`Welcome back, ${res.user.name}! ⚡`);
        this.reset();
        showPage('page-home');
      } else {
        errorEl.textContent = res.message || 'Invalid credentials.';
      }
    } catch (err) {
      errorEl.textContent = 'Could not reach the server. Is it running?';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

//  Logout button 

function initLogoutButton() {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await apiLogout().catch(() => {});
    setLoggedOut();
    showToast('Logged out successfully');
    showPage('page-login');
  });
}

// require login
function requireLogin() {
  if (!currentUser) {
    showToast('Please log in first', 'error');
    showPage('page-login');
    return false;
  }
  return true;
}