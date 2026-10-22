/**
 * ESPAGNE 2027 - FLIGHTS & TRANSPORTATION MANAGEMENT
 */

const FlightsManager = {
  init() {
    this.render();
    this.attachEvents();
  },

  render() {
    const container = document.getElementById('flights-section-content');
    if (!container) return;

    const data = TripState.data;
    const flights = data.flights || [];
    const travelers = Number(data.travelersCount) || 2;

    // Calculs de synthèse
    const totalTransportCost = flights.reduce((sum, f) => {
      const price = f.pricePerPerson ? (Number(f.pricePerPerson) * travelers) : (Number(f.totalPrice) || 0);
      return sum + price;
    }, 0);
    // Budget transport alloué par le curseur (directement en euros)
    const allocatedBudget = data.categoryBudgets ? (Number(data.categoryBudgets.flights) || 120) : 120;
    const budgetDiff = allocatedBudget - totalTransportCost;

    container.innerHTML = `
      <!-- Hero de la section -->
      <div class="section-hero-card">
        <div class="hero-card-left">
          <span class="hero-pill">✈️ Vols Internationaux & Trains AVE</span>
          <h2 class="hero-title">Gestion des Billets d'Avion & Transports</h2>
          <p class="hero-subtitle">Consultez vos cartes d'embarquement stylisées, vos références dossiers (PNR), vos horaires et gérez vos liaisons en Espagne.</p>
        </div>
        <div class="hero-card-right">
          <button id="btn-add-flight-modal" class="btn-primary">
            <span>➕ Ajouter un Billet / Vol</span>
          </button>
        </div>
      </div>

      <!-- Barre de synthèse financière des transports -->
      <div class="hotels-stats-bar">
        <div class="stat-pill">
          <span class="stat-pill-label">Trajets Enregistrés :</span>
          <strong class="text-accent">${flights.length} liaisons</strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Voyageurs :</span>
          <strong>${travelers} personnes</strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Budget Transport Alloué (Curseur) :</span>
          <strong>${allocatedBudget.toLocaleString('fr-FR')} €</strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Total Billets Confirmés :</span>
          <strong class="${budgetDiff < 0 ? 'text-danger' : 'text-success'}">
            ${totalTransportCost.toLocaleString('fr-FR')} €
          </strong>
        </div>
        <div class="stat-pill">
          <span class="stat-pill-label">Marge Transport :</span>
          <strong class="${budgetDiff >= 0 ? 'text-success' : 'text-danger'}">
            ${budgetDiff >= 0 ? `+${budgetDiff.toLocaleString('fr-FR')} €` : `${budgetDiff.toLocaleString('fr-FR')} €`}
          </strong>
        </div>
      </div>

      <!-- Liste des cartes d'embarquement (Boarding Passes) -->
      <div class="boarding-passes-container">
        ${flights.length === 0 ? `
          <div class="empty-state-card">
            <div class="empty-icon">✈️</div>
            <h3>Aucun vol ou trajet enregistré</h3>
            <p>Ajoutez votre vol aller vers l'Espagne pour commencer.</p>
          </div>
        ` : flights.map(f => this.renderBoardingPass(f, travelers)).join('')}
      </div>

      <!-- Modal d'ajout de Billet / Vol -->
      <div id="modal-flight-container" class="modal-backdrop hidden">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Ajouter un Vol ou Trajet en Espagne</h3>
            <button class="btn-close-modal" id="btn-close-flight-modal">&times;</button>
          </div>
          <form id="form-add-flight" class="modal-body">
            <div class="form-row">
              <div class="form-group flex-2">
                <label for="flight-title">Intitulé du trajet * :</label>
                <input type="text" id="flight-title" required placeholder="Ex: Vol Paris CDG ➔ Barcelone BCN" class="input-text" />
              </div>
              <div class="form-group flex-1">
                <label for="flight-type">Type :</label>
                <select id="flight-type" class="input-select">
                  <option value="flight">✈️ Vol Avion</option>
                  <option value="train">🚄 Train Grande Vitesse (Renfe / AVE)</option>
                  <option value="bus">🚌 Navette / Bus</option>
                  <option value="car">🚗 Location Voiture</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="flight-airline">Compagnie / Opérateur * :</label>
                <input type="text" id="flight-airline" required placeholder="Ex: Iberia, Air France, Renfe" class="input-text" />
              </div>
              <div class="form-group">
                <label for="flight-num">Numéro de Vol / Train * :</label>
                <input type="text" id="flight-num" required placeholder="Ex: IB3402, AVE 03942" class="input-text" />
              </div>
              <div class="form-group">
                <label for="flight-pnr">Code Réservation (PNR) :</label>
                <input type="text" id="flight-pnr" placeholder="Ex: RNF-992B" class="input-text" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="flight-date">Date :</label>
                <input type="date" id="flight-date" required value="2027-05-15" class="input-text" />
              </div>
              <div class="form-group">
                <label for="flight-dep-time">Heure de Départ :</label>
                <input type="time" id="flight-dep-time" required value="09:00" class="input-text" />
              </div>
              <div class="form-group">
                <label for="flight-arr-time">Heure d'Arrivée :</label>
                <input type="time" id="flight-arr-time" required value="11:00" class="input-text" />
              </div>
              <div class="form-group">
                <label for="flight-duration">Durée :</label>
                <input type="text" id="flight-duration" placeholder="Ex: 2h00" class="input-text" value="2h00" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="flight-from-code">Code Départ (IATA) :</label>
                <input type="text" id="flight-from-code" placeholder="CDG" class="input-text" required />
              </div>
              <div class="form-group flex-2">
                <label for="flight-from-city">Aéroport / Gare de départ :</label>
                <input type="text" id="flight-from-city" placeholder="Paris Charles de Gaulle" class="input-text" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="flight-to-code">Code Arrivée (IATA) :</label>
                <input type="text" id="flight-to-code" placeholder="BCN" class="input-text" required />
              </div>
              <div class="form-group flex-2">
                <label for="flight-to-city">Aéroport / Gare d'arrivée :</label>
                <input type="text" id="flight-to-city" placeholder="Barcelone El Prat" class="input-text" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="flight-price-pp">Prix par personne (€) * :</label>
                <input type="number" id="flight-price-pp" required min="10" max="2500" value="120" class="input-text" />
              </div>
              <div class="form-group">
                <label for="flight-seats">Sièges attribués :</label>
                <input type="text" id="flight-seats" placeholder="12A & 12B" class="input-text" value="12A & 12B" />
              </div>
              <div class="form-group flex-2">
                <label for="flight-baggage">Bagages :</label>
                <input type="text" id="flight-baggage" placeholder="23kg en soute + cabine" class="input-text" value="Bagage soute 23kg + sac cabine" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" id="btn-cancel-flight">Annuler</button>
              <button type="submit" class="btn-primary">Enregistrer le Billet</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents();
  },

  renderBoardingPass(flight, travelers) {
    const isFlight = flight.type === 'flight';
    const total = flight.totalPrice || (flight.pricePerPerson * travelers);

    return `
      <div class="boarding-pass-card" data-id="${flight.id}">
        <!-- Header du billet -->
        <div class="bp-header">
          <div class="bp-airline">
            <span class="bp-icon">${isFlight ? '✈️' : '🚄'}</span>
            <div>
              <div class="bp-airline-name">${flight.airline || 'Compagnie'}</div>
              <div class="bp-flight-num">${flight.flightNumber || 'N° 0000'}</div>
            </div>
          </div>
          <div class="bp-status-badge">
            ${flight.status || 'Confirmé'}
          </div>
        </div>

        <!-- Corps du trajet -->
        <div class="bp-body">
          <div class="bp-city-block bp-from">
            <div class="bp-code">${flight.fromCode}</div>
            <div class="bp-city-name">${flight.fromCity}</div>
            <div class="bp-time">${flight.departureTime}</div>
          </div>

          <div class="bp-route-visual">
            <div class="bp-duration">${flight.duration || 'Direct'}</div>
            <div class="bp-flight-line">
              <div class="bp-line-dot"></div>
              <div class="bp-airplane-icon">${isFlight ? '✈' : '🚆'}</div>
              <div class="bp-line-dot"></div>
            </div>
            <div class="bp-date-pill">📅 ${flight.date}</div>
          </div>

          <div class="bp-city-block bp-to">
            <div class="bp-code">${flight.toCode}</div>
            <div class="bp-city-name">${flight.toCity}</div>
            <div class="bp-time">${flight.arrivalTime}</div>
          </div>
        </div>

        <!-- Ligne de perforation style coupon d'embarquement -->
        <div class="bp-perforation">
          <div class="bp-cutout bp-cutout-left"></div>
          <div class="bp-dashed-line"></div>
          <div class="bp-cutout bp-cutout-right"></div>
        </div>

        <!-- Détails passagers & PNR -->
        <div class="bp-footer">
          <div class="bp-meta-col">
            <div class="bp-meta-label">Passagers (${travelers})</div>
            <div class="bp-meta-val">Sièges : <strong>${flight.seats || 'Non attribués'}</strong></div>
          </div>

          <div class="bp-meta-col">
            <div class="bp-meta-label">Bagages</div>
            <div class="bp-meta-val">${flight.baggage || 'Cabine inclus'}</div>
          </div>

          <div class="bp-meta-col">
            <div class="bp-meta-label">Référence Dossier (PNR)</div>
            <div class="bp-meta-val bp-pnr-code" title="Cliquer pour copier" onclick="App.copyToClipboard('${flight.pnr}')">
              ${flight.pnr || 'SPN-2027'} 📋
            </div>
          </div>

          <div class="bp-meta-col bp-price-col">
            <div class="bp-meta-label">Prix Total</div>
            <div class="bp-price-val">${total.toLocaleString('fr-FR')} €</div>
          </div>

          <div class="bp-meta-col bp-actions-col">
            <button class="btn-icon-danger" data-action="delete-flight" data-id="${flight.id}" title="Supprimer ce billet">
              🗑️
            </button>
          </div>
        </div>

        <!-- Code barre stylisé -->
        <div class="bp-barcode-strip">
          <div class="barcode-lines"></div>
          <span class="barcode-text">ELECTRONIC TICKET / ${flight.flightNumber} / ESPAGNE 2027</span>
        </div>
      </div>
    `;
  },

  attachEvents() {
    // Boutons de suppression
    document.querySelectorAll('[data-action="delete-flight"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.deleteFlight(id);
      });
    });

    // Modal
    const openModalBtn = document.getElementById('btn-add-flight-modal');
    const modalContainer = document.getElementById('modal-flight-container');
    const closeModalBtn = document.getElementById('btn-close-flight-modal');
    const cancelModalBtn = document.getElementById('btn-cancel-flight');
    const formAdd = document.getElementById('form-add-flight');

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
        this.saveNewFlight();
        closeModal();
      });
    }
  },

  deleteFlight(id) {
    if (!confirm("Voulez-vous supprimer ce trajet ?")) return;

    TripState.data.flights = TripState.data.flights.filter(f => f.id !== id);
    TripState.save();
    this.render();
    if (BudgetManager) BudgetManager.render();
    App.showToast("Billet supprimé.");
  },

  saveNewFlight() {
    const title = document.getElementById('flight-title').value.trim();
    const type = document.getElementById('flight-type').value;
    const airline = document.getElementById('flight-airline').value.trim();
    const flightNumber = document.getElementById('flight-num').value.trim();
    const pnr = document.getElementById('flight-pnr').value.trim() || 'REF-' + Math.floor(1000 + Math.random() * 9000);
    const dateRaw = document.getElementById('flight-date').value;
    const departureTime = document.getElementById('flight-dep-time').value;
    const arrivalTime = document.getElementById('flight-arr-time').value;
    const duration = document.getElementById('flight-duration').value.trim() || '2h00';
    const fromCode = document.getElementById('flight-from-code').value.trim().toUpperCase();
    const fromCity = document.getElementById('flight-from-city').value.trim();
    const toCode = document.getElementById('flight-to-code').value.trim().toUpperCase();
    const toCity = document.getElementById('flight-to-city').value.trim();
    const pricePerPerson = Number(document.getElementById('flight-price-pp').value) || 100;
    const seats = document.getElementById('flight-seats').value.trim();
    const baggage = document.getElementById('flight-baggage').value.trim();

    const travelers = Number(TripState.data.travelersCount) || 2;
    const totalPrice = pricePerPerson * travelers;

    // Formatter date en FR
    const dateParts = dateRaw.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : dateRaw;

    const newFlight = {
      id: 'flight-' + Date.now(),
      type,
      title,
      airline,
      flightNumber,
      date: formattedDate,
      departureTime,
      arrivalTime,
      fromCode,
      fromCity,
      toCode,
      toCity,
      duration,
      pnr,
      passengerCount: travelers,
      pricePerPerson,
      totalPrice,
      seats,
      baggage,
      status: 'Confirmé'
    };

    TripState.data.flights.push(newFlight);
    TripState.save();
    this.render();
    if (BudgetManager) BudgetManager.render();
    App.showToast(`Billet "${flightNumber}" (${fromCode} ➔ ${toCode}) ajouté avec succès !`);
  }
};
