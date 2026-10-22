/**
 * ODYSSEY - PHOTOS & VIDÉOS RANGÉES PAR VOYAGE
 * Galerie de médias classée par dossier de voyage, import de fichiers
 * et bouton direct "Créer un Vlog en 1 clic".
 */

const PhotosManager = {
  currentTripId: 'all',
  mediaList: [],

  init() {
    this.loadMediaFromStorage();
    this.render();
    this.attachEvents();
  },

  loadMediaFromStorage() {
    if (!AuthManager.currentUser) {
      this.mediaList = [...DEFAULT_MEDIA_GALLERY];
      return;
    }
    const userId = AuthManager.currentUser.id;
    const stored = localStorage.getItem(`odyssey_media_${userId}`);
    if (stored) {
      try {
        this.mediaList = JSON.parse(stored);
      } catch (e) {
        this.mediaList = [...DEFAULT_MEDIA_GALLERY];
      }
    } else {
      // Pré-remplir avec la galerie initiale pour ce premier utilisateur
      this.mediaList = [...DEFAULT_MEDIA_GALLERY];
      this.saveMediaToStorage();
    }
  },

  saveMediaToStorage() {
    if (!AuthManager.currentUser) return;
    const userId = AuthManager.currentUser.id;
    localStorage.setItem(`odyssey_media_${userId}`, JSON.stringify(this.mediaList));
  },

  selectTrip(tripId) {
    this.currentTripId = tripId;
    this.render();
    this.attachEvents();
  },

  render() {
    const container = document.getElementById('tab-photos-vlog');
    if (!container) return;

    this.loadMediaFromStorage();

    // Récupérer les voyages de l'utilisateur actif
    let userTrips = [];
    if (AuthManager.currentUser) {
      const stored = localStorage.getItem(`odyssey_trips_${AuthManager.currentUser.id}`);
      if (stored) {
        try { userTrips = JSON.parse(stored); } catch(e) {}
      }
    }

    // Filtrer les médias selon le voyage sélectionné
    const filteredMedia = this.mediaList.filter(m => {
      if (this.currentTripId === 'all') return true;
      return m.tripId === this.currentTripId;
    });

    const activeTrip = userTrips.find(t => t.id === this.currentTripId);
    const vlogReadyCount = filteredMedia.filter(m => m.favoriteForVlog).length;

    container.innerHTML = `
      <div class="photos-page-wrapper">
        
        <!-- Hero de la section Photos & Studio Vlog -->
        <div class="photos-hero-card glass-panel">
          <div class="hero-text-block">
            <span class="banner-pill">📸 Galerie & Studio Cinéma</span>
            <h1 class="hero-title">Photos, Vidéos & Studio Vlog en 1 Clic</h1>
            <p class="hero-sub">
              Vos médias sont automatiquement rangés par dossier de voyage. 
              Sélectionnez vos fichiers préférés, personnalisez la musique, la police et le template vidéo 
              pour générer instantanément votre vlog exportable.
            </p>
          </div>

          <div class="hero-cta-block">
            <button class="btn-launch-vlog-pulse" id="btn-trigger-vlog-studio">
              <span class="pulse-icon">🎬</span>
              <div class="pulse-text">
                <strong>Créer un Vlog en 1 Clic</strong>
                <small>${vlogReadyCount} fichier${vlogReadyCount > 1 ? 's' : ''} sélectionné${vlogReadyCount > 1 ? 's' : ''}</small>
              </div>
            </button>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- SÉLECTEUR DE VOYAGE (MÉDIAS RANGÉS PAR DOSSIER DE VOYAGE) -->
        <!-- ========================================================= -->
        <div class="trip-media-selector-bar glass-panel">
          <div class="selector-field">
            <label for="select-trip-filter" class="selector-label">
              <span>📁</span> Afficher les médias du voyage :
            </label>
            <select id="select-trip-filter" class="input-select-modern">
              <option value="all" ${this.currentTripId === 'all' ? 'selected' : ''}>🌟 Tous les voyages confondus (${this.mediaList.length} fichiers)</option>
              ${userTrips.map(t => `
                <option value="${t.id}" ${this.currentTripId === t.id ? 'selected' : ''}>
                  ${t.status === 'past' ? '🏛️' : '🛫'} ${t.title} (${t.destination})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Puces de filtrage rapide -->
          <div class="trip-chips-row">
            <button class="trip-chip ${this.currentTripId === 'all' ? 'active' : ''}" data-filter-id="all">
              Tous (${this.mediaList.length})
            </button>
            ${userTrips.map(t => {
              const count = this.mediaList.filter(m => m.tripId === t.id).length;
              return `
                <button class="trip-chip ${this.currentTripId === t.id ? 'active' : ''}" data-filter-id="${t.id}">
                  ${t.destination} (${count})
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ZONE D'AJOUT / GLISSER-DÉPOSER DE NOUVELLES PHOTOS OU VIDÉOS -->
        <div class="upload-media-card glass-panel" id="media-dropzone">
          <div class="dropzone-center">
            <div class="drop-icon">📷 🎥</div>
            <h3>Importez vos photos et vidéos de voyage</h3>
            <p>Glissez vos fichiers ici ou parcourez votre appareil (JPG, PNG, WEBP, MP4)</p>
            
            <div class="upload-options-line">
              <div class="opt-field">
                <label>Associer au dossier :</label>
                <select id="upload-target-trip" class="input-select-compact">
                  ${userTrips.map(t => `<option value="${t.id}">${t.destination} - ${t.title}</option>`).join('')}
                  <option value="trip_general">📁 Sans dossier spécifique</option>
                </select>
              </div>
              <div class="opt-field">
                <label>Légende par défaut :</label>
                <input type="text" id="upload-caption-text" placeholder="Ex: Coucher de soleil inoubliable..." class="input-text-compact" />
              </div>
            </div>

            <label class="btn-primary" style="cursor: pointer; display: inline-block; margin-top: 1rem;">
              <span>📁 Parcourir les fichiers</span>
              <input type="file" id="file-media-input" multiple accept="image/*,video/*" style="display:none;" />
            </label>
          </div>
        </div>

        <!-- BARRE DE CONTRÔLE DE LA GALERIE & BOUTON VLOG EN 1 CLIC -->
        <div class="gallery-controls-bar glass-panel">
          <div class="controls-left">
            <h3 class="gallery-title">
              ${activeTrip ? `Médias de "${activeTrip.title}"` : 'Tous vos Souvenirs de Voyage'}
              <span class="badge-count">${filteredMedia.length}</span>
            </h3>
          </div>

          <div class="controls-right">
            <button class="btn-secondary-outline" id="btn-select-all-vlog">
              ✓ Tout inclure dans le Vlog
            </button>
            <button class="btn-secondary-outline" id="btn-deselect-all-vlog">
              ✕ Tout désélectionner
            </button>
            <button class="btn-primary" id="btn-open-vlog-action">
              🎬 Lancer le Vlog en 1 Clic (${vlogReadyCount})
            </button>
          </div>
        </div>

        <!-- GRILLE DES PHOTOS ET VIDÉOS -->
        <div class="media-gallery-grid">
          ${filteredMedia.length === 0 ? `
            <div class="empty-media-box glass-panel" style="grid-column: 1 / -1;">
              <div class="empty-icon">🖼️</div>
              <h3>Aucun fichier dans ce dossier de voyage</h3>
              <p>Glissez-déposez des photos ou vidéos ci-dessus pour composer l'album et votre vlog.</p>
            </div>
          ` : `
            ${filteredMedia.map(m => `
              <div class="media-card glass-panel ${m.favoriteForVlog ? 'selected-for-vlog' : ''}" data-media-id="${m.id}">
                <div class="media-thumb-frame">
                  <img src="${m.url}" alt="${m.title || 'Photo de voyage'}" class="media-thumb-img" loading="lazy" />
                  
                  <!-- Checkbox pour inclure dans le Vlog -->
                  <label class="vlog-checkbox-label" title="Inclure dans le montage du Vlog">
                    <input 
                      type="checkbox" 
                      class="chk-include-vlog" 
                      data-id="${m.id}" 
                      ${m.favoriteForVlog ? 'checked' : ''} 
                    />
                    <span class="custom-chk-box">🎬 Vlog</span>
                  </label>

                  <span class="media-type-badge">${m.type === 'video' ? '🎥 Vidéo' : '📷 Photo'}</span>
                </div>

                <div class="media-info-block">
                  <div class="media-title">${m.title || 'Sans titre'}</div>
                  <div class="media-caption">${m.caption || 'Souvenir de voyage'}</div>
                  <div class="media-footer-line">
                    <span class="media-dest-tag">📍 ${m.destination || 'Monde'}</span>
                    <button class="btn-delete-media" data-id="${m.id}" title="Supprimer ce média">&times;</button>
                  </div>
                </div>
              </div>
            `).join('')}
          `}
        </div>

      </div>
    `;
  },

  attachEvents() {
    const container = document.getElementById('tab-photos-vlog');
    if (!container) return;

    // Changement de voyage via la liste déroulante
    const selectFilter = document.getElementById('select-trip-filter');
    if (selectFilter) {
      selectFilter.addEventListener('change', (e) => {
        this.selectTrip(e.target.value);
      });
    }

    // Puces rapides de voyages
    container.querySelectorAll('.trip-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.selectTrip(chip.getAttribute('data-filter-id'));
      });
    });

    // Checkbox d'inclusion au vlog
    container.querySelectorAll('.chk-include-vlog').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = chk.getAttribute('data-id');
        const item = this.mediaList.find(m => m.id === id);
        if (item) {
          item.favoriteForVlog = chk.checked;
          this.saveMediaToStorage();
          const card = chk.closest('.media-card');
          if (card) {
            if (chk.checked) card.classList.add('selected-for-vlog');
            else card.classList.remove('selected-for-vlog');
          }
          this.updateVlogCounters();
        }
      });
    });

    // Tout sélectionner / Tout désélectionner
    const btnSelectAll = document.getElementById('btn-select-all-vlog');
    const btnDeselectAll = document.getElementById('btn-deselect-all-vlog');
    if (btnSelectAll) {
      btnSelectAll.addEventListener('click', () => {
        this.mediaList.forEach(m => {
          if (this.currentTripId === 'all' || m.tripId === this.currentTripId) {
            m.favoriteForVlog = true;
          }
        });
        this.saveMediaToStorage();
        this.render();
        this.attachEvents();
      });
    }
    if (btnDeselectAll) {
      btnDeselectAll.addEventListener('click', () => {
        this.mediaList.forEach(m => {
          if (this.currentTripId === 'all' || m.tripId === this.currentTripId) {
            m.favoriteForVlog = false;
          }
        });
        this.saveMediaToStorage();
        this.render();
        this.attachEvents();
      });
    }

    // Bouton de suppression d'un média
    container.querySelectorAll('.btn-delete-media').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.mediaList = this.mediaList.filter(m => m.id !== id);
        this.saveMediaToStorage();
        this.render();
        this.attachEvents();
      });
    });

    // Import de fichiers par drag & drop ou bouton
    const fileInput = document.getElementById('file-media-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleFilesUpload(e.target.files);
      });
    }

    const dropzone = document.getElementById('media-dropzone');
    if (dropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.add('drag-over');
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.remove('drag-over');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files) {
          this.handleFilesUpload(e.dataTransfer.files);
        }
      });
    }

    // Boutons de lancement du Studio Vlog
    const btnLaunchHero = document.getElementById('btn-trigger-vlog-studio');
    const btnLaunchBar = document.getElementById('btn-open-vlog-action');

    const openStudio = () => {
      // Filtrer les médias choisis pour le voyage actif
      const selected = this.mediaList.filter(m => {
        const matchesTrip = (this.currentTripId === 'all' || m.tripId === this.currentTripId);
        return matchesTrip && m.favoriteForVlog;
      });

      // S'il n'y en a aucun coché, prendre tous les médias du voyage
      const toSend = selected.length > 0 ? selected : this.mediaList.filter(m => this.currentTripId === 'all' || m.tripId === this.currentTripId);

      VlogStudio.openWithMedia(toSend, this.currentTripId);
    };

    if (btnLaunchHero) btnLaunchHero.addEventListener('click', openStudio);
    if (btnLaunchBar) btnLaunchBar.addEventListener('click', openStudio);
  },

  handleFilesUpload(files) {
    if (!files || files.length === 0) return;

    const targetTripSelect = document.getElementById('upload-target-trip');
    const targetTripId = targetTripSelect ? targetTripSelect.value : (this.currentTripId !== 'all' ? this.currentTripId : 'trip_general');
    const captionInput = document.getElementById('upload-caption-text');
    const baseCaption = captionInput && captionInput.value.trim() ? captionInput.value.trim() : 'Souvenir de voyage';

    Array.from(files).forEach((file, index) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();

      reader.onload = (e) => {
        const newMedia = {
          id: 'media_' + Date.now() + '_' + index,
          tripId: targetTripId,
          destination: 'Voyage',
          url: e.target.result,
          type: isVideo ? 'video' : 'image',
          title: file.name.split('.')[0] || 'Nouveau fichier',
          caption: baseCaption,
          favoriteForVlog: true
        };

        this.mediaList.unshift(newMedia);
        this.saveMediaToStorage();
        this.render();
        this.attachEvents();
      };

      reader.readAsDataURL(file);
    });
  },

  updateVlogCounters() {
    const filtered = this.mediaList.filter(m => {
      if (this.currentTripId === 'all') return true;
      return m.tripId === this.currentTripId;
    });
    const count = filtered.filter(m => m.favoriteForVlog).length;

    const heroCounter = document.querySelector('.pulse-text small');
    if (heroCounter) heroCounter.textContent = `${count} fichier${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`;

    const barBtn = document.getElementById('btn-open-vlog-action');
    if (barBtn) barBtn.textContent = `🎬 Lancer le Vlog en 1 Clic (${count})`;
  }
};
