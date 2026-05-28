// This file controls which page is visible in the app.
// It also highlights the active nav link and runs page-specific code when you switch pages.

// Map of pageId → init function (set by each module)
const pageInitHandlers = {};

function registerPageInit(pageId, fn) {
  pageInitHandlers[pageId] = fn;
}

function showPage(pageId) {
  // Show/hide pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === pageId);
  });

  // Update active nav link
  document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  window.scrollTo(0, 0);

  // Call page-specific init if registered
  if (pageInitHandlers[pageId]) {
    pageInitHandlers[pageId]();
  }
}

function initRouter() {
  document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // Default page on load
  showPage('page-home');
}
