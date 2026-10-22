/**
 * ESPAGNE 2027 - TRAVEL STAGES & ITINERARY ROADMAP
 */

const StagesManager = {
  init() {
    this.render();
    this.attachEvents();
  },

  render() {
    const container = document.getElementById('stages-section-content');
    if (!container) return;

    const data = TripState.data;
    const stages = data.stages || [];

    container.innerHTML = `
      <div class="roadmap-header-card">
        <div class="roadmap-header-info">
          <span class="hero-pill">🧭 Itinéraire & Roadmap Espagne 2027</span>
          <h2 class="roadmap-title">Les 5 Grandes Étapes de Votre Périple</h2>
          <p class="roadmap-desc">De la Méditerranée catalane aux palais d'Andalousie jusqu'aux boulevards royaux de Madrid. Cliquez sur une étape pour explorer ses hôtels et activités.</p>
        </div>
        <div class="roadmap-actions">
          <button id="btn-add-stage-modal" class="btn-secondary">
            <span>➕ Ajouter une Étape</span>
          </button>
        </div>
      </div>

      <!-- Carte stylisée du tracé en Espagne (SVG interactive map) -->
      <div class="spain-route-map-card">
        <div class="map-card-header">
          <div>
            <h3>Tracé de l'Itinéraire en Espagne</h3>
            <span class="text-sub">Liaisons en vols directs & trains à grande vitesse Renfe AVE</span>
          </div>
          <div class="map-badges">
            <span class="badge-route">🚆 Euromed / AVE</span>
            <span class="badge-route">✈️ Vols Internationaux</span>
          </div>
        </div>

        <div class="spain-svg-map-wrapper">
          <svg viewBox="0 0 900 520" class="spain-svg-map">
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1A202C" />
                <stop offset="100%" stop-color="#2D3748" />
              </linearGradient>
              <linearGradient id="routeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#E2583E" />
                <stop offset="50%" stop-color="#F4B41A" />
                <stop offset="100%" stop-color="#3182CE" />
              </linearGradient>
            </defs>

            <!-- Silhouette schématique stylisée de la péninsule ibérique -->
            <path d="M 120 180 Q 250 60 480 80 Q 680 80 750 160 Q 820 220 730 300 Q 640 430 460 470 Q 280 470 170 390 Q 90 280 120 180 Z" fill="url(#mapGradient)" stroke="#4A5568" stroke-width="2" />
            
            <!-- Lignes de route reliant les étapes -->
            <!-- Barcelone -> Valence -->
            <line x1="700" y1="180" x2="620" y2="280" stroke="url(#routeLineGrad)" stroke-width="3" stroke-dasharray="6,4" class="animated-route" />
            <!-- Valence -> Grenade -->
            <line x1="620" y1="280" x2="470" y2="400" stroke="url(#routeLineGrad)" stroke-width="3" stroke-dasharray="6,4" class="animated-route" />
            <!-- Grenade -> Séville -->
            <line x1="470" y1="400" x2="330" y2="390" stroke="url(#routeLineGrad)" stroke-width="3" stroke-dasharray="6,4" class="animated-route" />
            <!-- Séville -> Madrid -->
            <line x1="330" y1="390" x2="450" y2="230" stroke="url(#routeLineGrad)" stroke-width="3" stroke-dasharray="6,4" class="animated-route" />

            <!-- Villes (Points et Labels) -->
            <!-- Étape 1 : Barcelone -->
            <g class="map-city-node" onclick="StagesManager.filterByStage('Barcelone')">
              <circle cx="700" cy="180" r="14" fill="#E2583E" opacity="0.3" class="pulse-node" />
              <circle cx="700" cy="180" r="8" fill="#E2583E" stroke="#fff" stroke-width="2" />
              <rect x="715" y="162" width="130" height="34" rx="6" fill="#1A202CEE" stroke="#E2583E" stroke-width="1" />
              <text x="725" y="184" fill="#fff" font-weight="bold" font-size="14">1. Barcelone</text>
            </g>

            <!-- Étape 2 : Valence -->
            <g class="map-city-node" onclick="StagesManager.filterByStage('Valence')">
              <circle cx="620" cy="280" r="14" fill="#F4B41A" opacity="0.3" class="pulse-node" />
              <circle cx="620" cy="280" r="8" fill="#F4B41A" stroke="#fff" stroke-width="2" />
              <rect x="635" y="262" width="115" height="34" rx="6" fill="#1A202CEE" stroke="#F4B41A" stroke-width="1" />
              <text x="645" y="284" fill="#fff" font-weight="bold" font-size="14">2. Valence</text>
            </g>

            <!-- Étape 3 : Grenade -->
            <g class="map-city-node" onclick="StagesManager.filterByStage('Grenade')">
              <circle cx="470" cy="400" r="14" fill="#DD6B20" opacity="0.3" class="pulse-node" />
              <circle cx="470" cy="400" r="8" fill="#DD6B20" stroke="#fff" stroke-width="2" />
              <rect x="485" y="382" width="120" height="34" rx="6" fill="#1A202CEE" stroke="#DD6B20" stroke-width="1" />
              <text x="495" y="404" fill="#fff" font-weight="bold" font-size="14">3. Grenade</text>
            </g>

            <!-- Étape 4 : Séville -->
            <g class="map-city-node" onclick="StagesManager.filterByStage('Séville')">
              <circle cx="330" cy="390" r="14" fill="#E53E3E" opacity="0.3" class="pulse-node" />
              <circle cx="330" cy="390" r="8" fill="#E53E3E" stroke="#fff" stroke-width="2" />
              <rect x="200" y="372" width="115" height="34" rx="6" fill="#1A202CEE" stroke="#E53E3E" stroke-width="1" />
              <text x="210" y="394" fill="#fff" font-weight="bold" font-size="14">4. Séville</text>
            </g>

            <!-- Étape 5 : Madrid -->
            <g class="map-city-node" onclick="StagesManager.filterByStage('Madrid')">
              <circle cx="450" cy="230" r="14" fill="#3182CE" opacity="0.3" class="pulse-node" />
              <circle cx="450" cy="230" r="8" fill="#3182CE" stroke="#fff" stroke-width="2" />
              <rect x="465" y="212" width="115" height="34" rx="6" fill="#1A202CEE" stroke="#3182CE" stroke-width="1" />
              <text x="475" y="234" fill="#fff" font-weight="bold" font-size="14">5. Madrid</text>
            </g>
          </svg>
        </div>
      </div>

      <!-- Timeline des cartes d'étapes -->
      <div class="stages-timeline-grid">
        ${stages.map((stage, index) => this.renderStageCard(stage, index + 1)).join('')}
      </div>

      <!-- Modal d'ajout d'étape -->
      <div id="modal-stage-container" class="modal-backdrop hidden">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Ajouter une Nouvelle Étape en Espagne</h3>
            <button class="btn-close-modal" id="btn-close-stage-modal">&times;</button>
          </div>
          <form id="form-add-stage" class="modal-body">
            <div class="form-row">
              <div class="form-group flex-2">
                <label for="stage-city">Nom de la ville * :</label>
                <input type="text" id="stage-city" required placeholder="Ex: Cordoue, Malaga, San Sebastián..." class="input-text" />
              </div>
              <div class="form-group flex-1">
                <label for="stage-region">Région :</label>
                <input type="text" id="stage-region" placeholder="Ex: Andalousie, Pays Basque" class="input-text" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="stage-days">Nombre de jours * :</label>
                <input type="number" id="stage-days" required min="1" max="30" value="3" class="input-text" />
              </div>
              <div class="form-group flex-2">
                <label for="stage-dates">Période indicative :</label>
                <input type="text" id="stage-dates" placeholder="Ex: 15 Juin - 18 Juin 2027" class="input-text" />
              </div>
            </div>

            <div class="form-group">
              <label for="stage-highlight">Points d'intérêt majeurs :</label>
              <input type="text" id="stage-highlight" placeholder="Ex: Mosquée-Cathédrale, Ruelles fleuries, Patios" class="input-text" />
            </div>

            <div class="form-group">
              <label for="stage-image-preset">Photo d'illustration :</label>
              <select id="stage-image-preset" class="input-select">
                <option value="assets/images/hotel_sevilla.jpg">Patio & Ambiance Andalouse</option>
                <option value="assets/images/barcelona_sagrada.jpg">Barcelone & Mer</option>
                <option value="assets/images/alhambra_granada.jpg">Alhambra & Palais</option>
                <option value="assets/images/tapas_gastronomy.jpg">Gastronomie & Tapas</option>
                <option value="assets/images/madrid_palacio.jpg">Madrid & Boulevards</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" id="btn-cancel-stage">Annuler</button>
              <button type="submit" class="btn-primary">Ajouter l'Étape</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  },

  renderStageCard(stage, stepNumber) {
    // Calcul du nombre d'hôtels et d'activités associés à cette ville
    const hotelsCount = (TripState.data.hotels || []).filter(h => h.city.toLowerCase() === stage.city.toLowerCase()).length;
    const actsCount = (TripState.data.activities || []).filter(a => a.city.toLowerCase() === stage.city.toLowerCase()).length;

    return `
      <div class="stage-timeline-card" data-city="${stage.city}">
        <div class="stage-step-badge">Étape ${stepNumber}</div>
        <div class="stage-img-wrapper">
          <img src="${stage.image || 'assets/images/hero_spain.jpg'}" alt="${stage.city}" class="stage-img" loading="lazy" />
          <div class="stage-overlay">
            <span class="stage-weather">${stage.weather || '☀️ 25°C'}</span>
          </div>
        </div>

        <div class="stage-content">
          <div class="stage-top-meta">
            <span class="stage-region">${stage.region}</span>
            <span class="stage-duration">⏱️ ${stage.days} jours</span>
          </div>

          <h3 class="stage-name">${stage.city}</h3>
          <p class="stage-dates">📅 ${stage.dates}</p>
          <p class="stage-highlight">✨ ${stage.highlight}</p>

          <div class="stage-quick-stats">
            <span class="stat-tag" onclick="App.switchTab('hotels'); HotelsManager.activeFilterCity='${stage.city}'; HotelsManager.render();">
              🏨 ${hotelsCount} hôtel(s)
            </span>
            <span class="stat-tag" onclick="App.switchTab('activities'); ActivitiesManager.filterCity='${stage.city}'; ActivitiesManager.render();">
              🎟️ ${actsCount} activité(s)
            </span>
          </div>

          <div class="stage-footer">
            <button class="btn-text-action" onclick="App.switchTab('hotels'); HotelsManager.activeFilterCity='${stage.city}'; HotelsManager.render();">
              Voir les hébergements ➔
            </button>
            <button class="btn-icon-danger" data-action="delete-stage" data-id="${stage.id}" title="Supprimer cette étape">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents() {
    // Modal
    const openBtn = document.getElementById('btn-add-stage-modal');
    const modal = document.getElementById('modal-stage-container');
    const closeBtn = document.getElementById('btn-close-stage-modal');
    const cancelBtn = document.getElementById('btn-cancel-stage');
    const form = document.getElementById('form-add-stage');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }

    const closeModal = () => {
      if (modal) modal.classList.add('hidden');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveNewStage();
        closeModal();
      });
    }

    // Suppression d'étape
    document.querySelectorAll('[data-action="delete-stage"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.deleteStage(id);
      });
    });
  },

  filterByStage(cityName) {
    App.switchTab('hotels');
    HotelsManager.activeFilterCity = cityName;
    HotelsManager.render();
  },

  deleteStage(id) {
    if (!confirm("Voulez-vous supprimer cette étape de votre voyage ?")) return;

    TripState.data.stages = TripState.data.stages.filter(s => s.id !== id);
    TripState.save();
    this.render();
    App.showToast("Étape supprimée.");
  },

  saveNewStage() {
    const city = document.getElementById('stage-city').value.trim();
    const region = document.getElementById('stage-region').value.trim() || 'Espagne';
    const days = Number(document.getElementById('stage-days').value) || 2;
    const dates = document.getElementById('stage-dates').value.trim() || `${days} jours prévus`;
    const highlight = document.getElementById('stage-highlight').value.trim() || 'Découverte libre et monuments';
    const image = document.getElementById('stage-image-preset').value;

    const newStage = {
      id: 'stage-' + Date.now(),
      city,
      region,
      days,
      dates,
      highlight,
      image,
      weather: '☀️ 26°C Ensoleillé',
      status: 'Planifié'
    };

    TripState.data.stages.push(newStage);
    TripState.save();
    this.render();
    App.showToast(`Étape "${city}" ajoutée à votre itinéraire !`);
  }
};
