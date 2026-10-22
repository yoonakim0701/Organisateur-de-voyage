/**
 * ESPAGNE 2027 - BUDGET MANAGEMENT WITH EXACT DIRECT EURO SLIDERS
 * Curseurs configurés :
 * - Budget Global : 0 à 1 500 € (Augmenté à 1 500 €)
 * - Budget Hôtel : 0 à 600 €
 * - Vol et Transports : 0 à 200 €
 * - Activités et Visites : 0 à 300 €
 * - Restauration : 0 à 200 €
 * - Shopping et Souvenirs : 0 à 600 € (Augmenté à 600 €)
 * - Réserve Imprévus : 0 à 200 €
 * + Contrôle Calendrier des Dates & Nombre de Voyageurs
 * + Option : "Diviser le prix par [nombre de voyageurs]"
 */

const BudgetManager = {
  categories: [
    { key: 'hotels', label: 'Budget Hôtel', icon: '🏨', color: '#E05D6D', min: 0, max: 600, default: 400 },
    { key: 'flights', label: 'Vol et Transports', icon: '✈️', color: '#3182CE', min: 0, max: 200, default: 200 },
    { key: 'activities', label: 'Activités et Visites', icon: '🎟️', color: '#D69E2E', min: 0, max: 300, default: 250 },
    { key: 'food', label: 'Restauration', icon: '🥘', color: '#E66A38', min: 0, max: 200, default: 200 },
    { key: 'shopping', label: 'Shopping et Souvenirs', icon: '🛍️', color: '#9F7AEA', min: 0, max: 600, default: 300 }, // Max 600 €
    { key: 'emergency', label: 'Réserve Imprévus', icon: '🛡️', color: '#38A169', min: 0, max: 200, default: 150 }
  ],

  init() {
    this.render();
    this.attachEvents();
  },

  getCategoryRealCost(categoryKey) {
    const data = TripState.data;
    if (!data) return 0;

    switch (categoryKey) {
      case 'hotels':
        return (data.hotels || [])
          .filter(h => h.status === 'selected')
          .reduce((sum, h) => sum + (Number(h.pricePerNight) * Number(h.nights)), 0);

      case 'flights':
        return (data.flights || [])
          .reduce((sum, f) => {
            const travelers = Number(data.travelersCount) || 1;
            const price = f.pricePerPerson ? (Number(f.pricePerPerson) * travelers) : (Number(f.totalPrice) || 0);
            return sum + price;
          }, 0);

      case 'activities':
        const travelers = Number(data.travelersCount) || 1;
        return (data.activities || [])
          .filter(a => a.booked)
          .reduce((sum, a) => sum + (Number(a.pricePerPerson) * travelers), 0);

      case 'food':
        return 0;

      case 'shopping':
        return 0;

      case 'emergency':
        return 0;

      default:
        return 0;
    }
  },

  getTotalRealCost() {
    return this.categories.reduce((total, cat) => total + this.getCategoryRealCost(cat.key), 0);
  },

  getCategoriesSum() {
    const data = TripState.data;
    if (!data || !data.categoryBudgets) return 0;
    return this.categories.reduce((sum, cat) => {
      return sum + (Number(data.categoryBudgets[cat.key]) || 0);
    }, 0);
  },

  render() {
    const container = document.getElementById('budget-section-content');
    if (!container) return;

    const data = TripState.data;
    const globalBudget = Number(data.totalBudget) || 1500;
    const travelers = Number(data.travelersCount) || 1;
    const totalDays = Number(data.totalDays) || 6;
    const totalNights = Number(data.totalNights) || Math.max(1, totalDays - 1);
    const startDate = data.startDate || '2027-05-15';
    const endDate = data.endDate || '2027-05-20';
    const isDivided = !!data.divideByTravelers;

    const sumCategories = this.getCategoriesSum();
    const totalRealCost = this.getTotalRealCost();
    const diffWithGlobal = globalBudget - sumCategories;
    const remainingReal = globalBudget - totalRealCost;
    
    // Valeurs par personne (divisées)
    const perPersonBudget = Math.round(globalBudget / Math.max(1, travelers));
    const perPersonSumCategories = Math.round(sumCategories / Math.max(1, travelers));
    const perPersonRealCost = Math.round(totalRealCost / Math.max(1, travelers));
    const perDayBudget = Math.round(globalBudget / Math.max(1, totalDays));

    let slidersHtml = '';

    this.categories.forEach(cat => {
      const allocated = Number(data.categoryBudgets[cat.key]) || cat.default || 0;
      const realCost = this.getCategoryRealCost(cat.key);
      const isOverBudget = realCost > 0 && realCost > allocated;
      const diff = realCost - allocated;
      const percentOfGlobal = globalBudget > 0 ? Math.round((allocated / globalBudget) * 100) : 0;
      const allocatedPerPerson = Math.round(allocated / Math.max(1, travelers));
      const realPerPerson = Math.round(realCost / Math.max(1, travelers));

      slidersHtml += `
        <div class="slider-card" data-category="${cat.key}">
          <div class="slider-header">
            <div class="slider-title">
              <span class="category-icon" style="background:${cat.color}20; color:${cat.color}">${cat.icon}</span>
              <div>
                <strong>${cat.label}</strong>
                <div class="slider-subtext">
                  Curseur : <span class="badge-allocated" style="color:${cat.color}">0 à ${cat.max} €</span>
                  ${realCost > 0 ? `
                    <span class="badge-real">
                      Engagé : ${isDivided ? `${realPerPerson.toLocaleString('fr-FR')} €/pers (${realCost} € total)` : `${realCost.toLocaleString('fr-FR')} €`}
                    </span>` : ''
                  }
                </div>
              </div>
            </div>
            <div class="slider-values">
              <span class="euro-badge-value" id="val-amount-${cat.key}">
                ${isDivided ? `${allocatedPerPerson.toLocaleString('fr-FR')} € <small class="unit-tag">/ pers</small>` : `${allocated.toLocaleString('fr-FR')} €`}
              </span>
              <span class="sub-percent-tag" id="val-sub-${cat.key}">
                ${isDivided ? `Total groupe : ${allocated.toLocaleString('fr-FR')} € (${percentOfGlobal}%)` : `Soit ~${allocatedPerPerson.toLocaleString('fr-FR')} € / pers (${percentOfGlobal}%)`}
              </span>
            </div>
          </div>

          <div class="slider-input-container">
            <input 
              type="range" 
              id="slider-${cat.key}" 
              class="budget-slider" 
              min="${cat.min}" 
              max="${cat.max}" 
              step="5" 
              value="${allocated}"
              data-cat="${cat.key}"
              style="accent-color: ${cat.color}"
            />
          </div>

          <div class="slider-meta">
            <span>${cat.min} €</span>
            <span class="per-day-cat">
              ~${Math.round(allocated / Math.max(1, totalDays))} € / jour ${isDivided ? `(~${Math.round(allocatedPerPerson / Math.max(1, totalDays))} €/j/pers)` : ''}
            </span>
            <span>Max : <strong>${cat.max} €</strong></span>
          </div>

          ${isOverBudget ? `
            <div class="budget-alert-warning">
              ⚠️ Attention : Vos réservations réelles (${realCost.toLocaleString('fr-FR')} €) dépassent le curseur fixé à ${allocated} € (+${diff.toLocaleString('fr-FR')} €).
            </div>
          ` : ''}
        </div>
      `;
    });

    container.innerHTML = `
      <!-- BARRE DE CONTRÔLES DIRECTS : CALENDRIER, VOYAGEURS & OPTION DE DIVISION -->
      <div class="trip-controls-card">
        <div class="trip-controls-header">
          <div class="controls-title">
            <span class="controls-pill">⚙️ Paramètres Directs du Voyage</span>
            <h3>Calendrier des Dates, Voyageurs & Option de Division</h3>
          </div>
          <div class="controls-quick-stats">
            <span class="tag-highlight">📅 ${totalNights} nuits · ${totalDays} jours</span>
            <span class="tag-highlight">👥 ${travelers} voyageur${travelers > 1 ? 's' : ''}</span>
            <span class="tag-highlight ${isDivided ? 'tag-active-mode' : ''}">
              ${isDivided ? `👤 Mode Divisé par ${travelers}` : `👥 Mode Total Groupe`}
            </span>
          </div>
        </div>

        <div class="trip-controls-grid">
          
          <!-- 1. SÉLECTEUR DE DATES (CALENDRIER) -->
          <div class="control-box">
            <label class="control-box-title">
              <span>📅</span> Choisir les Dates du Séjour (Calendrier) :
            </label>
            <div class="calendar-inputs-row">
              <div class="cal-field">
                <span class="cal-tag">🛫 Départ</span>
                <input type="date" id="calendar-start-date" value="${startDate}" class="input-date-custom" />
              </div>
              <div class="cal-arrow">➔</div>
              <div class="cal-field">
                <span class="cal-tag">🛬 Retour</span>
                <input type="date" id="calendar-end-date" value="${endDate}" class="input-date-custom" />
              </div>
            </div>
            <div class="control-subtext" id="calendar-summary-text">
              Du <strong>${this.formatDateFR(startDate)}</strong> au <strong>${this.formatDateFR(endDate)}</strong> (${totalDays} jours / ${totalNights} nuits)
            </div>
          </div>

          <!-- 2. SÉLECTEUR DU NOMBRE DE VOYAGEURS -->
          <div class="control-box">
            <label class="control-box-title">
              <span>👥</span> Nombre de Voyageurs :
            </label>
            <div class="travelers-picker-row">
              <button class="btn-picker-step" id="btn-traveler-minus" title="Moins de voyageurs">−</button>
              <div class="travelers-count-display">
                <strong id="travelers-display-num">${travelers}</strong>
                <span class="travelers-label">voyageur${travelers > 1 ? 's' : ''}</span>
              </div>
              <button class="btn-picker-step" id="btn-traveler-plus" title="Plus de voyageurs">+</button>
              
              <div class="travelers-presets">
                <button class="btn-chip-traveler ${travelers === 1 ? 'active' : ''}" data-travelers="1">Solo (1)</button>
                <button class="btn-chip-traveler ${travelers === 2 ? 'active' : ''}" data-travelers="2">Duo (2)</button>
                <button class="btn-chip-traveler ${travelers === 3 ? 'active' : ''}" data-travelers="3">Trio (3)</button>
                <button class="btn-chip-traveler ${travelers === 4 ? 'active' : ''}" data-travelers="4">Groupe (4)</button>
              </div>
            </div>
            <div class="control-subtext">
              Sélectionnez le nombre de personnes pour calculer la division du prix.
            </div>
          </div>

        </div>

        <!-- 3. OPTION : DIVISER LE PRIX PAR [NOMBRE DE VOYAGEUR] -->
        <div class="divide-option-bar ${isDivided ? 'divide-bar-active' : ''}">
          <div class="divide-option-inner">
            <label class="toggle-switch-wrapper" for="toggle-divide-price">
              <input type="checkbox" id="toggle-divide-price" ${isDivided ? 'checked' : ''} />
              <span class="toggle-switch-slider"></span>
            </label>
            <div class="divide-text-block">
              <label for="toggle-divide-price" class="divide-main-clickable">
                <strong class="divide-label-title">Diviser le prix par ${travelers} voyageur${travelers > 1 ? 's' : ''}</strong>
                <span class="divide-badge-pill ${isDivided ? 'pill-on' : 'pill-off'}">
                  ${isDivided ? `Activé (÷${travelers})` : 'Désactivé'}
                </span>
              </label>
              <p class="divide-explanation">
                ${isDivided 
                  ? `✔ Les montants du budget global et de chaque curseur sont maintenant affichés <strong>par voyageur (${travelers} pers)</strong>.` 
                  : `Basculez cette option pour convertir instantanément toutes les sommes en tarif individuel par personne.`
                }
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- SYNTHÈSE DES MÉTRIQUES DU BUDGET -->
      <div class="budget-summary-grid">
        
        <!-- Métrique 1 : Budget Global -->
        <div class="metric-card highlight-metric">
          <div class="metric-label">
            ${isDivided ? `Budget / Voyageur (÷${travelers})` : `Budget Global (0 - 1 500 €)`}
          </div>
          <div class="metric-value text-primary" id="disp-total-budget">
            ${isDivided ? `${perPersonBudget.toLocaleString('fr-FR')} €` : `${globalBudget.toLocaleString('fr-FR')} €`}
          </div>
          <div class="metric-sub" id="disp-total-budget-sub">
            ${isDivided 
              ? `Total groupe : <strong>${globalBudget.toLocaleString('fr-FR')} €</strong> pour ${travelers} pers` 
              : `Soit <strong>~${perPersonBudget.toLocaleString('fr-FR')} €</strong> / voyageur`
            }
          </div>
        </div>

        <!-- Métrique 2 : Somme des Curseurs Catégories -->
        <div class="metric-card">
          <div class="metric-label">
            ${isDivided ? `Total Curseurs / Voyageur` : `Somme des Curseurs Catégories`}
          </div>
          <div class="metric-value ${diffWithGlobal === 0 ? 'text-success' : (diffWithGlobal < 0 ? 'text-danger' : 'text-warning')}" id="disp-sum-categories">
            ${isDivided ? `${perPersonSumCategories.toLocaleString('fr-FR')} €` : `${sumCategories.toLocaleString('fr-FR')} €`}
          </div>
          <div class="metric-sub" id="disp-categories-status">
            ${diffWithGlobal === 0 
              ? '✔ Égal au budget global fixé' 
              : (diffWithGlobal > 0 
                  ? `<span>Reste à allouer : <strong>+${diffWithGlobal} €</strong> ${isDivided ? `(+${Math.round(diffWithGlobal/travelers)} €/p)` : ''}</span>` 
                  : `<span style="color:#e53e3e;">Dépassement global : <strong>+${Math.abs(diffWithGlobal)} €</strong></span>`
                )
            }
          </div>
        </div>

        <!-- Métrique 3 : Par Jour -->
        <div class="metric-card">
          <div class="metric-label">Par Jour ${isDivided ? '& Par Pers' : 'Global'}</div>
          <div class="metric-value text-accent">
            ${isDivided ? `${Math.round(perPersonBudget / Math.max(1, totalDays)).toLocaleString('fr-FR')} €` : `${perDayBudget.toLocaleString('fr-FR')} €`}
          </div>
          <div class="metric-sub">
            ${isDivided 
              ? `Sur une base de ${totalDays} jours en Espagne` 
              : `Soit ~${Math.round(perPersonBudget / Math.max(1, totalDays))} € / jour / personne`
            }
          </div>
        </div>

        <!-- Métrique 4 : Total Réel Engagé -->
        <div class="metric-card ${remainingReal < 0 ? 'metric-danger' : 'metric-success'}">
          <div class="metric-label">
            ${isDivided ? `Engagé / Voyageur` : `Total Engagé (Hôtels + Vols)`}
          </div>
          <div class="metric-value">
            ${isDivided ? `${perPersonRealCost.toLocaleString('fr-FR')} €` : `${totalRealCost.toLocaleString('fr-FR')} €`}
          </div>
          <div class="metric-sub">
            ${remainingReal >= 0 
              ? `<span style="color:#38a169;">✔ Marge restante : ${isDivided ? Math.round(remainingReal/travelers) + ' €/p' : remainingReal + ' €'}</span>`
              : `<span style="color:#e53e3e;">⚠ Dépassement : +${Math.abs(remainingReal)} €</span>`
            }
          </div>
        </div>

      </div>

      <!-- MAIN PLAYGROUND : CURSEURS À GAUCHE + GRAPHIQUE DONUT À DROITE -->
      <div class="budget-main-layout">
        
        <!-- Colonne Gauche : Curseurs Spécifiques Demandés -->
        <div class="sliders-column">
          <div class="panel-card">
            
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Curseurs de Répartition du Budget</h3>
                <p class="panel-desc">
                  ${isDivided 
                    ? `Les curseurs règlent le budget global du groupe (0 à 1 500 €), avec conversion immédiate par voyageur.` 
                    : `Ajustez les curseurs pour définir le montant alloué à chaque poste de dépense.`
                  }
                </p>
              </div>
              <div class="global-budget-control">
                <label for="global-budget-input">Budget Global :</label>
                <div class="input-with-action">
                  <input type="number" id="global-budget-input" value="${globalBudget}" min="0" max="1500" step="10" class="input-number-styled" />
                  <span class="currency-tag">€</span>
                </div>
              </div>
            </div>

            <!-- Curseur Budget Global 0 à 1 500 € -->
            <div class="global-slider-bar">
              <div class="global-bar-header">
                <label>
                  Curseur Budget Global : <strong id="global-slider-val-text">${globalBudget.toLocaleString('fr-FR')} €</strong> / 1 500 €
                  ${isDivided ? `<span class="tag-divided-note">(Soit <strong>${perPersonBudget} €</strong> / voyageur)</span>` : ''}
                </label>
                <button id="btn-sync-global-sum" class="btn-micro" title="Ajuster le budget global sur la somme des catégories">
                  Aligner sur les catégories (${sumCategories} €)
                </button>
              </div>
              <input type="range" id="global-budget-slider" min="0" max="1500" step="10" value="${globalBudget}" class="budget-slider range-primary" />
              <div class="slider-meta">
                <span>0 € (Minimum)</span>
                <span>750 € (Moyen)</span>
                <span>Max : <strong>1 500 €</strong></span>
              </div>
            </div>

            <!-- Liste des 6 Curseurs de Catégories Demandés -->
            <div class="sliders-list">
              ${slidersHtml}
            </div>

            <!-- Préréglages et Réinitialisation -->
            <div class="budget-actions-footer">
              <button id="btn-preset-max-sliders" class="btn-secondary-sm">🚀 Plafond Maximal (1 500 €)</button>
              <button id="btn-preset-default-sliders" class="btn-secondary-sm">⚖️ Formule Confort (1 000 €)</button>
              <button id="btn-preset-eco-sliders" class="btn-secondary-sm">🎒 Formule Éco (650 €)</button>
              <button id="btn-reset-budget" class="btn-secondary-sm">🔄 Réinitialiser</button>
            </div>

          </div>
        </div>

        <!-- Colonne Droite : Donut Chart & Jauges Comparatives -->
        <div class="chart-column">
          <div class="panel-card sticky-panel">
            <h3 class="panel-title">Visualisation de la Répartition</h3>
            <p class="panel-desc">Graphique interactif des curseurs en euros</p>
            
            <div id="donut-chart-container" class="donut-chart-wrapper">
              <!-- SVG Donut Chart dynamique -->
            </div>

            <div class="comparison-bars-wrapper" id="comparison-bars">
              <!-- Jauges Engagé vs Alloué par Curseur -->
            </div>

            <div class="budget-tip-card">
              <div class="tip-icon">🇪🇸</div>
              <div class="tip-content">
                <strong>Budget Espagne 2027 :</strong>
                <span>Avec un budget global porté à <strong>1 500 €</strong> et un curseur shopping à <strong>600 €</strong>, vous disposez d'un confort idéal pour ramener artisanat, jambon ibérique et souvenirs andalous !</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.renderDonutChart();
    this.renderComparisonBars();
    this.attachEvents();
  },

  renderDonutChart() {
    const container = document.getElementById('donut-chart-container');
    if (!container) return;

    const data = TripState.data;
    const globalBudget = Number(data.totalBudget) || 1500;
    const travelers = Number(data.travelersCount) || 1;
    const isDivided = !!data.divideByTravelers;
    const sumCategories = this.getCategoriesSum();
    const baseTotal = sumCategories > 0 ? sumCategories : (globalBudget > 0 ? globalBudget : 1);

    let cumulativePercent = 0;
    const slices = [];

    this.categories.forEach(cat => {
      const amount = Number(data.categoryBudgets[cat.key]) || 0;
      if (amount <= 0) return;

      const percent = (amount / baseTotal) * 100;
      const startAngle = (cumulativePercent / 100) * 360;
      cumulativePercent += percent;
      const endAngle = (cumulativePercent / 100) * 360;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const r = 80;
      const cx = 110;
      const cy = 110;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArcFlag = percent > 50 ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      const displayVal = isDivided 
        ? `${Math.round(amount / travelers)} €/pers`
        : `${amount} €`;

      slices.push(`
        <path 
          d="${pathData}" 
          fill="${cat.color}" 
          opacity="0.92"
          class="donut-slice"
          data-cat="${cat.key}"
        >
          <title>${cat.label}: ${displayVal} (${Math.round(percent)}%)</title>
        </path>
      `);
    });

    const centerVal = isDivided 
      ? `${Math.round(sumCategories / travelers).toLocaleString('fr-FR')} €` 
      : `${sumCategories.toLocaleString('fr-FR')} €`;

    const centerLabel = isDivided ? `PAR VOYAGEUR` : `TOTAL ALLOUÉ`;

    container.innerHTML = `
      <div class="donut-svg-holder">
        <svg viewBox="0 0 220 220" class="donut-svg">
          ${slices.join('')}
          <circle cx="110" cy="110" r="54" fill="var(--bg-card)" class="donut-hole" />
          <text x="110" y="103" text-anchor="middle" class="donut-center-title">${centerLabel}</text>
          <text x="110" y="125" text-anchor="middle" class="donut-center-value">${centerVal}</text>
        </svg>
      </div>

      <div class="donut-legend-grid">
        ${this.categories.map(cat => {
          const amt = Number(data.categoryBudgets[cat.key]) || 0;
          const pct = Math.round((amt / baseTotal) * 100);
          const displayAmt = isDivided 
            ? `${Math.round(amt / travelers)} €/p` 
            : `${amt} €`;

          return `
            <div class="legend-item" data-cat="${cat.key}">
              <span class="legend-bullet" style="background:${cat.color}"></span>
              <span class="legend-name">${cat.label}</span>
              <span class="legend-val"><strong>${displayAmt}</strong> <small>(${pct}%)</small></span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderComparisonBars() {
    const container = document.getElementById('comparison-bars');
    if (!container) return;

    const data = TripState.data;
    const travelers = Number(data.travelersCount) || 1;
    const isDivided = !!data.divideByTravelers;

    let html = `<h4 class="comparison-title">Dépenses Réelles vs Curseur Fixé :</h4>`;

    this.categories.forEach(cat => {
      const allocated = Number(data.categoryBudgets[cat.key]) || 0;
      const real = this.getCategoryRealCost(cat.key);

      if (allocated <= 0 && real <= 0) return;

      const maxVal = Math.max(allocated, real, cat.max, 1);
      const allocatedWidth = Math.min(100, Math.round((allocated / maxVal) * 100));
      const realWidth = Math.min(100, Math.round((real / maxVal) * 100));
      const isOver = real > allocated;

      const dispAlloc = isDivided ? `${Math.round(allocated/travelers)} €/p` : `${allocated} €`;
      const dispReal = isDivided ? `${Math.round(real/travelers)} €/p` : `${real} €`;

      html += `
        <div class="comp-row">
          <div class="comp-label">
            <span>${cat.icon} ${cat.label}</span>
            <span class="${isOver ? 'text-danger' : 'text-muted'}">
              ${real > 0 ? `Engagé : <strong>${dispReal}</strong> / ` : ''}
              Curseur : <strong>${dispAlloc}</strong> (Max: ${cat.max} €)
            </span>
          </div>
          <div class="comp-dual-bar">
            <div class="comp-bar-allocated" style="width: ${allocatedWidth}%; background-color: ${cat.color}60;" title="Curseur: ${allocated} €"></div>
            ${real > 0 ? `
              <div class="comp-bar-real ${isOver ? 'bar-over' : ''}" style="width: ${realWidth}%; background-color: ${isOver ? '#e53e3e' : cat.color};" title="Engagé: ${real} €"></div>
            ` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  attachEvents() {
    // 1. Événements des 6 Curseurs de Catégories
    const sliders = document.querySelectorAll('.budget-slider[data-cat]');
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const catKey = e.target.getAttribute('data-cat');
        const newVal = Number(e.target.value);
        
        TripState.data.categoryBudgets[catKey] = newVal;
        TripState.save();
        this.updateCategorySliderLive(catKey, newVal);
      });
    });

    // 2. Curseur Budget Global (0 à 1 500 €)
    const globalSlider = document.getElementById('global-budget-slider');
    const globalInput = document.getElementById('global-budget-input');
    const globalSliderValText = document.getElementById('global-slider-val-text');

    if (globalSlider && globalInput) {
      globalSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        globalInput.value = val;
        if (globalSliderValText) globalSliderValText.textContent = `${val.toLocaleString('fr-FR')} €`;
        TripState.data.totalBudget = val;
        TripState.save();
        this.updateGlobalBudgetLive();
      });

      globalInput.addEventListener('change', (e) => {
        let val = Number(e.target.value);
        if (val < 0) val = 0;
        if (val > 1500) val = 1500;
        globalSlider.value = val;
        if (globalSliderValText) globalSliderValText.textContent = `${val.toLocaleString('fr-FR')} €`;
        TripState.data.totalBudget = val;
        TripState.save();
        this.render();
      });
    }

    // 3. Option "Diviser le prix par [nombre de voyageurs]"
    const toggleDivide = document.getElementById('toggle-divide-price');
    if (toggleDivide) {
      toggleDivide.addEventListener('change', (e) => {
        TripState.data.divideByTravelers = e.target.checked;
        TripState.save();
        this.render();
        const travelers = Number(TripState.data.travelersCount) || 1;
        App.showToast(e.target.checked 
          ? `✔ Option activée : prix divisés par ${travelers} voyageur${travelers > 1 ? 's' : ''}` 
          : `Option désactivée : affichage des prix totaux`
        );
      });
    }

    // 4. Bouton aligner Budget Global sur la somme des catégories
    const btnSyncGlobal = document.getElementById('btn-sync-global-sum');
    if (btnSyncGlobal) {
      btnSyncGlobal.addEventListener('click', () => {
        const sum = Math.min(1500, this.getCategoriesSum());
        TripState.data.totalBudget = sum;
        TripState.save();
        this.render();
        App.showToast(`Budget global ajusté à ${sum} € !`);
      });
    }

    // 5. CALENDRIER DES DATES (START DATE & END DATE)
    const calStart = document.getElementById('calendar-start-date');
    const calEnd = document.getElementById('calendar-end-date');

    const handleCalendarChange = () => {
      if (!calStart || !calEnd) return;
      const start = new Date(calStart.value);
      const end = new Date(calEnd.value);

      if (end < start) {
        App.showToast("⚠️ La date de retour doit être après la date de départ !");
        calEnd.value = calStart.value;
        return;
      }

      const diffMs = end - start;
      const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      const nights = Math.max(1, days - 1);

      TripState.data.startDate = calStart.value;
      TripState.data.endDate = calEnd.value;
      TripState.data.totalDays = days;
      TripState.data.totalNights = nights;
      TripState.save();

      if (App && App.startCountdownTimer) App.startCountdownTimer();
      if (App && App.initHeaderCounters) App.initHeaderCounters();
      this.render();
      App.showToast(`Dates mises à jour : ${days} jours (${nights} nuits)`);
    };

    if (calStart) calStart.addEventListener('change', handleCalendarChange);
    if (calEnd) calEnd.addEventListener('change', handleCalendarChange);

    // 6. NOMBRE DE VOYAGEURS (BOUTONS +/- ET PRESETS)
    const btnMinus = document.getElementById('btn-traveler-minus');
    const btnPlus = document.getElementById('btn-traveler-plus');

    if (btnMinus) {
      btnMinus.addEventListener('click', () => {
        let cur = Number(TripState.data.travelersCount) || 1;
        if (cur > 1) {
          this.setTravelersCount(cur - 1);
        }
      });
    }

    if (btnPlus) {
      btnPlus.addEventListener('click', () => {
        let cur = Number(TripState.data.travelersCount) || 1;
        if (cur < 10) {
          this.setTravelersCount(cur + 1);
        }
      });
    }

    document.querySelectorAll('.btn-chip-traveler').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const count = Number(e.currentTarget.getAttribute('data-travelers'));
        this.setTravelersCount(count);
      });
    });

    // 7. PRÉRÉGLAGES RAPIDES
    const presetMax = document.getElementById('btn-preset-max-sliders');
    if (presetMax) {
      presetMax.addEventListener('click', () => {
        TripState.data.totalBudget = 1500;
        TripState.data.categoryBudgets = {
          hotels: 500,
          flights: 200,
          activities: 250,
          food: 200,
          shopping: 200,
          emergency: 150
        };
        TripState.save();
        this.render();
        App.showToast("🚀 Plafond Maximal (1 500 €) appliqué !");
      });
    }

    const presetDefault = document.getElementById('btn-preset-default-sliders');
    if (presetDefault) {
      presetDefault.addEventListener('click', () => {
        TripState.data.totalBudget = 1000;
        TripState.data.categoryBudgets = {
          hotels: 350,
          flights: 180,
          activities: 170,
          food: 140,
          shopping: 100,
          emergency: 60
        };
        TripState.save();
        this.render();
        App.showToast("⚖️ Formule Confort (1 000 €) appliquée !");
      });
    }

    const presetEco = document.getElementById('btn-preset-eco-sliders');
    if (presetEco) {
      presetEco.addEventListener('click', () => {
        TripState.data.totalBudget = 650;
        TripState.data.categoryBudgets = {
          hotels: 250,
          flights: 120,
          activities: 100,
          food: 100,
          shopping: 50,
          emergency: 30
        };
        TripState.save();
        this.render();
        App.showToast("🎒 Formule Éco (650 €) appliquée !");
      });
    }

    const resetBtn = document.getElementById('btn-reset-budget');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Réinitialiser les curseurs de budget ?")) {
          TripState.data.totalBudget = DEFAULT_TRIP_DATA.totalBudget;
          TripState.data.categoryBudgets = JSON.parse(JSON.stringify(DEFAULT_TRIP_DATA.categoryBudgets));
          TripState.save();
          this.render();
          App.showToast("Curseurs réinitialisés !");
        }
      });
    }
  },

  setTravelersCount(count) {
    TripState.data.travelersCount = count;
    TripState.save();
    if (App && App.initHeaderCounters) App.initHeaderCounters();
    if (HotelsManager) HotelsManager.render();
    if (FlightsManager) FlightsManager.render();
    if (ActivitiesManager) ActivitiesManager.render();
    this.render();
    App.showToast(`Nombre de voyageurs : ${count} personne${count > 1 ? 's' : ''}`);
  },

  updateCategorySliderLive(activeCat, newVal) {
    const data = TripState.data;
    const travelers = Number(data.travelersCount) || 1;
    const isDivided = !!data.divideByTravelers;
    const globalBudget = Number(data.totalBudget) || 1500;
    const percentOfGlobal = globalBudget > 0 ? Math.round((newVal / globalBudget) * 100) : 0;
    const newValPerPerson = Math.round(newVal / Math.max(1, travelers));

    const badge = document.getElementById(`val-amount-${activeCat}`);
    if (badge) {
      badge.innerHTML = isDivided 
        ? `${newValPerPerson.toLocaleString('fr-FR')} € <small class="unit-tag">/ pers</small>` 
        : `${newVal.toLocaleString('fr-FR')} €`;
    }

    const subTag = document.getElementById(`val-sub-${activeCat}`);
    if (subTag) {
      subTag.textContent = isDivided
        ? `Total groupe : ${newVal.toLocaleString('fr-FR')} € (${percentOfGlobal}%)`
        : `Soit ~${newValPerPerson.toLocaleString('fr-FR')} € / pers (${percentOfGlobal}%)`;
    }

    const sum = this.getCategoriesSum();
    const diff = globalBudget - sum;

    const dispSum = document.getElementById('disp-sum-categories');
    if (dispSum) {
      const sumToDisplay = isDivided ? Math.round(sum / travelers) : sum;
      dispSum.textContent = `${sumToDisplay.toLocaleString('fr-FR')} €`;
      dispSum.className = diff === 0 ? 'metric-value text-success' : (diff < 0 ? 'metric-value text-danger' : 'metric-value text-warning');
    }

    const dispStatus = document.getElementById('disp-categories-status');
    if (dispStatus) {
      if (diff === 0) {
        dispStatus.innerHTML = `✔ Parfaitement égal au budget global`;
      } else if (diff > 0) {
        dispStatus.innerHTML = `<span>Reste à allouer : <strong>+${diff} €</strong></span>`;
      } else {
        dispStatus.innerHTML = `<span style="color:#e53e3e;">Dépassement global : <strong>+${Math.abs(diff)} €</strong></span>`;
      }
    }

    const btnSync = document.getElementById('btn-sync-global-sum');
    if (btnSync) btnSync.textContent = `Aligner sur les catégories (${sum} €)`;

    this.renderDonutChart();
    this.renderComparisonBars();
  },

  updateGlobalBudgetLive() {
    const data = TripState.data;
    const globalBudget = Number(data.totalBudget) || 1500;
    const travelers = Number(data.travelersCount) || 1;
    const isDivided = !!data.divideByTravelers;
    const sum = this.getCategoriesSum();
    const diff = globalBudget - sum;
    const perPersonBudget = Math.round(globalBudget / Math.max(1, travelers));

    const dispTotal = document.getElementById('disp-total-budget');
    if (dispTotal) {
      dispTotal.textContent = isDivided 
        ? `${perPersonBudget.toLocaleString('fr-FR')} €` 
        : `${globalBudget.toLocaleString('fr-FR')} €`;
    }

    const dispSum = document.getElementById('disp-sum-categories');
    if (dispSum) {
      dispSum.className = diff === 0 ? 'metric-value text-success' : (diff < 0 ? 'metric-value text-danger' : 'metric-value text-warning');
    }

    if (App && App.initHeaderCounters) App.initHeaderCounters();
    this.renderDonutChart();
  },

  formatDateFR(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }
};
