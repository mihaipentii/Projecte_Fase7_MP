/* 
   logs.js — Energy Logs page (CRUD)
   Handles: table render, add form,
   edit modal, delete, and filters.
 */

let allLogs = [];

//  Table render 
function renderLogsTable(logs) {
  const tbody = document.getElementById('logs-tbody');

  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted" style="padding:2rem">
          No logs found. Add your first energy entry above!
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = logs.map(log => `
    <tr>
      <td>${log.date}</td>
      <td>${log.category}</td>
      <td><span class="badge ${sourceBadgeClass(log.source)}">${log.source}</span></td>
      <td>${log.kwh} kWh</td>
      <td style="color:${co2Color(log.co2kg)}">${log.co2kg} kg</td>
      <td>${log.location || '—'}</td>
      <td class="text-muted text-sm">
        ${log.notes ? log.notes.slice(0, 40) + (log.notes.length > 40 ? '…' : '') : '—'}
      </td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-sm btn-outline" onclick="openEditModal('${log.id}')">Edit</button>
          <button class="btn btn-sm btn-danger"  onclick="deleteLog('${log.id}')">Del</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Client-side filters
function applyFilters() {
  const category = document.getElementById('filter-cat').value.toLowerCase();
  const source   = document.getElementById('filter-src').value.toLowerCase();
  const from     = document.getElementById('filter-from').value;
  const to       = document.getElementById('filter-to').value;

  let filtered = allLogs;

  if (category) filtered = filtered.filter(l => l.category.toLowerCase().includes(category));
  if (source)   filtered = filtered.filter(l => l.source.toLowerCase().includes(source));
  if (from)     filtered = filtered.filter(l => l.date >= from);
  if (to)       filtered = filtered.filter(l => l.date <= to);

  renderLogsTable(filtered);
}

function attachFilterListeners() {
  ['filter-cat', 'filter-src', 'filter-from', 'filter-to'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', applyFilters);
  });
}

// Load and display logs
async function initLogs() {
  try {
    const res = await apiGetLogs();
    allLogs = res.data;
    renderLogsTable(allLogs);
  } catch (err) {
    showToast('Could not load logs — is the server running?', 'error');
  }

  attachFilterListeners();
}

//  Add form submission 
function initAddLogForm() {
  document.getElementById('add-log-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const isValid = validateForm(logValidationRules('add'));
    if (!isValid) return;

    const data = {
      date:     document.getElementById('add-date').value,
      category: document.getElementById('add-category').value,
      source:   document.getElementById('add-source').value,
      kwh:      document.getElementById('add-kwh').value,
      co2kg:    document.getElementById('add-co2').value || 0,
      location: document.getElementById('add-location').value,
      notes:    document.getElementById('add-notes').value
    };

    try {
      await apiCreateLog(data);
      showToast('Energy log added! ⚡');
      this.reset();
      initLogs();
    } catch (err) {
      showToast('Failed to add log', 'error');
    }
  });
}

//  Delete log 
async function deleteLog(id) {
  if (!confirm('Delete this log entry?')) return;

  try {
    await apiDeleteLog(id);
    showToast('Log deleted');
    initLogs();
  } catch (err) {
    showToast('Failed to delete log', 'error');
  }
}

//  Edit modal: open 
async function openEditModal(id) {
  try {
    const res = await apiGetLog(id);
    const log = res.data;

    document.getElementById('edit-id').value       = log.id;
    document.getElementById('edit-date').value     = log.date;
    document.getElementById('edit-category').value = log.category;
    document.getElementById('edit-source').value   = log.source;
    document.getElementById('edit-kwh').value      = log.kwh;
    document.getElementById('edit-co2').value      = log.co2kg;
    document.getElementById('edit-location').value = log.location;
    document.getElementById('edit-notes').value    = log.notes;

    openModal('edit-modal');
  } catch (err) {
    showToast('Could not load log data', 'error');
  }
}

//  Edit modal: close 
function closeEditModal() {
  closeModal('edit-modal');
}

//  Edit form submission 
function initEditLogForm() {
  document.getElementById('edit-log-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const isValid = validateForm(logValidationRules('edit'));
    if (!isValid) return;

    const id = document.getElementById('edit-id').value;
    const data = {
      date:     document.getElementById('edit-date').value,
      category: document.getElementById('edit-category').value,
      source:   document.getElementById('edit-source').value,
      kwh:      document.getElementById('edit-kwh').value,
      co2kg:    document.getElementById('edit-co2').value,
      location: document.getElementById('edit-location').value,
      notes:    document.getElementById('edit-notes').value
    };

    try {
      await apiUpdateLog(id, data);
      showToast('Log updated successfully');
      closeEditModal();
      initLogs();
    } catch (err) {
      showToast('Failed to update log', 'error');
    }
  });
}
