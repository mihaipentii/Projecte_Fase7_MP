/* 
   ui.js — Shared UI utilities
   Toast notifications, dark mode toggle,
   badge helpers, and form validation.
 */

//  Toast notifications 
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

//  Dark mode 
function applyTheme(isLight) {
  document.body.classList.toggle('light', isLight);
  document.getElementById('darkToggle').textContent = isLight ? '🌙 Dark' : '☀️ Light';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function initTheme() {
  const saved = localStorage.getItem('theme') === 'light';
  applyTheme(saved);
  document.getElementById('darkToggle').addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('light'));
  });
}

//  Source → badge CSS class 
function sourceBadgeClass(source) {
  const s = source.toLowerCase();
  if (s.includes('nuclear'))                              return 'badge-purple';
  if (s.includes('solar'))                               return 'badge-yellow';
  if (s.includes('wind'))                                return 'badge-blue';
  if (s.includes('gas') || s.includes('coal') || s.includes('gasoline')) return 'badge-red';
  return 'badge-green';
}

//  CO₂ value → color 
function co2Color(kg) {
  if (kg < 1) return 'var(--accent)';
  if (kg < 5) return 'var(--solar)';
  return 'var(--fossil)';
}

//  Form validation 
// Each rule: { id, msg, test(value) → bool }
function validateForm(rules) {
  let isValid = true;

  rules.forEach(rule => {
    const input = document.getElementById(rule.id);
    const group = input.closest('.form-group');
    const value = input.value.trim();

    if (!rule.test(value)) {
      group.classList.add('invalid');
      group.querySelector('.error-msg').textContent = rule.msg;
      isValid = false;
    } else {
      group.classList.remove('invalid');
    }
  });

  return isValid;
}

// Reusable validation rules for log forms
function logValidationRules(prefix) {
  return [
    {
      id: `${prefix}-date`,
      msg: 'Date is required',
      test: v => v !== ''
    },
    {
      id: `${prefix}-category`,
      msg: 'Category is required',
      test: v => v !== ''
    },
    {
      id: `${prefix}-source`,
      msg: 'Energy source is required',
      test: v => v !== ''
    },
    {
      id: `${prefix}-kwh`,
      msg: 'kWh must be a positive number',
      test: v => v !== '' && !isNaN(v) && parseFloat(v) >= 0
    }
  ];
}

//  Modal helpers 
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
