/**
 * ODYSSEY - AUTHENTIFICATION & GESTION DES UTILISATEURS
 * Gère l'inscription avec Email, Pseudo, Année de naissance,
 * le calcul de l'âge et la catégorisation (Jeune, Adulte, Senior).
 * Sauvegarde la session dans le localStorage.
 */

const AuthManager = {
  currentUser: null,
  users: [],

  init() {
    this.loadUsersFromStorage();
    this.checkActiveSession();
    this.attachDomEvents();
  },

  // 1. Charger les utilisateurs depuis le localStorage
  loadUsersFromStorage() {
    const stored = localStorage.getItem('odyssey_users');
    if (stored) {
      try {
        this.users = JSON.parse(stored);
      } catch (e) {
        console.error("Erreur de parsing des utilisateurs:", e);
        this.users = [];
      }
    }

    // Si aucun utilisateur enregistré, initialiser avec les comptes de démonstration
    if (!this.users || this.users.length === 0) {
      this.users = [...DEFAULT_SAMPLE_USERS];
      this.saveUsersToStorage();

      // Initialiser aussi les voyages des utilisateurs de démo
      Object.keys(DEFAULT_USER_TRIPS).forEach(userId => {
        if (!localStorage.getItem(`odyssey_trips_${userId}`)) {
          localStorage.setItem(`odyssey_trips_${userId}`, JSON.stringify(DEFAULT_USER_TRIPS[userId]));
        }
      });
    }
  },

  saveUsersToStorage() {
    localStorage.setItem('odyssey_users', JSON.stringify(this.users));
  },

  // 2. Vérifier la session active
  checkActiveSession() {
    const activeId = localStorage.getItem('odyssey_active_user_id');
    if (activeId) {
      const found = this.users.find(u => u.id === activeId);
      if (found) {
        this.currentUser = this.hydrateUserData(found);
        return;
      }
    }
    // Si pas de session active, laisser currentUser à null (page de connexion affichée)
    this.currentUser = null;
  },

  // 3. Calcul de l'âge et détermination de la catégorie
  calculateAgeAndCategory(birthYear) {
    const year = parseInt(birthYear, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear) {
      return { isValid: false, message: "Veuillez saisir une année de naissance valide (ex: 2002)" };
    }

    const age = currentYear - year;

    if (age < 18) {
      return { 
        isValid: false, 
        age, 
        message: "L'application est dédiée aux voyageurs majeurs (18 ans et plus)." 
      };
    }
    if (age > 120) {
      return { 
        isValid: false, 
        age, 
        message: "Année de naissance au-delà de 120 ans, veuillez vérifier votre saisie." 
      };
    }

    let categoryKey = 'jeune';
    if (age >= 18 && age <= 28) {
      categoryKey = 'jeune';
    } else if (age >= 29 && age <= 50) {
      categoryKey = 'adulte';
    } else if (age >= 51 && age <= 120) {
      categoryKey = 'senior';
    }

    const categoryInfo = AGE_CATEGORIES[categoryKey];

    return {
      isValid: true,
      age,
      birthYear: year,
      categoryKey,
      categoryInfo
    };
  },

  hydrateUserData(user) {
    const calc = this.calculateAgeAndCategory(user.birthYear);
    return {
      ...user,
      age: calc.isValid ? calc.age : 25,
      categoryKey: calc.isValid ? calc.categoryKey : 'jeune',
      categoryInfo: calc.isValid ? calc.categoryInfo : AGE_CATEGORIES.jeune
    };
  },

  // 4. Inscription d'un nouvel utilisateur
  register(email, pseudo, birthYear) {
    email = (email || '').trim().toLowerCase();
    pseudo = (pseudo || '').trim();

    if (!email || !pseudo || !birthYear) {
      return { success: false, message: "Tous les champs sont obligatoires." };
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "Format d'adresse email invalide." };
    }

    // Vérification de l'âge
    const calc = this.calculateAgeAndCategory(birthYear);
    if (!calc.isValid) {
      return { success: false, message: calc.message };
    }

    // Vérifier si l'utilisateur existe déjà
    const existingIndex = this.users.findIndex(u => u.email === email);
    let user;

    if (existingIndex >= 0) {
      // Mettre à jour l'utilisateur existant
      this.users[existingIndex].pseudo = pseudo;
      this.users[existingIndex].birthYear = calc.birthYear;
      user = this.users[existingIndex];
    } else {
      // Créer un nouvel utilisateur
      user = {
        id: 'user_' + Date.now(),
        email,
        pseudo,
        birthYear: calc.birthYear,
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.users.push(user);
    }

    this.saveUsersToStorage();
    this.setCurrentUser(user);

    // Initialiser une liste de voyages vide s'il n'en a pas
    if (!localStorage.getItem(`odyssey_trips_${user.id}`)) {
      localStorage.setItem(`odyssey_trips_${user.id}`, JSON.stringify([]));
    }

    return { success: true, user: this.currentUser };
  },

  // 5. Connexion par email / sélection de profil
  login(email) {
    email = (email || '').trim().toLowerCase();
    const found = this.users.find(u => u.email.toLowerCase() === email);
    if (!found) {
      return { success: false, message: "Aucun compte trouvé avec cet email. Veuillez créer un compte." };
    }

    this.setCurrentUser(found);
    return { success: true, user: this.currentUser };
  },

  // Connexion rapide avec un compte démo
  loginDemoUser(userId) {
    const found = this.users.find(u => u.id === userId);
    if (found) {
      this.setCurrentUser(found);
      return true;
    }
    return false;
  },

  setCurrentUser(user) {
    this.currentUser = this.hydrateUserData(user);
    localStorage.setItem('odyssey_active_user_id', user.id);
    document.dispatchEvent(new CustomEvent('odyssey:auth-change', { detail: { user: this.currentUser } }));
  },

  // 6. Déconnexion
  logout() {
    this.currentUser = null;
    localStorage.removeItem('odyssey_active_user_id');
    document.dispatchEvent(new CustomEvent('odyssey:auth-change', { detail: { user: null } }));
  },

  // 7. Événements DOM pour la page de connexion
  attachDomEvents() {
    // Calcul dynamique de l'âge lors de la saisie
    const birthYearInput = document.getElementById('auth-birth-year');
    const ageFeedback = document.getElementById('auth-age-feedback');

    if (birthYearInput && ageFeedback) {
      const updateFeedback = () => {
        const val = birthYearInput.value;
        if (!val || val.length < 4) {
          ageFeedback.className = 'age-feedback-badge hidden';
          return;
        }

        const calc = this.calculateAgeAndCategory(val);
        ageFeedback.classList.remove('hidden');

        if (!calc.isValid) {
          ageFeedback.className = 'age-feedback-badge invalid';
          ageFeedback.innerHTML = `⚠️ ${calc.message}`;
        } else {
          ageFeedback.className = `age-feedback-badge valid ${calc.categoryKey}`;
          ageFeedback.innerHTML = `
            <span>🎉 <strong>${calc.age} ans</strong></span>
            <span class="badge-separator">·</span>
            <span>${calc.categoryInfo.badge}</span>
            <span class="badge-desc">${calc.categoryInfo.desc}</span>
          `;
        }
      };

      birthYearInput.addEventListener('input', updateFeedback);
      birthYearInput.addEventListener('change', updateFeedback);
    }

    // Soumission du formulaire d'inscription
    const formRegister = document.getElementById('form-auth-register');
    if (formRegister) {
      formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const pseudo = document.getElementById('auth-pseudo').value;
        const birthYear = document.getElementById('auth-birth-year').value;

        const res = this.register(email, pseudo, birthYear);
        if (!res.success) {
          alert(res.message);
        } else {
          // Connexion réussie, App.js gérera la transition vers l'accueil
        }
      });
    }

    // Bascule entre Inscription et Connexion rapide
    const tabRegister = document.getElementById('tab-btn-register');
    const tabLogin = document.getElementById('tab-btn-login');
    const panelRegister = document.getElementById('auth-panel-register');
    const panelLogin = document.getElementById('auth-panel-login');

    if (tabRegister && tabLogin && panelRegister && panelLogin) {
      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        panelRegister.classList.remove('hidden');
        panelLogin.classList.add('hidden');
      });

      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        panelLogin.classList.remove('hidden');
        panelRegister.classList.add('hidden');
        this.renderLoginAccountsList();
      });
    }
  },

  // Affiche la liste des comptes existants pour connexion directe en 1 clic
  renderLoginAccountsList() {
    const container = document.getElementById('auth-accounts-list');
    if (!container) return;

    if (this.users.length === 0) {
      container.innerHTML = `<p class="text-muted">Aucun compte enregistré pour le moment.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="existing-accounts-grid">
        ${this.users.map(u => {
          const hydrated = this.hydrateUserData(u);
          return `
            <div class="account-card-select" data-user-id="${u.id}">
              <div class="account-avatar">${hydrated.categoryInfo.icon}</div>
              <div class="account-details">
                <div class="account-name">${u.pseudo}</div>
                <div class="account-meta">${u.email} · <strong>${hydrated.age} ans</strong></div>
                <span class="account-category-pill ${hydrated.categoryKey}">${hydrated.categoryInfo.badge}</span>
              </div>
              <button class="btn-select-account">Connexion &rarr;</button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.account-card-select').forEach(card => {
      card.addEventListener('click', () => {
        const uid = card.getAttribute('data-user-id');
        this.loginDemoUser(uid);
      });
    });
  }
};
