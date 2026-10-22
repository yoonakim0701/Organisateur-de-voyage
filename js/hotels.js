/**
 * ESPAGNE 2027 - HOTELS & ACCOMMODATIONS MANAGEMENT
 */

const HotelsManager = {
  activeFilterCity: 'all',
  activeFilterStatus: 'all',

  init() {
    this.render();
    this.attachEvents();
  },

  render() {
    const container = document.getElementById('hotels-section-content');
    if (!container) return;

    const data = TripState.data;
    const hotels = data.hotels || [];
    const stages = data.stages || [];
    const totalTripNights = data.totalDays || 16;

    // Calculs de synthèse
    const selectedHotels = hotels.filter(h => h.status === 'selected');
    const totalSelectedNights = selectedHotels.reduce((sum, h) => sum + Number(h.nights), 0);
    const totalSelectedCost = selectedHotels.reduce((sum, h) => sum + (Number(h.pricePerNight) * Number(h.nights)), 0);
    
    // Budget alloué par le curseur (directement en euros)
    const hotelAllocatedBudget = data.categoryBudgets ? (Number(data.categoryBudgets.hotels) || 250) : 250;
    const budgetDiff = hotelAllocatedBudget - totalSelectedCost;

    // Filtrage des hôtels
    const filteredHotels = hotels.filter(hotel => {
      const matchCity = this.activeFilterCity === 'all' || hotel.city.toLowerCase() === this.activeFilterCity.toLowerCase();
      const matchStatus = this.activeFilterStatus === 'all' || hotel.status === this.activeFilterStatus;
      return matchCity && matchStatus;
    });

    // Liste unique des villes pour le filtre
    const cities = Array.from(new Set(stages.map(s => s.city)));

    container.innerHTML = `
      <!-- En-tête avec métriques et bouton d'ajout -->
      <div class="section-hero-card">
        <div class="hero-card-left">
          <span class="hero-pill">🏨 Hébergements & Hôtels d'exception</span>
          <h2 class="hero-title">Propositions d'Hôtels en Espagne</h2>
          <p class="hero-subtitle">Comparez, votez et retenez les meilleurs hôtels, paradores andalous et rooftops pour chaque étape de votre voyage.</p>
        </div>
        <div class="hero-card-right">
          <button id="btn-add-hotel-modal" class="btn-primary">
            <span>➕ Proposer un Nouvel Hôtel</span>
          </button>
        </div>
      </div>

      <!-- Métriques de couverture des nuits & budget -->
      <div class="hotels-stats-bar">
        <div class="stat-pill">
          <span class="stat-pill-label">Nuits Couvertes :</span>
          <strong class="${totalSelectedNights >= totalTripNights ? 'text-success' : 'text-warning'}">
            ${totalSelectedNights} / ${totalTripNights} nuits
          </strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Budget Hôtels Alloué (Curseur) :</span>
          <strong>${hotelAllocatedBudget.toLocaleString('fr-FR')} €</strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Total Hôtels Retenus :</span>
          <strong class="${budgetDiff < 0 ? 'text-danger' : 'text-success'}">
            ${totalSelectedCost.toLocaleString('fr-FR')} €
          </strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Marge disponible :</span>
          <strong class="${budgetDiff >= 0 ? 'text-success' : 'text-danger'}">
            ${budgetDiff >= 0 ? `+${budgetDiff.toLocaleString('fr-FR')} €` : `${budgetDiff.toLocaleString('fr-FR')} €`}
          </strong>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filter-controls-bar">
        <div class="filter-group">
          <label>Filtrer par Ville :</label>
          <div class="filter-chips">
            <button class="chip ${this.activeFilterCity === 'all' ? 'active' : ''}" data-filter-city="all">Toutes (${hotels.length})</button>
            ${cities.map(city => {
              const count = hotels.filter(h => h.city.toLowerCase() === city.toLowerCase()).length;
              return `
                <button class="chip ${this.activeFilterCity.toLowerCase() === city.toLowerCase() ? 'active' : ''}" data-filter-city="${city}">
                  ${city} (${count})
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="filter-group">
          <label>Statut :</label>
          <div class="filter-chips">
            <button class="chip ${this.activeFilterStatus === 'all' ? 'active' : ''}" data-filter-status="all">Tous</button>
            <button class="chip ${this.activeFilterStatus === 'selected' ? 'active' : ''}" data-filter-status="selected">⭐ Retenus pour le voyage</button>
            <button class="chip ${this.activeFilterStatus === 'proposal' ? 'active' : ''}" data-filter-status="proposal">💡 En réflexion</button>
          </div>
        </div>
      </div>

      <!-- Grille des cartes d'hôtels -->
      <div class="hotels-grid">
        ${filteredHotels.length === 0 ? `
          <div class="empty-state-card">
            <div class="empty-icon">🏨</div>
            <h3>Aucun hôtel ne correspond à ce filtre</h3>
            <p>Ajoutez une nouvelle proposition ou réinitialisez les filtres.</p>
            <button class="btn-secondary" onclick="HotelsManager.resetFilters()">Réinitialiser les filtres</button>
          </div>
        ` : filteredHotels.map(hotel => this.renderHotelCard(hotel)).join('')}
      </div>

      <!-- Modal d'ajout d'hôtel -->
      <div id="modal-hotel-container" class="modal-backdrop hidden">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Proposer un Nouvel Établissement</h3>
            <button class="btn-close-modal" id="btn-close-hotel-modal">&times;</button>
          </div>
          <form id="form-add-hotel" class="modal-body">
            <div class="form-row">
              <div class="form-group flex-2">
                <label for="hotel-name">Nom de l'hôtel * :</label>
                <input type="text" id="hotel-name" required placeholder="Ex: Hotel Alfonso XIII, Parador de..." class="input-text" />
              </div>
              <div class="form-group flex-1">
                <label for="hotel-city">Étape / Ville * :</label>
                <select id="hotel-city" class="input-select" required>
                  ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                  <option value="Autre">Autre ville</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="hotel-price">Prix par nuit (€) * :</label>
                <input type="number" id="hotel-price" required min="30" max="2000" placeholder="150" class="input-text" />
              </div>
              <div class="form-group">
                <label for="hotel-nights">Nombre de nuits * :</label>
                <input type="number" id="hotel-nights" required min="1" max="30" value="3" class="input-text" />
              </div>
              <div class="form-group">
                <label for="hotel-stars">Étoiles :</label>
                <select id="hotel-stars" class="input-select">
                  <option value="5">⭐⭐⭐⭐⭐ (5 étoiles)</option>
                  <option value="4" selected>⭐⭐⭐⭐ (4 étoiles)</option>
                  <option value="3">⭐⭐⭐ (3 étoiles)</option>
                  <option value="2">⭐⭐ (2 étoiles)</option>
                  <option value="0">Boutique / B&B de charme</option>
                </select>
              </div>
              <div class="form-group">
                <label for="hotel-rating">Note avis (sur 5) :</label>
                <input type="number" id="hotel-rating" step="0.1" min="1" max="5" value="4.8" class="input-text" />
              </div>
            </div>

            <div class="form-group">
              <label for="hotel-address">Adresse / Quartier :</label>
              <input type="text" id="hotel-address" placeholder="Ex: Barrio Santa Cruz, à 5min de la cathédrale" class="input-text" />
            </div>

            <div class="form-group">
              <label for="hotel-image">Photo de l'hôtel :</label>
              <select id="hotel-image-preset" class="input-select">
                <option value="assets/images/hotel_sevilla.jpg">Patio & Piscine Sévillane (Recommandé)</option>
                <option value="assets/images/barcelona_sagrada.jpg">Vue Barcelone & Méditerranée</option>
                <option value="assets/images/alhambra_granada.jpg">Cadre Andalou Alhambra</option>
                <option value="assets/images/madrid_palacio.jpg">Vue Urbaine Madrid Gran Vía</option>
                <option value="assets/images/tapas_gastronomy.jpg">Terrasse & Gastronomie</option>
                <option value="custom">URL Personnalisée...</option>
              </select>
              <input type="url" id="hotel-custom-image" placeholder="https://..." class="input-text hidden" style="margin-top: 8px;" />
            </div>

            <div class="form-group">
              <label for="hotel-amenities">Commodités & Points Forts (séparés par virgules) :</label>
              <input type="text" id="hotel-amenities" placeholder="Piscine rooftop, Petit déjeuner andalou, Climatisation, Wi-Fi" class="input-text" value="Piscine rooftop, Climatisation, Wi-Fi Fibre, Proche Métro" />
            </div>

            <div class="form-group">
              <label for="hotel-url">Lien Booking / Site Officiel :</label>
              <input type="url" id="hotel-url" placeholder="https://www.booking.com/..." class="input-text" />
            </div>

            <div class="form-group">
              <label for="hotel-notes">Vos notes & impressions :</label>
              <textarea id="hotel-notes" rows="2" placeholder="Pourquoi cet hôtel vous plaît, conditions d'annulation, etc." class="input-textarea"></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" id="btn-cancel-hotel">Annuler</button>
              <button type="submit" class="btn-primary">Ajouter la Proposition</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  },

  renderHotelCard(hotel) {
    const isSelected = hotel.status === 'selected';
    const totalCost = Number(hotel.pricePerNight) * Number(hotel.nights);
    const starString = '★'.repeat(hotel.stars || 4);

    return `
      <div class="hotel-card ${isSelected ? 'is-selected' : ''}" data-id="${hotel.id}">
        <div class="hotel-image-wrapper">
          <img src="${hotel.image || 'assets/images/hotel_sevilla.jpg'}" alt="${hotel.name}" class="hotel-card-img" loading="lazy" />
          <div class="hotel-badge-city">${hotel.city}</div>
          <div class="hotel-status-badge ${isSelected ? 'badge-selected' : 'badge-proposal'}">
            ${isSelected ? '✔ Retenu pour le voyage' : '💡 Proposition'}
          </div>
        </div>

        <div class="hotel-card-body">
          <div class="hotel-header">
            <div>
              <span class="hotel-stars" title="${hotel.stars} étoiles">${starString}</span>
              <h3 class="hotel-title">${hotel.name}</h3>
              <p class="hotel-address">📍 ${hotel.address || hotel.city}</p>
            </div>
            <div class="hotel-rating-box">
              <span class="rating-num">${hotel.rating || '4.8'}</span>
              <span class="rating-scale">/ 5</span>
              <span class="rating-count">(${hotel.reviewsCount || 150} avis)</span>
            </div>
          </div>

          <div class="hotel-amenities-tags">
            ${(hotel.amenities || []).map(a => `<span class="amenity-tag">${a}</span>`).join('')}
          </div>

          ${hotel.notes ? `<p class="hotel-note">💬 <em>${hotel.notes}</em></p>` : ''}

          <div class="hotel-price-breakdown">
            <div class="price-night">
              <strong>${hotel.pricePerNight} €</strong> <span class="text-sub">/ nuit</span>
            </div>
            <div class="price-total">
              <span class="text-sub">${hotel.nights} nuits = </span>
              <strong>${totalCost.toLocaleString('fr-FR')} €</strong>
            </div>
          </div>

          <div class="hotel-card-actions">
            <button class="btn-toggle-select ${isSelected ? 'btn-selected-active' : 'btn-select-hotel'}" data-action="toggle-select" data-id="${hotel.id}">
              ${isSelected ? '✔ Sélectionné' : '⭐ Retenir pour le voyage'}
            </button>
            ${hotel.bookingUrl ? `
              <a href="${hotel.bookingUrl}" target="_blank" rel="noopener noreferrer" class="btn-hotel-link" title="Ouvrir la page de réservation">
                Lien de réservation ↗
              </a>
            ` : ''}
            <button class="btn-icon-danger" data-action="delete" data-id="${hotel.id}" title="Supprimer cette proposition">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents() {
    // Filtres par ville
    document.querySelectorAll('[data-filter-city]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeFilterCity = e.currentTarget.getAttribute('data-filter-city');
        this.render();
      });
    });

    // Filtres par statut
    document.querySelectorAll('[data-filter-status]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeFilterStatus = e.currentTarget.getAttribute('data-filter-status');
        this.render();
      });
    });

    // Actions sur les cartes
    document.querySelectorAll('[data-action="toggle-select"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.toggleHotelSelection(id);
      });
    });

    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.deleteHotel(id);
      });
    });

    // Modal
    const openModalBtn = document.getElementById('btn-add-hotel-modal');
    const modalContainer = document.getElementById('modal-hotel-container');
    const closeModalBtn = document.getElementById('btn-close-hotel-modal');
    const cancelModalBtn = document.getElementById('btn-cancel-hotel');
    const imagePresetSelect = document.getElementById('hotel-image-preset');
    const customImageInput = document.getElementById('hotel-custom-image');
    const formAdd = document.getElementById('form-add-hotel');

    if (openModalBtn && modalContainer) {
      openModalBtn.addEventListener('click', () => {
        modalContainer.classList.remove('hidden');
      });
    }

    const closeModal = () => {
      if (modalContainer) modalContainer.classList.add('hidden');
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    if (imagePresetSelect && customImageInput) {
      imagePresetSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          customImageInput.classList.remove('hidden');
          customImageInput.required = true;
        } else {
          customImageInput.classList.add('hidden');
          customImageInput.required = false;
        }
      });
    }

    if (formAdd) {
      formAdd.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveNewHotel();
        closeModal();
      });
    }
  },

  toggleHotelSelection(id) {
    const hotel = TripState.data.hotels.find(h => h.id === id);
    if (!hotel) return;

    // Si on le sélectionne, on peut désélectionner un autre hôtel de la même ville pour éviter les doublons de dates
    if (hotel.status !== 'selected') {
      hotel.status = 'selected';
      App.showToast(`⭐ "${hotel.name}" retenu pour le séjour à ${hotel.city} !`);
    } else {
      hotel.status = 'proposal';
      App.showToast(`"${hotel.name}" remis en réflexion.`);
    }

    TripState.save();
    this.render();
    // Mettre à jour l'affichage global du budget si on y revient
    if (BudgetManager) BudgetManager.render();
  },

  deleteHotel(id) {
    if (!confirm("Voulez-vous vraiment retirer cette proposition d'hôtel ?")) return;

    TripState.data.hotels = TripState.data.hotels.filter(h => h.id !== id);
    TripState.save();
    this.render();
    if (BudgetManager) BudgetManager.render();
    App.showToast("Hôtel supprimé.");
  },

  saveNewHotel() {
    const name = document.getElementById('hotel-name').value.trim();
    const city = document.getElementById('hotel-city').value;
    const pricePerNight = Number(document.getElementById('hotel-price').value) || 100;
    const nights = Number(document.getElementById('hotel-nights').value) || 2;
    const stars = Number(document.getElementById('hotel-stars').value) || 4;
    const rating = Number(document.getElementById('hotel-rating').value) || 4.5;
    const address = document.getElementById('hotel-address').value.trim();
    const amenitiesRaw = document.getElementById('hotel-amenities').value;
    const amenities = amenitiesRaw.split(',').map(s => s.trim()).filter(Boolean);
    const bookingUrl = document.getElementById('hotel-url').value.trim();
    const notes = document.getElementById('hotel-notes').value.trim();

    const imagePreset = document.getElementById('hotel-image-preset').value;
    let image = imagePreset;
    if (imagePreset === 'custom') {
      image = document.getElementById('hotel-custom-image').value.trim() || 'assets/images/hotel_sevilla.jpg';
    }

    const newHotel = {
      id: 'hotel-' + Date.now(),
      name,
      city,
      pricePerNight,
      nights,
      stars,
      rating,
      address,
      amenities,
      image,
      bookingUrl,
      notes,
      status: 'proposal'
    };

    TripState.data.hotels.push(newHotel);
    TripState.save();
    this.render();
    if (BudgetManager) BudgetManager.render();
    App.showToast(`Nouvelle proposition "${name}" ajoutée avec succès !`);
  },

  resetFilters() {
    this.activeFilterCity = 'all';
    this.activeFilterStatus = 'all';
    this.render();
  }
};
