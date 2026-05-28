// A file for the Dashboard page.

//  Main init 
async function initDashboard() {
  try {
    // Fetch logs and stats in parallel
    const [logsRes, statsRes] = await Promise.all([
      apiGetLogs(),
      apiGetStats()
    ]);

    const logs  = logsRes.data;
    const stats = statsRes.data;

    updateSummaryCards(stats);
    renderSourceChart(stats.bySource);
    renderCategoryTable(stats.byCategory);
    renderRecentLogs(logs.slice(-5).reverse());

  } catch (err) {
    showToast('Dashboard: could not reach server', 'error');
    renderEmptyDashboard();
  }
}

//  Summary stat cards 
function updateSummaryCards(stats) {
  document.getElementById('dash-total-kwh').textContent = stats.totalKwh.toFixed(1);
  document.getElementById('dash-total-co2').textContent = stats.totalCo2.toFixed(2);
  document.getElementById('dash-log-count').textContent = stats.totalLogs;
}

//  Bar chart: kWh by source 
function renderSourceChart(bySource) {
  const container = document.getElementById('source-chart');
  const entries   = Object.entries(bySource).sort((a, b) => b[1].kwh - a[1].kwh);

  if (entries.length === 0) {
    container.innerHTML = '<p class="text-muted text-sm">No data yet.</p>';
    return;
  }

  const maxKwh = Math.max(...entries.map(e => e[1].kwh));

  // Build chart HTML
  const chartWrap = document.createElement('div');
  chartWrap.style.cssText = 'display:flex;align-items:flex-end;gap:12px;height:180px;width:100%';

  entries.forEach(([source, data]) => {
    const heightPct = (data.kwh / maxKwh) * 100;
    const barClass  = getBarClass(source);

    const col = document.createElement('div');
    col.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%';
    col.innerHTML = `
      <div style="margin-top:auto;width:100%">
        <div class="chart-bar ${barClass}" style="height:${heightPct}%"
             title="${source}: ${data.kwh.toFixed(1)} kWh">
        </div>
      </div>
      <div style="font-size:0.7rem;color:var(--text2);text-align:center;line-height:1.2">${source}</div>
      <div style="font-size:0.72rem;color:var(--text3)">${data.kwh.toFixed(1)}</div>
    `;
    chartWrap.appendChild(col);
  });

  container.innerHTML = '';
  container.appendChild(chartWrap);
}

// Returns CSS class for chart bar based on source name
function getBarClass(source) {
  const s = source.toLowerCase();
  if (s.includes('nuclear')) return 'nuclear';
  if (s.includes('solar'))   return 'solar';
  if (s.includes('wind'))    return 'wind';
  if (s.includes('gas') || s.includes('coal') || s.includes('gasoline')) return 'fossil';
  return '';
}

//  Category breakdown table 
function renderCategoryTable(byCategory) {
  const tbody    = document.getElementById('cat-tbody');
  const entries  = Object.entries(byCategory).sort((a, b) => b[1].kwh - a[1].kwh);
  const totalKwh = entries.reduce((sum, e) => sum + e[1].kwh, 0);

  tbody.innerHTML = entries.map(([category, data]) => {
    const sharePct = totalKwh > 0 ? ((data.kwh / totalKwh) * 100).toFixed(1) : 0;

    return `
      <tr>
        <td>${category}</td>
        <td>${data.kwh.toFixed(1)} kWh</td>
        <td>${data.co2kg.toFixed(2)} kg</td>
        <td>${data.count}</td>
        <td>
          <div class="progress-bar-wrap" style="width:120px">
            <div class="progress-bar" style="width:${sharePct}%"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

//  Recent activity list 
function renderRecentLogs(logs) {
  const container = document.getElementById('recent-logs');

  if (logs.length === 0) {
    container.innerHTML = '<p class="text-muted">No recent logs.</p>';
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="flex-between" style="padding:0.75rem 0;border-bottom:1px solid var(--border)">
      <div>
        <div class="text-sm font-bold">
          ${log.category}
          <span class="badge ${sourceBadgeClass(log.source)}">${log.source}</span>
        </div>
        <div class="text-xs text-muted mt-1">${log.date} · ${log.location || 'N/A'}</div>
      </div>
      <div class="text-right">
        <div class="text-sm font-bold text-accent">${log.kwh} kWh</div>
        <div class="text-xs text-muted">${log.co2kg} kg CO₂</div>
      </div>
    </div>
  `).join('');
}

// Fallback when server is offline 
function renderEmptyDashboard() {
  document.getElementById('dash-total-kwh').textContent = '—';
  document.getElementById('dash-total-co2').textContent = '—';
  document.getElementById('dash-log-count').textContent = '—';
  document.getElementById('source-chart').innerHTML     = '<p class="text-muted text-sm">Start the Node.js server to see charts.</p>';
  document.getElementById('cat-tbody').innerHTML        = '';
  document.getElementById('recent-logs').innerHTML      = '<p class="text-muted">Start the server to load data.</p>';
}
