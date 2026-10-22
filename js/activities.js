/**
 * ESPAGNE 2027 - ACTIVITIES & VISITS MANAGEMENT
 */

const ActivitiesManager = {
  filterCity: 'all',
  filterCategory: 'all',
  filterBooked: 'all',

  init() {
    this.render();
    this.attachEvents();
  },

  render() {
    const container = document.getElementById('activities-section-content');
    if (!container) return;

    const data = TripState.data;
    const activities = data.activities || [];
    const travelers = Number(data.travelersCount) || 2;
    const stages = data.stages || [];

    // Calculs de synthèse
    const bookedActivities = activities.filter(a => a.booked);
    const totalBookedCost = bookedActivities.reduce((sum, a) => sum + (Number(a.pricePerPerson) * travelers), 0);
    
    // Budget alloué par le curseur (directement en euros)
    const allocatedBudget = data.categoryBudgets ? (Number(data.categoryBudgets.activities) || 100) : 100;
    const budgetDiff = allocatedBudget - totalBookedCost;

    // Filtres
    const cities = Array.from(new Set(stages.map(s => s.city)));
    const categories = Array.from(new Set(activities.map(a => a.category)));

    const filtered = activities.filter(act => {
      const matchCity = this.filterCity === 'all' || act.city.toLowerCase() === this.filterCity.toLowerCase();
      const matchCategory = this.filterCategory === 'all' || act.category === this.filterCategory;
      const matchBooked = this.filterBooked === 'all' 
        ? true 
        : (this.filterBooked === 'booked' ? act.booked : !act.booked);
      return matchCity && matchCategory && matchBooked;
    });

    container.innerHTML = `
      <!-- Hero de la section -->
      <div class="section-hero-card">
        <div class="hero-card-left">
          <span class="hero-pill">🎟️ Visites & Expériences Incontournables</span>
          <h2 class="hero-title">Programme des Activités en Espagne</h2>
          <p class="hero-subtitle">Des palais mauresques de l'Alhambra aux ruelles de Triana et à la Sagrada Família, planifiez vos visites et vos créneaux horaires.</p>
        </div>
        <div class="hero-card-right">
          <button id="btn-add-activity-modal" class="btn-primary">
            <span>➕ Ajouter une Activité</span>
          </button>
        </div>
      </div>

      <!-- Barre de synthèse financière des activités -->
      <div class="hotels-stats-bar">
        <div class="stat-pill">
          <span class="stat-pill-label">Activités Validées :</span>
          <strong class="text-accent">${bookedActivities.length} sur ${activities.length}</strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Budget Activités Alloué (Curseur) :</span>
          <strong>${allocatedBudget.toLocaleString('fr-FR')} €</strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Total Activités Retenues :</span>
          <strong class="${budgetDiff < 0 ? 'text-danger' : 'text-success'}">
            ${totalBookedCost.toLocaleString('fr-FR')} €
          </strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Marge disponible :</span>
          <strong class="${budgetDiff >= 0 ? 'text-success' : 'text-danger'}">
            ${budgetDiff >= 0 ? `+${budgetDiff.toLocaleString('fr-FR')} €` : `${budgetDiff.toLocaleString('fr-FR')} €`}
          </strong>
        </div>
      </div>

      <!-- Barre de filtres -->
      <div class="filter-controls-bar">
        <div class="filter-group">
          <label>Filtrer par Ville :</label>
          <div class="filter-chips">
            <button class="chip ${this.filterCity === 'all' ? 'active' : ''}" data-act-city="all">Toutes (${activities.length})</button>
            ${cities.map(c => `
              <button class="chip ${this.filterCity.toLowerCase() === c.toLowerCase() ? 'active' : ''}" data-act-city="${c}">${c}</button>
            `).join('')}
          </div>
        </div>

        <div class="filter-group">
          <label>Statut :</label>
          <div class="filter-chips">
            <button class="chip ${this.filterBooked === 'all' ? 'active' : ''}" data-act-status="all">Toutes</button>
            <button class="chip ${this.filterBooked === 'booked' ? 'active' : ''}" data-act-status="booked">✔ Au Programme (${bookedActivities.length})</button>
            <button class="chip ${this.filterBooked === 'wishlist' ? 'active' : ''}" data-act-status="wishlist">💡 En Envie (${activities.length - bookedActivities.length})</button>
          </div>
        </div>
      </div>

      <!-- Grille des Activités -->
      <div class="activities-grid">
        ${filtered.length === 0 ? `
          <div class="empty-state-card">
            <div class="empty-icon">🎟️</div>
            <h3>Aucune activité trouvée</h3>
            <p>Essayez de réinitialiser vos filtres ou ajoutez une nouvelle idée d'excursion.</p>
          </div>
        ` : filtered.map(act => this.renderActivityCard(act, travelers)).join('')}
      </div>

      <!-- Modal d'ajout d'activité -->
      <div id="modal-activity-container" class="modal-backdrop hidden">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Ajouter une Visite ou Activité</h3>
            <button class="btn-close-modal" id="btn-close-act-modal">&times;</button>
          </div>
          <form id="form-add-activity" class="modal-body">
            <div class="form-row">
              <div class="form-group flex-2">
                <label for="act-title">Titre de l'activité * :</label>
                <input type="text" id="act-title" required placeholder="Ex: Randonnée dans le Parc Güell, Tapas Tour..." class="input-text" />
              </div>
              <div class="form-group flex-1">
                <label for="act-city">Ville / Étape * :</label>
                <select id="act-city" class="input-select" required>
                  ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label for="act-category">Catégorie :</label>
                <select id="act-category" class="input-select">
                  <option value="Culture & Monuments">🏛️ Culture & Monuments</option>
                  <option value="Gastronomie & Terroir">🥘 Gastronomie & Terroir</option>
                  <option value="Nature & Architecture">🌿 Nature & Architecture</option>
                  <option value="Spectacle & Musique">💃 Spectacle & Flamenco</option>
                  <option value="Détente & Plage">🏖️ Détente & Plage</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label for="act-price">Prix par personne (€) * :</label>
                <input type="number" id="act-price" required min="0" max="500" value="25" class="input-text" />
              </div>
              <div class="form-group flex-1">
                <label for="act-duration">Durée estimée :</label>
                <input type="text" id="act-duration" placeholder="Ex: 2h30" class="input-text" value="2h00" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label for="act-slot">Créneau conseillé :</label>
                <input type="text" id="act-slot" placeholder="Ex: Matin 10:00 ou Coucher de soleil" class="input-text" value="10:00" />
              </div>
              <div class="form-group flex-1 checkbox-group" style="margin-top: 24px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="act-urgent" style="width:18px; height:18px;" />
                  <span>⚠️ Réservation urgente requise</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="act-desc">Description & conseils pratiques :</label>
              <textarea id="act-desc" rows="3" placeholder="Informations d'accès, tenue vestimentaire, réservation en avance..." class="input-textarea"></textarea>
            </div>

            <div class="form-group">
              <label for="act-image-preset">Image d'illustration :</label>
              <select id="act-image-preset" class="input-select">
                <option value="assets/images/barcelona_sagrada.jpg">Barcelone Gaudi & Architecture</option>
                <option value="assets/images/alhambra_granada.jpg">Alhambra & Grenade</option>
                <option value="assets/images/hotel_sevilla.jpg">Séville & Patio Andalou</option>
                <option value="assets/images/tapas_gastronomy.jpg">Tapas & Paella Gastronomie</option>
                <option value="assets/images/madrid_palacio.jpg">Madrid Gran Vía</option>
                <option value="assets/images/hero_spain.jpg">Spectacle Flamenco & Ambiance</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" id="btn-cancel-act">Annuler</button>
              <button type="submit" class="btn-primary">Enregistrer l'Activité</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  },

  renderActivityCard(act, travelers) {
    const totalCost = Number(act.pricePerPerson) * travelers;

    return `
      <div class="activity-card ${act.booked ? 'act-booked' : ''}" data-id="${act.id}">
        <div class="activity-img-wrapper">
          <img src="${act.image || 'assets/images/barcelona_sagrada.jpg'}" alt="${act.title}" class="activity-img" loading="lazy" />
          <div class="activity-city-pill">${act.city}</div>
          <div class="activity-cat-pill">${act.category}</div>
          ${act.urgentBooking ? `
            <div class="activity-urgent-badge" title="Forte affluence : réserver plusieurs mois à l'avance !">
              🔥 Réserver à l'avance
            </div>
          ` : ''}
        </div>

        <div class="activity-content">
          <h3 class="activity-title">${act.title}</h3>
          <p class="activity-desc">${act.description || ''}</p>

          <div class="activity-meta-row">
            <span class="meta-tag">⏱️ ${act.duration || '2h'}</span>
            <span class="meta-tag">🕒 ${act.recommendedSlot || 'Créneau libre'}</span>
          </div>

          <div class="activity-price-row">
            <div>
              <strong class="act-pp">${act.pricePerPerson} €</strong> <span class="text-sub">/ pers</span>
            </div>
            <div class="act-total">
              <span class="text-sub">${travelers} pers = </span>
              <strong>${totalCost.toLocaleString('fr-FR')} €</strong>
            </div>
          </div>

          <div class="activity-footer-actions">
            <label class="toggle-booking-label">
              <input type="checkbox" class="act-checkbox" data-action="toggle-booked" data-id="${act.id}" ${act.booked ? 'checked' : ''} />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">${act.booked ? '✔ Au Programme' : 'Ajouter au programme'}</span>
            </label>

            <button class="btn-icon-danger" data-action="delete-act" data-id="${act.id}" title="Supprimer cette activité">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents() {
    // Filtres villes
    document.querySelectorAll('[data-act-city]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterCity = e.currentTarget.getAttribute('data-act-city');
        this.render();
      });
    });

    // Filtres statut
    document.querySelectorAll('[data-act-status]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterBooked = e.currentTarget.getAttribute('data-act-status');
        this.render();
      });
    });

    // Toggle Booked Checkbox
    document.querySelectorAll('[data-action="toggle-booked"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const act = TripState.data.activities.find(a => a.id === id);
        if (act) {
          act.booked = e.currentTarget.checked;
          TripState.save();
          if (BudgetManager) BudgetManager.render();
          this.render();
          App.showToast(act.booked ? `✔ "${act.title}" ajouté à votre programme !` : `"${act.title}" retiré du programme.`);
        }
      });
    });

    // Suppression
    document.querySelectorAll('[data-action="delete-act"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.deleteActivity(id);
      });
    });

    // Modal
    const openModalBtn = document.getElementById('btn-add-activity-modal');
    const modalContainer = document.getElementById('modal-activity-container');
    const closeModalBtn = document.getElementById('btn-close-act-modal');
    const cancelModalBtn = document.getElementById('btn-cancel-act');
    const formAdd = document.getElementById('form-add-activity');

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

    if (formAdd) {
      formAdd.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveNewActivity();
        closeModal();
      });
    }
  },

  deleteActivity(id) {
    if (!confirm("Voulez-vous retirer cette activité ?")) return;

    TripState.data.activities = TripState.data.activities.filter(a => a.id !== id);
    TripState.save();
    this.render();
    if (BudgetManager) BudgetManager.render();
    App.showToast("Activité supprimée.");
  },

  saveNewActivity() {
    const title = document.getElementById('act-title').value.trim();
    const city = document.getElementById('act-city').value;
    const category = document.getElementById('act-category').value;
    const pricePerPerson = Number(document.getElementById('act-price').value) || 0;
    const duration = document.getElementById('act-duration').value.trim() || '2h';
    const recommendedSlot = document.getElementById('act-slot').value.trim() || 'Libre';
    const urgentBooking = document.getElementById('act-urgent').checked;
    const description = document.getElementById('act-desc').value.trim();
    const image = document.getElementById('act-image-preset').value;

    const newAct = {
      id: 'act-' + Date.now(),
      city,
      title,
      category,
      pricePerPerson,
      duration,
      recommendedSlot,
      urgentBooking,
      booked: true, // par défaut on la met au programme
      image,
      description
    };

    TripState.data.activities.push(newAct);
    TripState.save();
    this.render();
    if (BudgetManager) BudgetManager.render();
    App.showToast(`Nouvelle activité "${title}" ajoutée au programme !`);
  }
};
