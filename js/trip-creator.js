/**
 * ODYSSEY - CRÉATION D'UN NOUVEAU DOSSIER DE VOYAGE
 * Formulaire initial -> Transformation en curseurs de budget selon le type de voyage,
 * Carte Google Maps avec point GPS rouge, suggestions sur mesure (endroits, activités,
 * restaurants, logements) et badges animaux de compagnie.
 */

const TripCreator = {
  currentFormState: {
    destination: 'Tokyo',
    country: 'Japon',
    travelersCount: 2,
    maxBudgetPerPerson: 1500,
    travelType: 'chill',
    hasPets: false,
    startDate: '2027-05-15',
    endDate: '2027-05-22',
    status: 'planned',
    viewMode: 'per_person', // 'per_person' ou 'group'
    sliderValues: {
      hotels: 600,
      food: 300,
      activities: 150,
      flights: 225,
      shopping: 150,
      emergency: 75
    }
  },

  init() {
    this.render();
    this.attachEvents();
  },

  // Pré-remplir le formulaire depuis une suggestion de la page d'accueil
  loadFromSuggestion(suggestion) {
    this.currentFormState.destination = suggestion.destination.split(',')[0].trim();
    this.currentFormState.travelType = suggestion.type || 'chill';
    this.currentFormState.maxBudgetPerPerson = suggestion.budgetPerPerson || 1500;
    this.applyBudgetWeightsFromType();
    this.render();
    this.attachEvents();
  },

  // Calcule la répartition automatique du budget selon le type de voyage choisi
  applyBudgetWeightsFromType() {
    const typeDef = TRAVEL_TYPES[this.currentFormState.travelType] || TRAVEL_TYPES.chill;
    const weights = typeDef.budgetWeights;
    const budgetPerPers = Number(this.currentFormState.maxBudgetPerPerson) || 1000;

    this.currentFormState.sliderValues = {
      hotels: Math.round(budgetPerPers * (weights.hotels / 100)),
      food: Math.round(budgetPerPers * (weights.food / 100)),
      activities: Math.round(budgetPerPers * (weights.activities / 100)),
      flights: Math.round(budgetPerPers * (weights.flights / 100)),
      shopping: Math.round(budgetPerPers * (weights.shopping / 100)),
      emergency: Math.round(budgetPerPers * (weights.emergency / 100))
    };
  },

  render() {
    const container = document.getElementById('tab-create-trip');
    if (!container) return;

    const s = this.currentFormState;
    const travelers = Number(s.travelersCount) || 1;
    const maxBudgetTotal = s.maxBudgetPerPerson * travelers;
    const activeType = TRAVEL_TYPES[s.travelType] || TRAVEL_TYPES.chill;
    
    // Somme des curseurs
    const currentSumPerPers = Object.values(s.sliderValues).reduce((a, b) => a + b, 0);
    const currentSumTotal = currentSumPerPers * travelers;
    const isOverBudget = currentSumPerPers > s.maxBudgetPerPerson;

    // Données de destination pour suggestions et carte
    const destData = this.getDestinationData(s.destination);

    container.innerHTML = `
      <div class="trip-creator-wrapper">
        
        <!-- En-tête de la page Création de dossier -->
        <div class="creator-header-banner">
          <div class="banner-pill">✨ Nouveau Dossier de Voyage</div>
          <h1 class="banner-title">Planifiez Votre Prochaine Aventure Mondiale</h1>
          <p class="banner-desc">
            Renseignez vos critères initiaux : le budget se métamorphose en curseurs intelligents ajustés à votre style, 
            avec repérage Google Maps au point GPS rouge et recommandations sur mesure adaptées à votre profil.
          </p>
        </div>

        <!-- FORMULAIRE INITIAL -->
        <div class="creator-form-card glass-panel">
          <h2 class="card-section-title">
            <span class="step-num">1</span> Informations Initiales du Voyage
          </h2>

          <div class="form-grid-3">
            
            <!-- 1. Destination -->
            <div class="form-group">
              <label for="create-destination" class="field-label">
                <span>📍</span> Destination (Pays ou Ville) :
              </label>
              <input 
                type="text" 
                id="create-destination" 
                class="input-text-modern" 
                value="${s.destination}" 
                placeholder="Ex: Tokyo, Bali, Rome, Reykjavik, Barcelone..." 
                required 
              />
              <div class="dest-quick-chips">
                <span class="chip-label">Suggestions :</span>
                ${['Tokyo', 'Bali', 'Reykjavik', 'Rome', 'New York', 'Barcelone'].map(d => `
                  <button type="button" class="quick-dest-chip ${s.destination.toLowerCase() === d.toLowerCase() ? 'active' : ''}" data-dest="${d}">${d}</button>
                `).join('')}
              </div>
            </div>

            <!-- 2. Nombre de personnes -->
            <div class="form-group">
              <label for="create-travelers" class="field-label">
                <span>👥</span> Nombre de personnes :
              </label>
              <div class="number-input-row">
                <button type="button" class="btn-stepper" id="btn-decrease-travelers">-</button>
                <input 
                  type="number" 
                  id="create-travelers" 
                  class="input-number-modern" 
                  min="1" 
                  max="20" 
                  value="${s.travelersCount}" 
                />
                <button type="button" class="btn-stepper" id="btn-increase-travelers">+</button>
                <span class="stepper-unit">voyageur${s.travelersCount > 1 ? 's' : ''}</span>
              </div>
            </div>

            <!-- 3. Budget maximal par personne -->
            <div class="form-group">
              <label for="create-budget-person" class="field-label">
                <span>💶</span> Budget maximal par personne :
              </label>
              <div class="input-with-currency">
                <input 
                  type="number" 
                  id="create-budget-person" 
                  class="input-text-modern" 
                  min="100" 
                  step="50" 
                  value="${s.maxBudgetPerPerson}" 
                />
                <span class="currency-tag">€ / personne</span>
              </div>
              <div class="budget-total-hint">
                Soit un budget total groupe de : <strong>${maxBudgetTotal.toLocaleString('fr-FR')} €</strong>
              </div>
            </div>

          </div>

          <div class="form-grid-2" style="margin-top: 1.5rem;">
            
            <!-- 4. Présence d'animaux de compagnie -->
            <div class="form-group">
              <label class="field-label">
                <span>🐾</span> Présence d'animaux de compagnie :
              </label>
              <div class="pet-toggle-row">
                <label class="pet-radio-card ${s.hasPets ? 'active' : ''}">
                  <input type="radio" name="pet-radio" value="yes" ${s.hasPets ? 'checked' : ''} />
                  <span class="pet-card-icon">🐕</span>
                  <div>
                    <strong>Oui, nous voyageons avec un animal</strong>
                    <div class="subtext">Affiche les lieux et hôtels adaptés (pet-friendly)</div>
                  </div>
                </label>
                <label class="pet-radio-card ${!s.hasPets ? 'active' : ''}">
                  <input type="radio" name="pet-radio" value="no" ${!s.hasPets ? 'checked' : ''} />
                  <span class="pet-card-icon">🚫</span>
                  <div>
                    <strong>Non, sans animal de compagnie</strong>
                    <div class="subtext">Accès libre à tous types de structures</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- 5. Dates du voyage -->
            <div class="form-group">
              <label class="field-label">
                <span>📅</span> Période souhaitée :
              </label>
              <div class="dates-row">
                <div class="date-field">
                  <span class="date-tag">Départ</span>
                  <input type="date" id="create-start-date" class="input-date-modern" value="${s.startDate}" />
                </div>
                <div class="date-field">
                  <span class="date-tag">Retour</span>
                  <input type="date" id="create-end-date" class="input-date-modern" value="${s.endDate}" />
                </div>
              </div>
            </div>

          </div>

          <!-- 6. Sélection du TYPE DE VOYAGE (Les 6 types demandés avec descriptions complètes) -->
          <div class="form-group" style="margin-top: 2rem;">
            <label class="field-label">
              <span>🎯</span> Sélectionnez Votre Type de Voyage :
            </label>
            <p class="field-subtext">
              Chaque style adapte automatiquement la répartition de votre budget et sélectionne des activités recommandées.
            </p>

            <div class="travel-types-selector-grid">
              ${Object.values(TRAVEL_TYPES).map(t => `
                <div class="travel-type-card ${s.travelType === t.key ? 'selected' : ''}" data-type-key="${t.key}">
                  <div class="type-card-header">
                    <span class="type-card-icon">${t.icon}</span>
                    <h3 class="type-card-name">${t.name}</h3>
                    <div class="type-selection-indicator">✓</div>
                  </div>
                  <p class="type-card-description">${t.description}</p>
                  <div class="type-budget-hint">
                    <strong>Pôle prioritaire :</strong> ${this.getPriorityLabel(t.budgetWeights)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- ======================================================== -->
        <!-- RÉSULTAT DYNAMIQUE : CURSEURS DE BUDGET, MAPS & SUGGESTIONS -->
        <!-- ======================================================== -->
        <div class="dynamic-results-section" id="creator-dynamic-results">
          
          <!-- SECTION 2 : LE BUDGET TRANSFORMÉ EN CURSEURS INTERACTIFS -->
          <div class="budget-sliders-card glass-panel">
            <div class="sliders-card-header">
              <div>
                <span class="step-num">2</span>
                <span class="card-badge">💶 Répartition Intelligente</span>
                <h2 class="card-section-title">Le Budget se Transforme en Curseurs</h2>
                <p class="card-section-desc">
                  Proposition sur mesure calculée pour le style <strong>"${activeType.name}"</strong>. 
                  Déplacez les curseurs pour affiner librement vos dépenses selon vos envies.
                </p>
              </div>

              <!-- Bascule Mode par Personne / Total Groupe -->
              <div class="budget-mode-switch">
                <span class="switch-label">Mode d'affichage :</span>
                <button type="button" class="btn-mode-toggle ${s.viewMode === 'per_person' ? 'active' : ''}" id="btn-toggle-per-person">
                  👤 Par Personne
                </button>
                <button type="button" class="btn-mode-toggle ${s.viewMode === 'group' ? 'active' : ''}" id="btn-toggle-group">
                  👥 Total Groupe (${travelers} pers)
                </button>
              </div>
            </div>

            <!-- Jauge Totale du Budget -->
            <div class="budget-gauge-box">
              <div class="gauge-header">
                <div>
                  <span class="gauge-title">Somme Allouée par les Curseurs :</span>
                  <span class="gauge-amount ${isOverBudget ? 'text-danger' : 'text-success'}">
                    ${s.viewMode === 'per_person' 
                      ? `${currentSumPerPers.toLocaleString('fr-FR')} € <small>/ pers</small>` 
                      : `${currentSumTotal.toLocaleString('fr-FR')} € <small>total</small>`}
                  </span>
                </div>
                <div class="gauge-target">
                  Plafond Fixé : <strong>${s.viewMode === 'per_person' 
                    ? `${s.maxBudgetPerPerson.toLocaleString('fr-FR')} € / pers` 
                    : `${maxBudgetTotal.toLocaleString('fr-FR')} € total`}</strong>
                </div>
              </div>

              <!-- Barre de progression segmentée -->
              <div class="gauge-segmented-bar">
                ${BUDGET_CATEGORIES.map(cat => {
                  const val = s.sliderValues[cat.key] || 0;
                  const pct = s.maxBudgetPerPerson > 0 ? (val / s.maxBudgetPerPerson) * 100 : 0;
                  return `
                    <div 
                      class="bar-segment" 
                      style="width: ${Math.min(pct, 100)}%; background-color: ${cat.color};" 
                      title="${cat.label}: ${val} € (${Math.round(pct)}%)"
                    ></div>
                  `;
                }).join('')}
              </div>

              ${isOverBudget ? `
                <div class="budget-warning-banner">
                  ⚠️ <strong>Attention :</strong> Vos curseurs totalisent ${currentSumPerPers - s.maxBudgetPerPerson} € de plus que le budget maximal fixé par personne.
                </div>
              ` : `
                <div class="budget-success-banner">
                  ✅ <strong>Budget parfaitement équilibré :</strong> Il vous reste ${s.maxBudgetPerPerson - currentSumPerPers} € / pers de marge de manœuvre disponible.
                </div>
              `}
            </div>

            <!-- GRILLE DES 6 CURSEURS DE BUDGET -->
            <div class="sliders-grid">
              ${BUDGET_CATEGORIES.map(cat => {
                const valPerPers = s.sliderValues[cat.key] || 0;
                const valTotal = valPerPers * travelers;
                const pct = s.maxBudgetPerPerson > 0 ? Math.round((valPerPers / s.maxBudgetPerPerson) * 100) : 0;
                const maxRange = Math.max(500, Math.round(s.maxBudgetPerPerson * 0.9));

                return `
                  <div class="category-slider-card">
                    <div class="slider-head">
                      <div class="cat-title-wrap">
                        <span class="cat-icon-badge" style="background: ${cat.color}25; color: ${cat.color};">${cat.icon}</span>
                        <div>
                          <strong>${cat.label}</strong>
                          <div class="cat-desc-tiny">${cat.desc}</div>
                        </div>
                      </div>
                      <div class="cat-value-display">
                        <span class="value-highlight" style="color: ${cat.color};">
                          ${s.viewMode === 'per_person' ? `${valPerPers.toLocaleString('fr-FR')} €` : `${valTotal.toLocaleString('fr-FR')} €`}
                        </span>
                        <span class="value-pct">(${pct}% du budget)</span>
                      </div>
                    </div>

                    <div class="slider-control-line">
                      <input 
                        type="range" 
                        class="range-slider-input" 
                        id="range-cat-${cat.key}" 
                        data-cat-key="${cat.key}" 
                        min="0" 
                        max="${maxRange}" 
                        step="10" 
                        value="${valPerPers}" 
                        style="accent-color: ${cat.color};"
                      />
                    </div>

                    <div class="slider-footer-labels">
                      <span>0 €</span>
                      <span class="slider-recommended-tag">Suggéré style : <strong>${activeType.budgetWeights[cat.key] || 0}%</strong></span>
                      <span>Max : ${maxRange} €</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="sliders-actions-row">
              <button type="button" class="btn-secondary-outline" id="btn-reset-sliders-type">
                🔄 Réinitialiser selon le style "${activeType.name}"
              </button>
            </div>
          </div>

          <!-- SECTION 3 : ACCÈS GOOGLE MAPS AVEC LE POINT GPS ROUGE -->
          <div class="google-maps-card glass-panel">
            <div class="map-card-topbar">
              <div>
                <span class="step-num">3</span>
                <span class="card-badge">🗺️ Repérage Géographique</span>
                <h2 class="card-section-title">Localisation Directe avec Point GPS Rouge</h2>
                <p class="card-section-desc">
                  Point GPS rouge centré sur <strong>${s.destination} (${destData.country})</strong>. 
                  Consultez la cartographie interactive et accédez à l'application Google Maps en un clic.
                </p>
              </div>

              <!-- Bouton direct Google Maps -->
              <a 
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.destination + ' ' + destData.country)}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn-open-google-maps"
                id="link-open-google-maps"
              >
                <span class="gps-pin-pulse">📍</span>
                <span>Ouvrir directement dans Google Maps (Point GPS Rouge)</span>
              </a>
            </div>

            <!-- Conteneur de la Carte avec repère GPS rouge stylisé -->
            <div class="interactive-map-frame">
              <iframe 
                id="destination-map-iframe"
                title="Carte Google Maps ${s.destination}"
                class="map-iframe-embed"
                loading="lazy"
                allowfullscreen
                src="https://maps.google.com/maps?q=${encodeURIComponent(s.destination + ' ' + destData.country)}&t=&z=12&ie=UTF8&iwloc=&output=embed"
              ></iframe>

              <div class="map-gps-marker-overlay">
                <div class="red-marker-pin">
                  <div class="pin-head"></div>
                  <div class="pin-pulse"></div>
                </div>
                <div class="pin-label-card">
                  <strong>📍 Point GPS : ${s.destination}</strong>
                  <span>Lat: ${destData.coordinates.lat} · Lng: ${destData.coordinates.lng}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 4 : SUGGESTIONS SUR MESURE SELON LE TYPE CHOISI & FILTRE ANIMAUX -->
          <div class="tailored-suggestions-card glass-panel">
            <div class="suggestions-card-topbar">
              <div>
                <span class="step-num">4</span>
                <span class="card-badge">🌟 Programme Recommandé</span>
                <h2 class="card-section-title">Suggestions Sur Mesure : ${activeType.name} à ${s.destination}</h2>
                <p class="card-section-desc">
                  Recommandations d'endroits à visiter, d'activités, de restaurants et de logements 
                  débloquées par le style choisi et adaptées à votre profil.
                </p>
              </div>

              <!-- Statut animaux de compagnie -->
              <div class="pet-status-banner-box ${s.hasPets ? 'pet-enabled' : 'pet-disabled'}">
                <span class="pet-icon-large">${s.hasPets ? '🐾' : '🐕'}</span>
                <div>
                  <strong>${s.hasPets ? 'Animaux de compagnie déclarés' : 'Voyage sans animal de compagnie'}</strong>
                  <div class="sub">${s.hasPets ? 'Mention obligatoire de compatibilité affichée sur chaque lieu' : 'Affichage complet'}</div>
                </div>
              </div>
            </div>

            <!-- Grille des 4 pôles de suggestions sur mesure -->
            <div class="suggestions-blocks-grid">
              
              <!-- 4.1 Endroits à visiter -->
              <div class="suggestion-block-box">
                <div class="box-header">
                  <span class="box-icon">🏛️</span>
                  <h3>Endroits Incontournables à Visiter</h3>
                </div>
                <div class="items-list">
                  ${destData.places.map(p => `
                    <div class="recommendation-item-card">
                      <div class="rec-title-row">
                        <strong>${p.name}</strong>
                        <span class="badge-pet ${p.petFriendly ? 'pet-yes' : 'pet-no'}">
                          ${p.petFriendly ? '🐾 Animaux bienvenus' : '🚫 Animaux non admis'}
                        </span>
                      </div>
                      <p class="rec-desc">${p.desc}</p>
                      <div class="rec-pet-detail">
                        <em>Précision animaux : ${p.petNote}</em>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- 4.2 Activités recommandées -->
              <div class="suggestion-block-box">
                <div class="box-header">
                  <span class="box-icon">🎟️</span>
                  <h3>Activités & Expériences Recommandées</h3>
                </div>
                <div class="items-list">
                  ${destData.activities.map(a => `
                    <div class="recommendation-item-card">
                      <div class="rec-title-row">
                        <strong>${a.name}</strong>
                        <span class="badge-pet ${a.petFriendly ? 'pet-yes' : 'pet-no'}">
                          ${a.petFriendly ? '🐾 Animaux bienvenus' : '🚫 Animaux non admis'}
                        </span>
                      </div>
                      <div class="rec-meta-row">
                        <span class="meta-price">Prix : ~${a.price} € / pers</span>
                        <span class="meta-duration">Durée : ${a.duration}</span>
                      </div>
                      <div class="rec-pet-detail">
                        <em>Précision animaux : ${a.petNote}</em>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- 4.3 Restaurants où aller -->
              <div class="suggestion-block-box">
                <div class="box-header">
                  <span class="box-icon">🍽️</span>
                  <h3>Restaurants & Adresses Gourmandes</h3>
                </div>
                <div class="items-list">
                  ${destData.restaurants.map(r => `
                    <div class="recommendation-item-card">
                      <div class="rec-title-row">
                        <strong>${r.name}</strong>
                        <span class="badge-pet ${r.petFriendly ? 'pet-yes' : 'pet-no'}">
                          ${r.petFriendly ? '🐾 Animaux bienvenus' : '🚫 Animaux non admis'}
                        </span>
                      </div>
                      <div class="rec-meta-row">
                        <span class="meta-style">${r.style}</span>
                        <span class="meta-price">Budget : ${r.priceRange}</span>
                      </div>
                      <div class="rec-pet-detail">
                        <em>Précision animaux : ${r.petNote}</em>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- 4.4 Logements à choisir -->
              <div class="suggestion-block-box">
                <div class="box-header">
                  <span class="box-icon">🏨</span>
                  <h3>Logements & Hébergements Recommandés</h3>
                </div>
                <div class="items-list">
                  ${destData.hotels.map(h => `
                    <div class="recommendation-item-card">
                      <div class="rec-title-row">
                        <strong>${h.name}</strong>
                        <span class="badge-pet ${h.petFriendly ? 'pet-yes' : 'pet-no'}">
                          ${h.petFriendly ? '🐾 Animaux bienvenus' : '🚫 Animaux non admis'}
                        </span>
                      </div>
                      <div class="rec-meta-row">
                        <span class="meta-stars">${'⭐'.repeat(h.stars)} (${h.stars} étoiles)</span>
                        <span class="meta-price">~${h.pricePerNight} € / nuit</span>
                      </div>
                      <div class="rec-pet-detail">
                        <em>Précision animaux : ${h.petNote}</em>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>
          </div>

          <!-- SECTION 5 : SAUVEGARDE DANS LE RÉPERTOIRE -->
          <div class="save-trip-action-bar glass-panel">
            <div class="save-info">
              <h3>Prêt à créer ce voyage ?</h3>
              <p>Ce dossier sera automatiquement rattaché à votre compte <strong>${AuthManager.currentUser ? AuthManager.currentUser.pseudo : 'Voyageur'}</strong> et classé dans vos <em>Voyages Prévus</em>.</p>
            </div>
            <button type="button" class="btn-save-trip-primary" id="btn-save-dossier-trip">
              <span>💾 Sauvegarder ce Dossier de Voyage</span>
            </button>
          </div>

        </div>

      </div>
    `;
  },

  // Récupère les données d'une destination ou génère un profil par défaut cohérent
  getDestinationData(destName) {
    destName = (destName || 'Tokyo').trim();
    // Recherche exacte ou partielle
    const keys = Object.keys(WORLD_DESTINATIONS_DATA);
    const foundKey = keys.find(k => k.toLowerCase() === destName.toLowerCase()) 
      || keys.find(k => destName.toLowerCase().includes(k.toLowerCase()));

    if (foundKey) {
      return WORLD_DESTINATIONS_DATA[foundKey];
    }

    // Profil générique dynamique pour n'importe quelle destination du monde saisie
    return {
      country: "Destination Mondiale",
      coordinates: { lat: 48.8566, lng: 2.3522 },
      places: [
        { name: `Centre Historique de ${destName}`, desc: "Monuments emblématiques, architecture remarquable et places animées.", petFriendly: true, petNote: "Espaces publics ouverts acceptant les animaux en laisse." },
        { name: `Grand Belvédère & Parcs de ${destName}`, desc: "Vue panoramique spectaculaire sur toute la ville et sentiers arborés.", petFriendly: true, petNote: "Grands espaces verts idéaux pour les balades canines." },
        { name: `Musée National & Palais de ${destName}`, desc: "Patrimoine d'exception et chefs-d'œuvre historiques.", petFriendly: false, petNote: "Musée d'art couvert, animaux strictement interdits." }
      ],
      activities: [
        { name: `Visite guidée authentique à ${destName}`, price: 45, duration: "2h30", petFriendly: true, petNote: "Visite extérieure à pied, animaux bienvenus." },
        { name: `Excursion panoramique d'une journée`, price: 85, duration: "6h", petFriendly: false, petNote: "Navette fermée, animaux non admis." },
        { name: `Pass transports & musées coupe-file`, price: 30, duration: "48h", petFriendly: true, petNote: "Accepté dans les transports en panier de transport." }
      ],
      restaurants: [
        { name: `Bistrot & Table Régionale de ${destName}`, style: "Spécialités locales & Terroir", priceRange: "€€", petFriendly: true, petNote: "Belle terrasse extérieure avec gamelle d'eau offerte." },
        { name: `Restaurant Gastronomique Étoilé`, style: "Haute cuisine raffinée", priceRange: "€€€€", petFriendly: false, petNote: "Salle feutrée, animaux non admis." },
        { name: `Marché Gourmand & Street Food`, style: "Dégustation sur le pouce", priceRange: "€", petFriendly: true, petNote: "Halles ouvertes avec tables conviviales." }
      ],
      hotels: [
        { name: `Grand Hôtel Central ${destName}`, stars: 4, pricePerNight: 160, petFriendly: true, petNote: "Établissement certifié 'Pet-Friendly' avec panier et friandises." },
        { name: `Boutique Hôtel de Charme & Spa`, stars: 5, pricePerNight: 280, petFriendly: false, petNote: "Espace spa exclusif, animaux non admis." },
        { name: `Résidence Cosy & Appartements`, stars: 3, pricePerNight: 85, petFriendly: true, petNote: "Appartements avec kitchenette et balcon acceptant les chiens." }
      ]
    };
  },

  getPriorityLabel(weights) {
    const entries = Object.entries(weights);
    entries.sort((a, b) => b[1] - a[1]);
    const topKey = entries[0][0];
    const cat = BUDGET_CATEGORIES.find(c => c.key === topKey);
    return `${cat ? cat.label : topKey} (${entries[0][1]}%)`;
  },

  // Attachement des écouteurs d'événements interactifs
  attachEvents() {
    const container = document.getElementById('tab-create-trip');
    if (!container) return;

    // 1. Changement de destination
    const destInput = document.getElementById('create-destination');
    if (destInput) {
      destInput.addEventListener('change', (e) => {
        this.currentFormState.destination = e.target.value.trim() || 'Tokyo';
        this.render();
        this.attachEvents();
      });
    }

    // Puces rapides de destinations
    container.querySelectorAll('.quick-dest-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.currentFormState.destination = chip.getAttribute('data-dest');
        this.render();
        this.attachEvents();
      });
    });

    // 2. Nombre de voyageurs (+ / -)
    const btnDec = document.getElementById('btn-decrease-travelers');
    const btnInc = document.getElementById('btn-increase-travelers');
    const travelersInput = document.getElementById('create-travelers');

    if (btnDec && btnInc && travelersInput) {
      btnDec.addEventListener('click', () => {
        let val = parseInt(travelersInput.value, 10) || 1;
        if (val > 1) {
          this.currentFormState.travelersCount = val - 1;
          this.render();
          this.attachEvents();
        }
      });

      btnInc.addEventListener('click', () => {
        let val = parseInt(travelersInput.value, 10) || 1;
        if (val < 20) {
          this.currentFormState.travelersCount = val + 1;
          this.render();
          this.attachEvents();
        }
      });

      travelersInput.addEventListener('change', (e) => {
        this.currentFormState.travelersCount = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1));
        this.render();
        this.attachEvents();
      });
    }

    // 3. Budget maximal par personne
    const budgetInput = document.getElementById('create-budget-person');
    if (budgetInput) {
      budgetInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10) || 100;
        this.currentFormState.maxBudgetPerPerson = val;
        this.applyBudgetWeightsFromType();
        this.render();
        this.attachEvents();
      });
    }

    // 4. Choix des animaux
    container.querySelectorAll('input[name="pet-radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentFormState.hasPets = (e.target.value === 'yes');
        this.render();
        this.attachEvents();
      });
    });

    // 5. Dates
    const startDateInput = document.getElementById('create-start-date');
    const endDateInput = document.getElementById('create-end-date');
    if (startDateInput) {
      startDateInput.addEventListener('change', (e) => {
        this.currentFormState.startDate = e.target.value;
      });
    }
    if (endDateInput) {
      endDateInput.addEventListener('change', (e) => {
        this.currentFormState.endDate = e.target.value;
      });
    }

    // 6. Sélection du style de voyage (les 6 types)
    container.querySelectorAll('.travel-type-card').forEach(card => {
      card.addEventListener('click', () => {
        const typeKey = card.getAttribute('data-type-key');
        this.currentFormState.travelType = typeKey;
        this.applyBudgetWeightsFromType();
        this.render();
        this.attachEvents();
      });
    });

    // 7. Curseurs de budget en temps réel
    container.querySelectorAll('.range-slider-input').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const catKey = e.target.getAttribute('data-cat-key');
        const val = parseInt(e.target.value, 10) || 0;
        this.currentFormState.sliderValues[catKey] = val;
        this.updateLiveSliderValues();
      });
    });

    // Bouton de réinitialisation selon le style
    const btnResetSliders = document.getElementById('btn-reset-sliders-type');
    if (btnResetSliders) {
      btnResetSliders.addEventListener('click', () => {
        this.applyBudgetWeightsFromType();
        this.render();
        this.attachEvents();
      });
    }

    // 8. Bascule Mode par Personne / Total Groupe
    const btnPerPerson = document.getElementById('btn-toggle-per-person');
    const btnGroup = document.getElementById('btn-toggle-group');
    if (btnPerPerson && btnGroup) {
      btnPerPerson.addEventListener('click', () => {
        this.currentFormState.viewMode = 'per_person';
        this.render();
        this.attachEvents();
      });
      btnGroup.addEventListener('click', () => {
        this.currentFormState.viewMode = 'group';
        this.render();
        this.attachEvents();
      });
    }

    // 9. Bouton Sauvegarder dans le Répertoire
    const btnSave = document.getElementById('btn-save-dossier-trip');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        this.saveTripDossier();
      });
    }
  },

  // Mise à jour fluide du DOM sans rerender complet lors du glissement des curseurs
  updateLiveSliderValues() {
    const s = this.currentFormState;
    const travelers = Number(s.travelersCount) || 1;
    const currentSumPerPers = Object.values(s.sliderValues).reduce((a, b) => a + b, 0);
    const currentSumTotal = currentSumPerPers * travelers;
    const isOverBudget = currentSumPerPers > s.maxBudgetPerPerson;

    // Mise à jour de la jauge globale
    const gaugeAmount = document.querySelector('.gauge-amount');
    if (gaugeAmount) {
      gaugeAmount.className = `gauge-amount ${isOverBudget ? 'text-danger' : 'text-success'}`;
      gaugeAmount.innerHTML = s.viewMode === 'per_person' 
        ? `${currentSumPerPers.toLocaleString('fr-FR')} € <small>/ pers</small>` 
        : `${currentSumTotal.toLocaleString('fr-FR')} € <small>total</small>`;
    }

    // Mise à jour des valeurs par catégorie
    BUDGET_CATEGORIES.forEach(cat => {
      const valPerPers = s.sliderValues[cat.key] || 0;
      const valTotal = valPerPers * travelers;
      const pct = s.maxBudgetPerPerson > 0 ? Math.round((valPerPers / s.maxBudgetPerPerson) * 100) : 0;
      
      const card = document.querySelector(`.category-slider-card input[data-cat-key="${cat.key}"]`)?.closest('.category-slider-card');
      if (card) {
        const valHighlight = card.querySelector('.value-highlight');
        const valPct = card.querySelector('.value-pct');
        if (valHighlight) {
          valHighlight.textContent = s.viewMode === 'per_person' ? `${valPerPers.toLocaleString('fr-FR')} €` : `${valTotal.toLocaleString('fr-FR')} €`;
        }
        if (valPct) {
          valPct.textContent = `(${pct}% du budget)`;
        }
      }
    });

    // Mise à jour de la barre segmentée
    const segments = document.querySelectorAll('.gauge-segmented-bar .bar-segment');
    BUDGET_CATEGORIES.forEach((cat, idx) => {
      if (segments[idx]) {
        const val = s.sliderValues[cat.key] || 0;
        const pct = s.maxBudgetPerPerson > 0 ? (val / s.maxBudgetPerPerson) * 100 : 0;
        segments[idx].style.width = `${Math.min(pct, 100)}%`;
      }
    });
  },

  // 10. Sauvegarde définitive dans le Répertoire de l'utilisateur actif
  saveTripDossier() {
    if (!AuthManager.currentUser) {
      alert("Veuillez vous connecter pour sauvegarder votre dossier de voyage.");
      App.showAuthModal();
      return;
    }

    const s = this.currentFormState;
    const userId = AuthManager.currentUser.id;
    const destData = this.getDestinationData(s.destination);
    const activeType = TRAVEL_TYPES[s.travelType] || TRAVEL_TYPES.chill;

    // Déterminer automatiquement si le voyage est passé ou futur selon la date de fin
    const nowStr = new Date().toISOString().split('T')[0];
    const isPast = s.endDate < nowStr;
    const status = isPast ? 'past' : 'planned';

    const newTrip = {
      id: 'trip_' + Date.now(),
      title: `${activeType.name} à ${s.destination}`,
      destination: s.destination,
      country: destData.country,
      coordinates: destData.coordinates,
      travelersCount: s.travelersCount,
      maxBudgetPerPerson: s.maxBudgetPerPerson,
      totalBudget: s.maxBudgetPerPerson * s.travelersCount,
      travelType: s.travelType,
      hasPets: s.hasPets,
      startDate: s.startDate,
      endDate: s.endDate,
      status: status,
      coverImage: 'assets/images/world_filmstrip_1.jpg',
      budgetBreakdown: { ...s.sliderValues },
      rating: isPast ? 5 : null,
      notes: `Voyage créé pour ${s.travelersCount} voyageur${s.travelersCount > 1 ? 's' : ''}. Type : ${activeType.name}. ${s.hasPets ? 'Avec animal de compagnie 🐾' : 'Sans animal'}.`
    };

    // Récupérer la liste des voyages de l'utilisateur
    let userTrips = [];
    const stored = localStorage.getItem(`odyssey_trips_${userId}`);
    if (stored) {
      try {
        userTrips = JSON.parse(stored);
      } catch (e) {
        userTrips = [];
      }
    }

    userTrips.unshift(newTrip);
    localStorage.setItem(`odyssey_trips_${userId}`, JSON.stringify(userTrips));

    // Notification de succès
    this.showSaveSuccessToast(newTrip.title, status);

    // Basculer vers la page Répertoire des Voyages
    setTimeout(() => {
      App.switchTab('repertoire');
    }, 900);
  },

  showSaveSuccessToast(tripTitle, status) {
    const toast = document.createElement('div');
    toast.className = 'save-toast-notification';
    toast.innerHTML = `
      <div class="toast-icon">🎉</div>
      <div class="toast-body">
        <strong>Dossier de voyage enregistré !</strong>
        <span>"${tripTitle}" a été ajouté dans vos voyages ${status === 'planned' ? 'prévus' : 'passés'}.</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('visible');
    }, 50);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
};
