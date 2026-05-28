/* 
   calculator.js — CO₂ Calculator page
   Calculates emissions from kWh + source
   using IPCC lifecycle emission factors.
 */

// kg CO2 emitted per kWh — IPCC median lifecycle values
const EMISSION_FACTORS = {
  'Coal':                           0.820,
  'Natural Gas':                    0.490,
  'Oil/Gasoline':                   0.650,
  'Nuclear Grid':                   0.012,
  'Solar':                          0.020,
  'Wind':                           0.011,
  'Hydropower':                     0.024,
  'Electric Vehicle (avg grid)':    0.100
};

// kg CO₂ absorbed by one tree per year (average)
const CO2_PER_TREE_PER_YEAR = 21;

//  Main init 
function initCalculator() {
  const sourceSelect = document.getElementById('calc-source');
  const kwhInput     = document.getElementById('calc-kwh');

  sourceSelect.addEventListener('change', renderCalculatorResult);
  kwhInput.addEventListener('input', renderCalculatorResult);
}

// Calculate and render result 
function renderCalculatorResult() {
  const source = document.getElementById('calc-source').value;
  const kwh    = parseFloat(document.getElementById('calc-kwh').value);
  const result = document.getElementById('calc-result');

  // Clear result if inputs are incomplete
  if (!source || isNaN(kwh) || kwh <= 0) {
    result.innerHTML = '';
    return;
  }

  const factor  = EMISSION_FACTORS[source] || 0;
  const co2     = (kwh * factor).toFixed(3);
  const trees   = (co2 / CO2_PER_TREE_PER_YEAR).toFixed(2);
  const isClean = factor < 0.05;

  result.innerHTML = buildResultCard(source, kwh, factor, co2, trees, isClean);
}

// Build result HTML 
function buildResultCard(source, kwh, factor, co2, trees, isClean) {
  const co2Color  = isClean ? 'var(--accent)' : 'var(--fossil)';
  const badgeHtml = isClean
    ? '<span class="badge badge-green">✅ Clean source</span>'
    : '<span class="badge badge-red">⚠️ Emitting source</span>';

  const switchTip = isClean ? '' : buildSwitchTip(kwh, factor);

  return `
    <div class="card glow" style="margin-top:1.5rem">
      <div class="flex-between mb-2">
        <h4>Estimated Emissions</h4>
        ${badgeHtml}
      </div>

      <div style="font-size:2.5rem;font-weight:700;color:${co2Color}">
        ${co2}
        <span style="font-size:1rem;font-weight:400;color:var(--text2)">kg CO₂</span>
      </div>

      <p class="text-sm text-muted mt-2">
        For <strong>${kwh} kWh</strong> from <strong>${source}</strong>
        (factor: ${factor} kg CO₂/kWh)
      </p>
      <p class="text-sm text-muted mt-1">
        Equivalent to planting <strong>${trees} trees</strong> to offset over 1 year.
      </p>

      ${switchTip}
    </div>
  `;
}

// Tip shown when source is not clean
function buildSwitchTip(kwh, currentFactor) {
  const nuclearCo2    = (kwh * EMISSION_FACTORS['Nuclear Grid']).toFixed(3);
  const reductionPct  = Math.round((1 - EMISSION_FACTORS['Nuclear Grid'] / currentFactor) * 100);

  return `
    <p class="text-sm" style="color:var(--solar);margin-top:0.75rem">
      💡 Switching to Nuclear or Solar would reduce this to
      <strong>${nuclearCo2} kg</strong> —
      a <strong>${reductionPct}%</strong> reduction.
    </p>
  `;
}
