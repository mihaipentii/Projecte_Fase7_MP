// This is the main entry point for the app.
// It sets up which code runs for each page, and starts everything up when the site loads.

// Register page-specific init functions 
registerPageInit('page-login',       initLoginPage);
registerPageInit('page-home',        () => { if (requireLogin()) initHome(); });
registerPageInit('page-logs',        () => { if (requireLogin()) initLogs(); });
registerPageInit('page-dashboard',   () => { if (requireLogin()) initDashboard(); });
registerPageInit('page-calculator',  initCalculator);

//  Boot sequence 
initTheme();        // ui.js to apply saved dark/light mode
initLoginForm();    // auth.js to attach login form submit
initLogoutButton(); // auth.js to attach logout button
initAddLogForm();   // logs.js to attach add-log form submit
initEditLogForm();  // logs.js to attach edit-log form submit

// Check session and then start router
initAuth().then(() => {
  initRouter();   // router.js to attach nav links, show default page
});