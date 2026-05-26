/* 
   home.js — Home page
   Loads summary stats from API and
   updates the hero stat cards.
 */

// Average EU household annual consumption in kWh (rough estimate)
const EU_AVG_KWH_YEAR = 3500;

async function initHome() {
  try {
    const res   = await apiGetStats();
    const stats = res.data;

    document.getElementById('home-total-kwh').textContent  = stats.totalKwh.toFixed(1);
    document.getElementById('home-total-co2').textContent  = stats.totalCo2.toFixed(1);
    document.getElementById('home-total-logs').textContent = stats.totalLogs;

    // How many kWh below the EU average
    const savedKwh = Math.max(0, EU_AVG_KWH_YEAR - stats.totalKwh);
    document.getElementById('home-saved').textContent = savedKwh.toFixed(0);

  } catch (err) {
    // Server not running — show dashes instead of crashing
    ['home-total-kwh', 'home-total-co2', 'home-total-logs', 'home-saved'].forEach(id => {
      document.getElementById(id).textContent = '—';
    });
  }
}
