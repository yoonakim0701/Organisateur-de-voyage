/**
 * ODYSSEY - APPLICATION ROUTER & HOMEPAGE CONTROLLER
 * Gère le routage entre les pages, la session utilisateur sur la page d'accueil,
 * la bande de navigation et les suggestions strictement filtrées par catégorie d'âge.
 */

const App = {
  currentTab: 'home',

  init() {
    // 1. Initialiser le gestionnaire d'authentification
    AuthManager.init();

    // 2. Écouter les changements d'authentification
    document.addEventListener('odyssey:auth-change', (e) => {
      this.handleAuthChange(e.detail.user);
    });

    // 3. Initialiser les modules
    TripCreator.init();
    RepertoireManager.init();
    PhotosManager.init();

    // 4. Initialiser la page d'accueil et le routage
    this.renderHomeSuggestions();
    this.updateUserSessionUI();
    this.handleRouting();
    window.addEventListener('hashchange', () => this.handleRouting());

    // 5. Événements globaux
    this.attachGlobalEvents();

    // 6. Si aucun utilisateur n'est connecté, afficher le portail de connexion
    if (!AuthManager.currentUser) {
      this.showAuthModal();
    }
  },

  handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const validTabs = ['home', 'create-trip', 'repertoire', 'photos-vlog'];
    const activeTab = validTabs.includes(hash) ? hash : 'home';
    this.switchTab(activeTab, false);
  },

  switchTab(tabId, updateHash = true) {
    this.currentTab = tabId;
    if (updateHash) {
      window.location.hash = tabId;
    }

    // Mise à jour des boutons de la bande de navigation
    document.querySelectorAll('.nav-tab-item').forEach(btn => {
      const target = btn.getAttribute('data-tab');
      if (target === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Affichage des sections
    document.querySelectorAll('.app-page-section').forEach(sec => {
      if (sec.id === `tab-${tabId}`) {
        sec.classList.remove('hidden');
        sec.classList.add('active');
      } else {
        sec.classList.add('hidden');
        sec.classList.remove('active');
      }
    });

    // Rafraîchissements contextuels
    if (tabId === 'home') {
      this.renderHomeSuggestions();
      this.updateUserSessionUI();
    } else if (tabId === 'create-trip') {
      TripCreator.render();
      TripCreator.attachEvents();
    } else if (tabId === 'repertoire') {
      RepertoireManager.render();
      RepertoireManager.attachEvents();
    } else if (tabId === 'photos-vlog') {
      PhotosManager.render();
      PhotosManager.attachEvents();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  handleAuthChange(user) {
    if (user) {
      this.hideAuthModal();
      this.updateUserSessionUI();
      this.renderHomeSuggestions();
      RepertoireManager.render();
      PhotosManager.render();
    } else {
      this.showAuthModal();
    }
  },

  showAuthModal() {
    const modal = document.getElementById('modal-auth-portal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('auth-modal-open');
    }
  },

  hideAuthModal() {
    const modal = document.getElementById('modal-auth-portal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('auth-modal-open');
    }
  },

  // Met à jour la barre de session utilisateur sur la page d'accueil et le header
  updateUserSessionUI() {
    const user = AuthManager.currentUser;
    const sessionCard = document.getElementById('home-user-session-card');
    const headerUserBadge = document.getElementById('header-user-status-pill');

    if (!user) {
      if (sessionCard) {
        sessionCard.innerHTML = `
          <div class="user-session-prompt">
            <div class="prompt-icon">👤</div>
            <div class="prompt-info">
              <h3>Connectez-vous pour sauvegarder votre carnet</h3>
              <p>Renseignez votre email, pseudo et année de naissance pour débloquer les suggestions personnalisées selon votre âge.</p>
            </div>
            <button class="btn-primary" id="btn-open-login-direct">Se Connecter / Créer un Compte</button>
          </div>
        `;
        const btn = document.getElementById('btn-open-login-direct');
        if (btn) btn.onclick = () => this.showAuthModal();
      }
      if (headerUserBadge) {
        headerUserBadge.innerHTML = `<button class="btn-header-login" id="btn-header-login-action">👤 Connexion</button>`;
        const btn = document.getElementById('btn-header-login-action');
        if (btn) btn.onclick = () => this.showAuthModal();
      }
      return;
    }

    // Récupérer le nombre de dossiers créés par l'utilisateur
    let trips = [];
    const stored = localStorage.getItem(`odyssey_trips_${user.id}`);
    if (stored) {
      try { trips = JSON.parse(stored); } catch(e) {}
    }
    const plannedCount = trips.filter(t => t.status !== 'past').length;
    const pastCount = trips.filter(t => t.status === 'past').length;

    // Mise à jour de la carte de session sur l'Accueil
    if (sessionCard) {
      sessionCard.innerHTML = `
        <div class="active-user-session-inner">
          <div class="user-profile-summary">
            <div class="user-avatar-large ${user.categoryKey}">${user.categoryInfo.icon}</div>
            <div class="user-info-text">
              <div class="user-name-row">
                <h2 class="user-display-name">${user.pseudo}</h2>
                <span class="user-category-badge ${user.categoryKey}">${user.categoryInfo.badge}</span>
              </div>
              <div class="user-meta-sub">
                <span>📧 ${user.email}</span>
                <span class="meta-dot">·</span>
                <span>🎂 <strong>${user.age} ans</strong> (Né en ${user.birthYear})</span>
                <span class="meta-dot">·</span>
                <span>📁 <strong>${trips.length} dossier${trips.length > 1 ? 's' : ''}</strong> (${plannedCount} prévus, ${pastCount} passés)</span>
              </div>
              <p class="user-category-description">${user.categoryInfo.desc}</p>
            </div>
          </div>

          <div class="user-session-actions">
            <button class="btn-secondary-outline" id="btn-switch-account" title="Changer d'utilisateur">
              🔄 Changer de Compte
            </button>
            <button class="btn-secondary-outline" id="btn-user-logout" title="Fermer la session">
              🚪 Déconnexion
            </button>
          </div>
        </div>
      `;

      const btnSwitch = document.getElementById('btn-switch-account');
      const btnLogout = document.getElementById('btn-user-logout');
      if (btnSwitch) btnSwitch.onclick = () => this.showAuthModal();
      if (btnLogout) btnLogout.onclick = () => AuthManager.logout();
    }

    // Badge dans le header principal
    if (headerUserBadge) {
      headerUserBadge.innerHTML = `
        <div class="header-profile-pill" id="btn-header-profile-trigger" title="Session active de ${user.pseudo}">
          <span class="profile-icon">${user.categoryInfo.icon}</span>
          <span class="profile-name"><strong>${user.pseudo}</strong> (${user.age} ans)</span>
          <span class="profile-cat-tag ${user.categoryKey}">${user.categoryInfo.label}</span>
        </div>
      `;
      const pill = document.getElementById('btn-header-profile-trigger');
      if (pill) pill.onclick = () => this.showAuthModal();
    }
  },

  // Suggestions de voyage sur la page d'accueil STRICTEMENT FILTRÉES par la catégorie d'âge de l'utilisateur
  renderHomeSuggestions() {
    const container = document.getElementById('home-suggestions-container');
    if (!container) return;

    const user = AuthManager.currentUser;
    // Si pas de session, catégorie par défaut 'jeune'
    const categoryKey = user ? user.categoryKey : 'jeune';
    const catInfo = AGE_CATEGORIES[categoryKey];

    // Récupérer STRICTEMENT les suggestions de la catégorie de l'utilisateur
    const suggestions = AGE_TRIP_SUGGESTIONS[categoryKey] || AGE_TRIP_SUGGESTIONS.jeune;

    container.innerHTML = `
      <div class="home-suggestions-section">
        
        <!-- En-tête des suggestions filtrées par âge -->
        <div class="suggestions-header-banner">
          <div class="banner-badge-row">
            <span class="tag-age-filter ${categoryKey}">
              ${catInfo.icon} Recommandations Spécifiques : Catégorie ${catInfo.label} (${catInfo.ageRange})
            </span>
            <span class="tag-filter-note">
              ${user ? `Filtre automatique appliqué pour <strong>${user.pseudo} (${user.age} ans)</strong>` : 'Mode découverte'}
            </span>
          </div>

          <h2 class="suggestions-section-title">
            Destinations & Inspirations Taillées pour Vous
          </h2>
          <p class="suggestions-section-sub">
            En tant que profil <strong>${catInfo.label}</strong>, ces voyages privilégient : <em>${catInfo.desc}</em>
          </p>

          <!-- DÉMONSTRATEUR RAPIDE : Permet au testeur de basculer en 1 clic pour vérifier les 3 catégories -->
          <div class="age-category-quick-preview-bar">
            <span class="preview-bar-label">👁️ Aperçu des 3 tranches d'âge :</span>
            <button class="btn-filter-age ${categoryKey === 'jeune' ? 'active' : ''}" data-target-age="jeune">
              🎒 Jeune (18-28 ans)
            </button>
            <button class="btn-filter-age ${categoryKey === 'adulte' ? 'active' : ''}" data-target-age="adulte">
              🧭 Adulte (29-50 ans)
            </button>
            <button class="btn-filter-age ${categoryKey === 'senior' ? 'active' : ''}" data-target-age="senior">
              👑 Senior (51-120 ans)
            </button>
          </div>
        </div>

        <!-- GRILLE DES SUGGESTIONS FILTRÉES -->
        <div class="home-suggestions-grid">
          ${suggestions.map(sug => {
            const typeDef = TRAVEL_TYPES[sug.type] || TRAVEL_TYPES.chill;
            return `
              <div class="suggestion-travel-card glass-panel" data-sug-id="${sug.id}">
                <div class="sug-card-media">
                  <img src="${sug.image}" alt="${sug.title}" class="sug-img" loading="lazy" />
                  <div class="sug-overlay"></div>
                  <span class="sug-type-badge">${typeDef.icon} ${typeDef.name}</span>
                  <span class="sug-duration-pill">⏱️ ${sug.duration}</span>
                </div>

                <div class="sug-card-body">
                  <div class="sug-dest-line">
                    <span class="sug-dest">📍 ${sug.destination}</span>
                    <span class="sug-badge-mini">${sug.badge}</span>
                  </div>

                  <h3 class="sug-title">${sug.title}</h3>
                  <p class="sug-tagline">"${sug.tagline}"</p>

                  <div class="sug-highlights-list">
                    ${sug.highlights.slice(0, 3).map(h => `
                      <div class="sug-highlight-bullet">✓ ${h}</div>
                    `).join('')}
                  </div>

                  <div class="sug-card-footer">
                    <div class="sug-budget-box">
                      <span class="budget-label">Budget Conseillé</span>
                      <strong class="budget-number">${sug.budgetPerPerson} € <small>/ pers</small></strong>
                    </div>

                    <button class="btn-create-from-sug" data-sug-id="${sug.id}">
                      <span>Créer ce Dossier &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    // Événements sur les cartes de suggestion : Pré-remplir la Page 1 (Créer un Voyage)
    container.querySelectorAll('.btn-create-from-sug').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-sug-id');
        const sug = suggestions.find(s => s.id === id);
        if (sug) {
          TripCreator.loadFromSuggestion(sug);
          this.switchTab('create-trip');
        }
      });
    });

    // Événements sur les boutons de démonstration des 3 âges
    container.querySelectorAll('.btn-filter-age').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target-age');
        // Trouver un utilisateur démo correspondant à cette tranche
        const demoUser = DEFAULT_SAMPLE_USERS.find(u => {
          const c = AuthManager.calculateAgeAndCategory(u.birthYear);
          return c.categoryKey === target;
        });

        if (demoUser) {
          AuthManager.loginDemoUser(demoUser.id);
        }
      });
    });
  },

  attachGlobalEvents() {
    // Navigation par onglets de la bande
    document.querySelectorAll('.nav-tab-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Bascule de thème clair / sombre
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeBtn.innerHTML = isDark ? '☀️ Mode Lumineux' : '🌙 Mode Sombre';
        localStorage.setItem('odyssey_theme', isDark ? 'dark' : 'light');
      });

      // Restaurer le thème précédent
      if (localStorage.getItem('odyssey_theme') === 'dark') {
        document.body.classList.add('dark-theme');
        themeBtn.innerHTML = '☀️ Mode Lumineux';
      }
    }

    // Bouton de réinitialisation générale aux valeurs de démo
    const btnResetAll = document.getElementById('btn-reset-odyssey-data');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => {
        if (confirm("Réinitialiser l'application aux profils et dossiers de démonstration mondiaux ?")) {
          localStorage.removeItem('odyssey_users');
          localStorage.removeItem('odyssey_active_user_id');
          localStorage.removeItem('odyssey_media_user_lea_jeune');
          localStorage.removeItem('odyssey_media_user_thomas_adulte');
          localStorage.removeItem('odyssey_media_user_helene_senior');
          window.location.reload();
        }
      });
    }
  }
};

// Démarrer l'application au chargement complet du DOM
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
