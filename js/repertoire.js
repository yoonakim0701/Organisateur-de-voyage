/**
 * ODYSSEY - RÉPERTOIRE DES VOYAGES (DOSSIERS CRÉÉS)
 * Deux sections strictes :
 * 1. En premier (en haut) : Voyages Prévus
 * 2. En bas : Voyages Passés
 * Permet de modifier, supprimer, basculer le statut, voir les photos et générer le vlog.
 */

const RepertoireManager = {
  trips: [],
  filterKeyword: '',

  init() {
    this.loadUserTrips();
    this.render();
    this.attachEvents();
  },

  loadUserTrips() {
    if (!AuthManager.currentUser) {
      this.trips = [];
      return;
    }
    const userId = AuthManager.currentUser.id;
    const stored = localStorage.getItem(`odyssey_trips_${userId}`);
    if (stored) {
      try {
        this.trips = JSON.parse(stored);
      } catch (e) {
        this.trips = [];
      }
    } else {
      this.trips = [];
    }
  },

  saveUserTrips() {
    if (!AuthManager.currentUser) return;
    const userId = AuthManager.currentUser.id;
    localStorage.setItem(`odyssey_trips_${userId}`, JSON.stringify(this.trips));
  },

  render() {
    const container = document.getElementById('tab-repertoire');
    if (!container) return;

    this.loadUserTrips();

    // Filtrage éventuel
    let filtered = this.trips;
    if (this.filterKeyword) {
      const kw = this.filterKeyword.toLowerCase();
      filtered = this.trips.filter(t => 
        (t.title && t.title.toLowerCase().includes(kw)) ||
        (t.destination && t.destination.toLowerCase().includes(kw)) ||
        (t.country && t.country.toLowerCase().includes(kw))
      );
    }

    // Séparation stricte : VOYAGES PRÉVUS (en haut) et VOYAGES PASSÉS (en bas)
    const plannedTrips = filtered.filter(t => t.status !== 'past');
    const pastTrips = filtered.filter(t => t.status === 'past');

    container.innerHTML = `
      <div class="repertoire-page-wrapper">
        
        <!-- En-tête du Répertoire -->
        <div class="repertoire-header-card glass-panel">
          <div class="rep-header-left">
            <span class="banner-pill">📁 Carnet de Bord Personnel</span>
            <h1 class="rep-main-title">Répertoire de Vos Dossiers de Voyage</h1>
            <p class="rep-main-desc">
              Retrouvez l'ensemble de vos dossiers créés pour le profil de 
              <strong>${AuthManager.currentUser ? AuthManager.currentUser.pseudo : 'Voyageur'}</strong>. 
              Vos prochaines escapades en tête de liste, suivies de vos plus beaux souvenirs passés.
            </p>
          </div>

          <div class="rep-header-actions">
            <button class="btn-primary" id="btn-rep-new-trip">
              <span>➕ Créer un Nouveau Dossier</span>
            </button>
            <button class="btn-secondary-outline" id="btn-rep-export-json" title="Exporter tous mes dossiers au format JSON">
              <span>💾 Sauvegarder (JSON)</span>
            </button>
          </div>
        </div>

        <!-- Barre de recherche rapide -->
        <div class="repertoire-search-bar glass-panel">
          <div class="search-input-wrap">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              id="rep-search-input" 
              placeholder="Rechercher une destination, un pays ou un voyage..." 
              value="${this.filterKeyword}" 
              class="input-search"
            />
            ${this.filterKeyword ? `<button id="btn-clear-search" class="btn-clear-x">&times;</button>` : ''}
          </div>
          <div class="rep-stats-pills">
            <span class="stat-pill">🛫 ${plannedTrips.length} Prévu${plannedTrips.length > 1 ? 's' : ''}</span>
            <span class="stat-pill">🏛️ ${pastTrips.length} Passé${pastTrips.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- SECTION 1 : VOYAGES PRÉVUS (EN PREMIER)                  -->
        <!-- ========================================================= -->
        <section class="repertoire-section-block" id="section-planned-trips">
          <div class="section-badge-row">
            <span class="section-title-icon">🛫</span>
            <div>
              <h2 class="rep-section-title">Voyages Prévus (À Venir)</h2>
              <p class="rep-section-sub">Vos départs futurs, itinéraires en préparation et compte à rebours actifs.</p>
            </div>
            <span class="counter-badge count-planned">${plannedTrips.length}</span>
          </div>

          ${plannedTrips.length === 0 ? `
            <div class="empty-state-box glass-panel">
              <div class="empty-icon">🗺️</div>
              <h3>Aucun voyage prévu pour le moment</h3>
              <p>Votre calendrier est libre ! Lancez-vous et créez votre premier dossier pour organiser votre prochaine aventure.</p>
              <button class="btn-primary" id="btn-empty-create-planned">
                <span>➕ Créer mon Premier Dossier</span>
              </button>
            </div>
          ` : `
            <div class="trips-cards-grid">
              ${plannedTrips.map(trip => this.renderTripCard(trip, 'planned')).join('')}
            </div>
          `}
        </section>

        <!-- Séparateur esthétique -->
        <div class="repertoire-divider">
          <span class="divider-line"></span>
          <span class="divider-icon">✨</span>
          <span class="divider-line"></span>
        </div>

        <!-- ========================================================= -->
        <!-- SECTION 2 : VOYAGES PASSÉS (EN BAS)                      -->
        <!-- ========================================================= -->
        <section class="repertoire-section-block" id="section-past-trips">
          <div class="section-badge-row">
            <span class="section-title-icon">🏛️</span>
            <div>
              <h2 class="rep-section-title">Voyages Passés (Souvenirs & Carnet)</h2>
              <p class="rep-section-sub">Vos périples réalisés, albums photos et vidéos vlogs immortalisés.</p>
            </div>
            <span class="counter-badge count-past">${pastTrips.length}</span>
          </div>

          ${pastTrips.length === 0 ? `
            <div class="empty-state-box glass-panel">
              <div class="empty-icon">📸</div>
              <h3>Aucun voyage passé enregistré</h3>
              <p>Une fois vos escapades accomplies, basculez-les ici pour conserver vos souvenirs et monter vos vlogs souvenirs.</p>
            </div>
          ` : `
            <div class="trips-cards-grid">
              ${pastTrips.map(trip => this.renderTripCard(trip, 'past')).join('')}
            </div>
          `}
        </section>

      </div>
    `;
  },

  renderTripCard(trip, status) {
    const travelers = Number(trip.travelersCount) || 1;
    const typeDef = TRAVEL_TYPES[trip.travelType] || TRAVEL_TYPES.chill;
    const cover = trip.coverImage || 'assets/images/world_filmstrip_1.jpg';
    
    // Calcul du compte à rebours ou date passée
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const diffDays = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

    let countdownBadge = '';
    if (status === 'planned') {
      if (diffDays > 0) {
        countdownBadge = `<span class="badge-countdown future">⏳ Départ dans <strong>${diffDays} jour${diffDays > 1 ? 's' : ''}</strong></span>`;
      } else if (diffDays === 0) {
        countdownBadge = `<span class="badge-countdown today">✈️ <strong>Départ Aujourd'hui !</strong></span>`;
      } else {
        countdownBadge = `<span class="badge-countdown in-progress">🌍 Voyage en cours</span>`;
      }
    } else {
      countdownBadge = `<span class="badge-countdown past">✅ Voyage Réalisé (${trip.rating || 5}★)</span>`;
    }

    return `
      <div class="trip-dossier-card glass-panel" data-trip-id="${trip.id}">
        
        <!-- Image de couverture avec badges superposés -->
        <div class="card-media-banner">
          <img src="${cover}" alt="${trip.destination}" class="card-cover-image" />
          <div class="card-media-overlay"></div>
          
          <div class="card-floating-top">
            <span class="card-type-tag">${typeDef.icon} ${typeDef.name}</span>
            ${trip.hasPets ? `<span class="card-pet-tag">🐾 Animaux Admis</span>` : ''}
          </div>

          <div class="card-floating-bottom">
            ${countdownBadge}
          </div>
        </div>

        <!-- Corps de la carte -->
        <div class="card-body-content">
          <div class="card-title-row">
            <h3 class="card-trip-title">${trip.title}</h3>
            <span class="card-destination-country">📍 ${trip.destination}, ${trip.country || ''}</span>
          </div>

          <!-- Métadonnées : Dates, Voyageurs, Budget -->
          <div class="card-meta-pills">
            <span class="meta-pill">📅 Du ${this.formatDate(trip.startDate)} au ${this.formatDate(trip.endDate)}</span>
            <span class="meta-pill">👥 ${travelers} voyageur${travelers > 1 ? 's' : ''}</span>
            <span class="meta-pill highlight">💶 ${Number(trip.maxBudgetPerPerson).toLocaleString('fr-FR')} € / pers (${Number(trip.totalBudget).toLocaleString('fr-FR')} € total)</span>
          </div>

          <!-- Mini répartition budgétaire par catégories -->
          ${trip.budgetBreakdown ? `
            <div class="card-budget-mini-preview">
              <div class="mini-bar-track">
                ${BUDGET_CATEGORIES.map(cat => {
                  const val = trip.budgetBreakdown[cat.key] || 0;
                  const pct = trip.maxBudgetPerPerson > 0 ? (val / trip.maxBudgetPerPerson) * 100 : 0;
                  return `<div class="mini-segment" style="width:${pct}%; background:${cat.color};" title="${cat.label}: ${val} €"></div>`;
                }).join('')}
              </div>
              <div class="mini-labels-legend">
                <span>🏨 ${trip.budgetBreakdown.hotels || 0} €</span>
                <span>🍽️ ${trip.budgetBreakdown.food || 0} €</span>
                <span>🎟️ ${trip.budgetBreakdown.activities || 0} €</span>
                <span>✈️ ${trip.budgetBreakdown.flights || 0} €</span>
              </div>
            </div>
          ` : ''}

          <!-- Note / description -->
          ${trip.notes ? `<p class="card-notes-excerpt">"${trip.notes}"</p>` : ''}

          <!-- Actions de la carte -->
          <div class="card-actions-toolbar">
            
            <!-- Lien Google Maps GPS direct -->
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination + ' ' + (trip.country || ''))}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-card-action" 
              title="Localiser avec repère rouge sur Google Maps"
            >
              📍 GPS
            </a>

            <!-- Accès Photos & Vlog -->
            <button class="btn-card-action btn-action-vlog" data-trip-action="vlog" data-id="${trip.id}" title="Photos & Studio Vlog de ce voyage">
              🎬 Photos & Vlog
            </button>

            <!-- Bascule statut Prévu <-> Passé -->
            <button 
              class="btn-card-action btn-action-status" 
              data-trip-action="toggle-status" 
              data-id="${trip.id}" 
              title="${status === 'planned' ? 'Marquer comme voyage passé / réalisé' : 'Rebasculer en voyage prévu'}"
            >
              ${status === 'planned' ? '✅ Terminé' : '🔄 Replacer en Prévu'}
            </button>

            <!-- Supprimer -->
            <button class="btn-card-action btn-action-delete" data-trip-action="delete" data-id="${trip.id}" title="Supprimer ce dossier">
              🗑️
            </button>

          </div>

        </div>

      </div>
    `;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  },

  attachEvents() {
    const container = document.getElementById('tab-repertoire');
    if (!container) return;

    // Bouton Créer un nouveau dossier
    const btnNew = document.getElementById('btn-rep-new-trip');
    const btnEmpty = document.getElementById('btn-empty-create-planned');
    if (btnNew) btnNew.addEventListener('click', () => App.switchTab('create-trip'));
    if (btnEmpty) btnEmpty.addEventListener('click', () => App.switchTab('create-trip'));

    // Recherche
    const searchInput = document.getElementById('rep-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterKeyword = e.target.value;
        this.render();
        this.attachEvents();
        // Garder le focus sur l'input
        const newInp = document.getElementById('rep-search-input');
        if (newInp) {
          newInp.focus();
          newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
        }
      });
    }

    const btnClearSearch = document.getElementById('btn-clear-search');
    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        this.filterKeyword = '';
        this.render();
        this.attachEvents();
      });
    }

    // Export JSON
    const btnExport = document.getElementById('btn-rep-export-json');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.trips, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `odyssey_voyages_${AuthManager.currentUser ? AuthManager.currentUser.pseudo : 'user'}.json`);
        dlAnchor.click();
      });
    }

    // Actions par carte : Vlog, Toggle Statut, Supprimer
    container.querySelectorAll('.btn-card-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-trip-action');
        const id = btn.getAttribute('data-id');
        if (!action || !id) return;

        if (action === 'vlog') {
          // Basculer vers l'onglet Photos & Studio Vlog avec ce voyage sélectionné
          PhotosManager.selectTrip(id);
          App.switchTab('photos-vlog');
        } else if (action === 'toggle-status') {
          const trip = this.trips.find(t => t.id === id);
          if (trip) {
            trip.status = (trip.status === 'past') ? 'planned' : 'past';
            this.saveUserTrips();
            this.render();
            this.attachEvents();
          }
        } else if (action === 'delete') {
          if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce dossier de voyage ?")) {
            this.trips = this.trips.filter(t => t.id !== id);
            this.saveUserTrips();
            this.render();
            this.attachEvents();
          }
        }
      });
    });
  }
};
