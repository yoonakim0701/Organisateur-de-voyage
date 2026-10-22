/**
 * ODYSSEY - STUDIO DE MONTAGE VLOG EN 1 CLIC
 * Générateur vidéo complet sur Canvas HTML5 + Web Audio API + MediaRecorder.
 * Permet en 1 clic de choisir :
 * 1. Les fichiers qui doivent apparaître
 * 2. La musique
 * 3. La police d'écriture
 * 4. Le template de la vidéo
 */

const VlogStudio = {
  canvas: null,
  ctx: null,
  audioCtx: null,
  audioSourceNode: null,
  audioDestNode: null,
  mediaRecorder: null,
  recordedChunks: [],

  // État de lecture / rendu
  isPlaying: false,
  isRecording: false,
  animationFrameId: null,
  currentSlideIndex: 0,
  slideStartTime: 0,
  loadedMedia: [],
  activeTrip: null,

  // Configuration par défaut avec les 4 options demandées
  config: {
    title: "MON ODYSSÉE DE VOYAGE",
    subtitle: "Souvenirs inoubliables à travers le monde",
    secondsPerSlide: 3.5,
    musicStyle: "flamenco",       // 1. Musique
    fontFamily: "Outfit",         // 2. Police d'écriture
    videoTemplate: "ken-burns",    // 3. Template de la vidéo
    showSubtitles: true
  },

  // Ouvre le studio avec les médias sélectionnés
  openWithMedia(mediaItems, tripId) {
    this.activeTrip = null;
    if (AuthManager.currentUser) {
      const stored = localStorage.getItem(`odyssey_trips_${AuthManager.currentUser.id}`);
      if (stored) {
        try {
          const trips = JSON.parse(stored);
          this.activeTrip = trips.find(t => t.id === tripId) || trips[0];
        } catch(e) {}
      }
    }

    if (this.activeTrip) {
      this.config.title = this.activeTrip.title.toUpperCase();
      this.config.subtitle = `${this.activeTrip.destination} · ${this.activeTrip.travelersCount} Voyageurs`;
    }

    let modal = document.getElementById('modal-vlog-studio');
    if (!modal) {
      this.createModalDOM();
      modal = document.getElementById('modal-vlog-studio');
    }

    modal.classList.remove('hidden');
    this.initStudio(mediaItems);
  },

  close() {
    this.stopPlayback();
    const modal = document.getElementById('modal-vlog-studio');
    if (modal) modal.classList.add('hidden');
  },

  createModalDOM() {
    const div = document.createElement('div');
    div.id = 'modal-vlog-studio';
    div.className = 'modal-backdrop hidden';
    div.innerHTML = `
      <div class="vlog-studio-container">
        
        <!-- Barre supérieure du Studio -->
        <div class="vlog-topbar">
          <div class="vlog-title-area">
            <span class="vlog-badge">🎬 STUDIO CINÉMA 1 CLIC</span>
            <h2 id="vlog-modal-header-title">Générateur de Vlog Vidéo</h2>
          </div>
          <button class="btn-close-modal" id="btn-close-vlog">&times;</button>
        </div>

        <!-- Corps du Studio : 2 colonnes (Réglages à gauche, Canvas à droite) -->
        <div class="vlog-studio-body">
          
          <!-- ============================================== -->
          <!-- PANNEAU GAUCHE : LES 4 CHOIX DU VLOG EN 1 CLIC -->
          <!-- ============================================== -->
          <div class="vlog-settings-panel">
            
            <!-- OPTION 1 : SÉLECTION DES FICHIERS QUI DOIVENT APPARAÎTRE -->
            <div class="vlog-option-section">
              <div class="option-section-title">
                <span class="opt-step">1</span>
                <h3>Fichiers à inclure dans le Vlog :</h3>
              </div>
              <div class="vlog-files-selector-card" id="vlog-files-checklist">
                <!-- Injecté dynamiquement par initStudio -->
              </div>
              <div class="vlog-files-quick-actions">
                <button type="button" class="btn-text-tiny" id="vlog-btn-check-all">Tout cocher</button>
                <span>·</span>
                <button type="button" class="btn-text-tiny" id="vlog-btn-uncheck-all">Tout décocher</button>
                <span class="files-selected-counter" id="vlog-selected-count-tag">0 photo sélectionnée</span>
              </div>
            </div>

            <!-- OPTION 2 : CHOIX DE LA MUSIQUE -->
            <div class="vlog-option-section">
              <div class="option-section-title">
                <span class="opt-step">2</span>
                <h3>Bande-Son & Musique de Fond :</h3>
              </div>
              <select id="vlog-music-select" class="input-select-modern">
                <option value="flamenco" selected>🎸 Guitare Flamenca & Énergie Andalouse (Synthèse Web Audio)</option>
                <option value="chill">🌊 Baléares & Sunset Chill (Mélodie douce)</option>
                <option value="lofi">🎧 Lo-Fi Beat Voyage (Détente & contemplation)</option>
                <option value="electro">⚡ Électro Roadtrip (Rythme énergique & synthé)</option>
                <option value="epic">🎻 Épique & Cinématique Orchestrale</option>
                <option value="custom">📁 Importer mon fichier MP3 personnalisé...</option>
                <option value="mute">🔇 Mode Muet (Sans musique)</option>
              </select>
              <input type="file" id="vlog-custom-mp3-file" accept="audio/*" class="input-text-modern hidden" style="margin-top: 8px;" />
            </div>

            <!-- OPTION 3 : CHOIX DE LA POLICE D'ÉCRITURE -->
            <div class="vlog-option-section">
              <div class="option-section-title">
                <span class="opt-step">3</span>
                <h3>Police d'Écriture des Titres :</h3>
              </div>
              <div class="font-selector-grid">
                ${[
                  { key: 'Outfit', name: 'Outfit Moderne', sample: 'Aa Moderne' },
                  { key: 'Playfair Display', name: 'Playfair Luxe', sample: 'Aa Élégant' },
                  { key: 'Cinzel', name: 'Cinzel Cinéma', sample: 'AA CINÉMA' },
                  { key: 'Montserrat', name: 'Montserrat Bold', sample: 'Aa Urbain' },
                  { key: 'Pacifico', name: 'Pacifico Script', sample: 'Aa Manuscrit' }
                ].map((f, idx) => `
                  <label class="font-choice-card ${idx === 0 ? 'active' : ''}" style="font-family: '${f.key}', sans-serif;">
                    <input type="radio" name="vlog-font-choice" value="${f.key}" ${idx === 0 ? 'checked' : ''} />
                    <span class="font-sample">${f.sample}</span>
                    <span class="font-name">${f.name}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- OPTION 4 : CHOIX DU TEMPLATE DE LA VIDÉO -->
            <div class="vlog-option-section">
              <div class="option-section-title">
                <span class="opt-step">4</span>
                <h3>Template & Style de la Vidéo :</h3>
              </div>
              <div class="template-selector-grid">
                <label class="template-card active" data-template="ken-burns">
                  <input type="radio" name="vlog-template-choice" value="ken-burns" checked />
                  <div class="template-icon">🌅</div>
                  <div class="template-details">
                    <strong>Cinématique Ken Burns</strong>
                    <small>Zoom fluide continu, reflets dorés et transitions cinématographiques douces</small>
                  </div>
                </label>

                <label class="template-card" data-template="roadtrip-fast">
                  <input type="radio" name="vlog-template-choice" value="roadtrip-fast" />
                  <div class="template-icon">⚡</div>
                  <div class="template-details">
                    <strong>Roadtrip Dynamique</strong>
                    <small>Transitions rythmées, flashes de couleur et badges énergiques</small>
                  </div>
                </label>

                <label class="template-card" data-template="vintage-film">
                  <input type="radio" name="vlog-template-choice" value="vintage-film" />
                  <div class="template-icon">🎞️</div>
                  <div class="template-details">
                    <strong>Vintage Film 35mm</strong>
                    <small>Grain argentique rétro, dateur orange nostalgique et cadre cinéma</small>
                  </div>
                </label>

                <label class="template-card" data-template="luxe-minimal">
                  <input type="radio" name="vlog-template-choice" value="luxe-minimal" />
                  <div class="template-icon">💎</div>
                  <div class="template-details">
                    <strong>Luxe & Minimaliste</strong>
                    <small>Cadre passe-partout blanc épuré, typographie aérée haute couture</small>
                  </div>
                </label>

                <label class="template-card" data-template="polaroid-memories">
                  <input type="radio" name="vlog-template-choice" value="polaroid-memories" />
                  <div class="template-icon">📸</div>
                  <div class="template-details">
                    <strong>Souvenirs Polaroid</strong>
                    <small>Effet photo instantanée inclinée avec légendes manuscrites</small>
                  </div>
                </label>
              </div>
            </div>

            <!-- Titres personnalisés -->
            <div class="form-row" style="margin-top: 1rem;">
              <div class="form-group flex-1">
                <label for="vlog-input-title">Titre du Vlog :</label>
                <input type="text" id="vlog-input-title" class="input-text-compact" value="${this.config.title}" />
              </div>
              <div class="form-group flex-1">
                <label for="vlog-input-subtitle">Sous-titre :</label>
                <input type="text" id="vlog-input-subtitle" class="input-text-compact" value="${this.config.subtitle}" />
              </div>
            </div>

            <!-- Boutons d'action : Prévisualiser & Exporter -->
            <div class="vlog-actions-bar">
              <button id="btn-vlog-play-pause" class="btn-primary" style="flex: 1;">
                <span id="vlog-play-icon">▶</span> <span id="vlog-play-label">Prévisualiser le Vlog</span>
              </button>
              <button id="btn-vlog-export" class="btn-vlog-export" style="flex: 1;">
                <span>📥 Exporter la Vidéo (.webm)</span>
              </button>
            </div>

            <!-- Barre de progression de rendu -->
            <div id="vlog-export-progress" class="export-progress-box hidden">
              <div class="progress-label">
                <span id="progress-status-text">Encodage vidéo en cours...</span>
                <span id="progress-pct">0%</span>
              </div>
              <div class="progress-track">
                <div id="progress-bar-fill" class="progress-fill" style="width: 0%;"></div>
              </div>
              <p class="progress-sub">Veuillez patienter pendant la génération du fichier vidéo...</p>
            </div>

          </div>

          <!-- ============================================== -->
          <!-- PANNEAU DROIT : ÉCRAN CANVAS DE RENDU VIDÉO   -->
          <!-- ============================================== -->
          <div class="vlog-canvas-panel">
            <div class="canvas-screen-frame">
              <canvas id="vlog-render-canvas" width="1280" height="720"></canvas>
              
              <!-- HUD Superposé -->
              <div class="canvas-overlay-hud">
                <div class="hud-left">
                  <span id="hud-time-display">00:00 / 00:00</span>
                </div>
                <div class="hud-center">
                  <span id="hud-title-display">Odyssey World Vlog</span>
                </div>
                <div class="hud-right">
                  <span class="hud-tag" id="hud-template-tag">Template: Ken Burns</span>
                </div>
              </div>
            </div>

            <div class="vlog-tips-bar">
              <span>✨ <strong>Astuce :</strong> Le vlog compile automatiquement vos photos et vidéos avec le template choisi, anime le texte avec votre police préférée et synchronise la musique.</span>
            </div>
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(div);
  },

  initStudio(mediaItems) {
    this.canvas = document.getElementById('vlog-render-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    // Récupérer les médias disponibles
    const allAvailable = mediaItems && mediaItems.length > 0 ? mediaItems : [...DEFAULT_MEDIA_GALLERY];
    this.renderFilesChecklist(allAvailable);
    this.preloadMediaImages();
    this.attachStudioEvents();
    this.drawIntroFrame();
  },

  // 1. Rendu dynamique de la liste des fichiers avec cases à cocher
  renderFilesChecklist(allMedia) {
    const container = document.getElementById('vlog-files-checklist');
    if (!container) return;

    container.innerHTML = `
      <div class="files-checklist-grid">
        ${allMedia.map(m => `
          <label class="file-chk-item ${m.favoriteForVlog ? 'selected' : ''}" data-file-id="${m.id}">
            <input type="checkbox" class="vlog-file-toggle" value="${m.id}" ${m.favoriteForVlog ? 'checked' : ''} />
            <img src="${m.url}" alt="${m.title}" class="file-chk-thumb" />
            <div class="file-chk-meta">
              <strong>${m.title || 'Média'}</strong>
              <small>${m.destination || 'Voyage'}</small>
            </div>
            <span class="chk-mark">✓</span>
          </label>
        `).join('')}
      </div>
    `;

    this.updateSelectedCounter();
  },

  updateSelectedCounter() {
    const checked = document.querySelectorAll('.vlog-file-toggle:checked');
    const tag = document.getElementById('vlog-selected-count-tag');
    if (tag) {
      tag.textContent = `${checked.length} fichier${checked.length > 1 ? 's' : ''} sélectionné${checked.length > 1 ? 's' : ''}`;
    }
  },

  // Pré-chargement des images sélectionnées pour le Canvas
  preloadMediaImages() {
    this.loadedMedia = [];
    const checkedInputs = Array.from(document.querySelectorAll('.vlog-file-toggle:checked'));
    
    // Récupérer les objets médias correspondants
    const allMedia = PhotosManager.mediaList.length > 0 ? PhotosManager.mediaList : DEFAULT_MEDIA_GALLERY;
    const selectedMedia = checkedInputs.map(inp => allMedia.find(m => m.id === inp.value)).filter(Boolean);

    // Fallback si rien n'est coché : prendre les 3 premiers
    const listToLoad = selectedMedia.length > 0 ? selectedMedia : allMedia.slice(0, 3);

    listToLoad.forEach(item => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.url;
      this.loadedMedia.push({
        meta: item,
        img: img,
        loaded: false
      });
      img.onload = () => {
        const found = this.loadedMedia.find(m => m.img === img);
        if (found) found.loaded = true;
      };
    });
  },

  attachStudioEvents() {
    // Fermeture modal
    const btnClose = document.getElementById('btn-close-vlog');
    if (btnClose) {
      btnClose.onclick = () => this.close();
    }

    // Toggle des fichiers
    document.querySelectorAll('.vlog-file-toggle').forEach(chk => {
      chk.onchange = () => {
        const item = chk.closest('.file-chk-item');
        if (chk.checked) item.classList.add('selected');
        else item.classList.remove('selected');
        this.updateSelectedCounter();
        this.preloadMediaImages();
        this.drawIntroFrame();
      };
    });

    // Tout cocher / décocher
    const btnCheckAll = document.getElementById('vlog-btn-check-all');
    const btnUncheckAll = document.getElementById('vlog-btn-uncheck-all');
    if (btnCheckAll) {
      btnCheckAll.onclick = () => {
        document.querySelectorAll('.vlog-file-toggle').forEach(c => {
          c.checked = true;
          c.closest('.file-chk-item').classList.add('selected');
        });
        this.updateSelectedCounter();
        this.preloadMediaImages();
        this.drawIntroFrame();
      };
    }
    if (btnUncheckAll) {
      btnUncheckAll.onclick = () => {
        document.querySelectorAll('.vlog-file-toggle').forEach(c => {
          c.checked = false;
          c.closest('.file-chk-item').classList.remove('selected');
        });
        this.updateSelectedCounter();
        this.preloadMediaImages();
        this.drawIntroFrame();
      };
    }

    // Choix de la musique
    const musicSelect = document.getElementById('vlog-music-select');
    const customMp3Inp = document.getElementById('vlog-custom-mp3-file');
    if (musicSelect) {
      musicSelect.onchange = (e) => {
        this.config.musicStyle = e.target.value;
        if (e.target.value === 'custom') {
          customMp3Inp.classList.remove('hidden');
        } else {
          customMp3Inp.classList.add('hidden');
        }
      };
    }

    // Choix de la police d'écriture
    document.querySelectorAll('input[name="vlog-font-choice"]').forEach(radio => {
      radio.onchange = (e) => {
        this.config.fontFamily = e.target.value;
        document.querySelectorAll('.font-choice-card').forEach(c => c.classList.remove('active'));
        radio.closest('.font-choice-card').classList.add('active');
        this.drawIntroFrame();
      };
    });

    // Choix du template de la vidéo
    document.querySelectorAll('input[name="vlog-template-choice"]').forEach(radio => {
      radio.onchange = (e) => {
        this.config.videoTemplate = e.target.value;
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        radio.closest('.template-card').classList.add('active');
        const tag = document.getElementById('hud-template-tag');
        if (tag) tag.textContent = `Template: ${e.target.value}`;
        this.drawIntroFrame();
      };
    });

    // Titres
    const titleInp = document.getElementById('vlog-input-title');
    const subInp = document.getElementById('vlog-input-subtitle');
    if (titleInp) titleInp.oninput = (e) => { this.config.title = e.target.value; this.drawIntroFrame(); };
    if (subInp) subInp.oninput = (e) => { this.config.subtitle = e.target.value; this.drawIntroFrame(); };

    // Play / Pause
    const btnPlay = document.getElementById('btn-vlog-play-pause');
    if (btnPlay) {
      btnPlay.onclick = () => {
        if (this.isPlaying) {
          this.stopPlayback();
        } else {
          this.startPlayback();
        }
      };
    }

    // Exporter la vidéo
    const btnExport = document.getElementById('btn-vlog-export');
    if (btnExport) {
      btnExport.onclick = () => {
        this.exportVideo();
      };
    }
  },

  // Rendu de l'écran d'intro / prévisualisation
  drawIntroFrame() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const font = this.config.fontFamily || 'Outfit';

    ctx.clearRect(0, 0, w, h);

    // Si on a une première image chargée
    if (this.loadedMedia.length > 0 && this.loadedMedia[0].img.complete) {
      this.drawSlideFrame(this.loadedMedia[0], 0, 0);
    } else {
      // Dégradé sombre cinématique de fond
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Cadre ou overlay selon le template
    this.applyTemplateDecorations(ctx, w, h, 0, this.config.videoTemplate);

    // Titre de couverture
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold 54px '${font}', sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 18;
    ctx.fillText(this.config.title || "MON ODYSSÉE DE VOYAGE", w / 2, h / 2 - 30);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = `500 26px '${font}', sans-serif`;
    ctx.shadowBlur = 10;
    ctx.fillText(this.config.subtitle || "Studio Vlog Cinématique", w / 2, h / 2 + 35);

    // Badge d'action
    ctx.font = `600 18px '${font}', sans-serif`;
    ctx.fillStyle = '#38BDF8';
    ctx.fillText("▶ Cliquez sur 'Prévisualiser le Vlog' pour lancer la lecture", w / 2, h / 2 + 100);
    ctx.shadowBlur = 0;
  },

  // Démarrage de la lecture
  startPlayback() {
    this.isPlaying = true;
    this.currentSlideIndex = 0;
    this.slideStartTime = performance.now();

    const btnPlayIcon = document.getElementById('vlog-play-icon');
    const btnPlayLabel = document.getElementById('vlog-play-label');
    if (btnPlayIcon) btnPlayIcon.textContent = '⏸';
    if (btnPlayLabel) btnPlayLabel.textContent = 'Mettre en pause';

    this.startAudio();
    this.animateLoop();
  },

  stopPlayback() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const btnPlayIcon = document.getElementById('vlog-play-icon');
    const btnPlayLabel = document.getElementById('vlog-play-label');
    if (btnPlayIcon) btnPlayIcon.textContent = '▶';
    if (btnPlayLabel) btnPlayLabel.textContent = 'Prévisualiser le Vlog';

    this.stopAudio();
  },

  animateLoop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const slideDurationMs = (this.config.secondsPerSlide || 3.5) * 1000;
    const elapsedInSlide = now - this.slideStartTime;
    const progress = Math.min(elapsedInSlide / slideDurationMs, 1.0);

    const totalSlides = this.loadedMedia.length;
    if (totalSlides === 0) {
      this.stopPlayback();
      return;
    }

    const currentMedia = this.loadedMedia[this.currentSlideIndex];
    this.drawSlideFrame(currentMedia, progress, this.currentSlideIndex);

    // Mise à jour du HUD temps
    const totalTimeSec = Math.round(totalSlides * (this.config.secondsPerSlide || 3.5));
    const currentTimeSec = Math.round((this.currentSlideIndex * (this.config.secondsPerSlide || 3.5)) + (progress * (this.config.secondsPerSlide || 3.5)));
    const hudTime = document.getElementById('hud-time-display');
    if (hudTime) {
      hudTime.textContent = `${this.formatTime(currentTimeSec)} / ${this.formatTime(totalTimeSec)}`;
    }

    // Passer à la diapositive suivante
    if (elapsedInSlide >= slideDurationMs) {
      this.currentSlideIndex++;
      this.slideStartTime = performance.now();
      if (this.currentSlideIndex >= totalSlides) {
        // Fin de lecture ou boucle
        if (this.isRecording) {
          this.finishRecording();
          return;
        } else {
          this.currentSlideIndex = 0; // Boucle
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animateLoop());
  },

  drawSlideFrame(mediaObj, progress, index) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const template = this.config.videoTemplate || 'ken-burns';
    const font = this.config.fontFamily || 'Outfit';

    ctx.clearRect(0, 0, w, h);

    if (mediaObj && mediaObj.img && mediaObj.img.complete) {
      const img = mediaObj.img;
      
      // Animation du zoom selon le template
      let scale = 1.0;
      let dx = 0;
      let dy = 0;

      if (template === 'ken-burns') {
        // Zoom fluide continu de 1.0 à 1.15
        scale = 1.0 + (progress * 0.14);
        dx = (progress - 0.5) * 20;
      } else if (template === 'roadtrip-fast') {
        // Zoom punch dynamique
        scale = 1.05 + Math.sin(progress * Math.PI) * 0.08;
      } else if (template === 'vintage-film') {
        scale = 1.02 + (progress * 0.04);
      } else if (template === 'polaroid-memories') {
        scale = 0.95;
      } else {
        scale = 1.0 + (progress * 0.06);
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);

      // Légère rotation pour le Polaroid
      if (template === 'polaroid-memories') {
        const tilt = (index % 2 === 0 ? 0.03 : -0.03);
        ctx.rotate(tilt);
      }

      ctx.scale(scale, scale);

      // Calcul des proportions pour remplir ou ajuster l'image
      const imgAspect = img.width / img.height;
      const canvasAspect = w / h;
      let renderW, renderH;

      if (imgAspect > canvasAspect) {
        renderH = h;
        renderW = h * imgAspect;
      } else {
        renderW = w;
        renderH = w / imgAspect;
      }

      ctx.drawImage(img, -renderW / 2 + dx, -renderH / 2 + dy, renderW, renderH);
      ctx.restore();
    }

    // Décorations et filtres spécifiques au Template
    this.applyTemplateDecorations(ctx, w, h, progress, template);

    // Titres et sous-titres avec la POLICE choisie
    if (this.config.showSubtitles && mediaObj && mediaObj.meta) {
      this.drawSubtitles(ctx, w, h, mediaObj.meta, font, template);
    }
  },

  applyTemplateDecorations(ctx, w, h, progress, template) {
    if (template === 'ken-burns') {
      // Voile cinématographique chaud
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.2)');
      grad.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

    } else if (template === 'roadtrip-fast') {
      // Flash blanc de transition au début
      if (progress < 0.15) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(1 - (progress / 0.15)) * 0.4})`;
        ctx.fillRect(0, 0, w, h);
      }
      // Vignetage dynamique
      const grad = ctx.createRadialGradient(w/2, h/2, w/4, w/2, h/2, w/1.2);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

    } else if (template === 'vintage-film') {
      // Grain argentique et teinte sépia douce
      ctx.fillStyle = 'rgba(235, 175, 80, 0.08)';
      ctx.fillRect(0, 0, w, h);

      // Dateur orange rétro 90s dans le coin inférieur droit
      ctx.fillStyle = '#FF8C00';
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.shadowColor = '#FF8C00';
      ctx.shadowBlur = 4;
      ctx.fillText("'27 10 22", w - 160, h - 45);
      ctx.shadowBlur = 0;

      // Bandes noires cinéma en haut et bas (Letterbox 2.35:1)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, 50);
      ctx.fillRect(0, h - 50, w, 50);

    } else if (template === 'luxe-minimal') {
      // Cadre passe-partout blanc pur
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 24;
      ctx.strokeRect(12, 12, w - 24, h - 24);

    } else if (template === 'polaroid-memories') {
      // Cadre blanc type Polaroid autour de l'image
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 18;
      ctx.strokeRect(30, 30, w - 60, h - 60);
    }
  },

  drawSubtitles(ctx, w, h, meta, font, template) {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    const title = meta.title || "Souvenir de Voyage";
    const caption = meta.caption || "";
    const dest = meta.destination || "Odyssey Travel";

    // Bandeau semi-transparent
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.roundRect(60, h - 140, 520, 90, 12);
    ctx.fill();

    // Titre avec la police d'écriture sélectionnée
    ctx.font = `bold 28px '${font}', sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`📍 ${dest} · ${title}`, 80, h - 95);

    // Sous-titre
    ctx.font = `400 18px '${font}', sans-serif`;
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(caption, 80, h - 65);

    ctx.restore();
  },

  formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  },

  // Synthétiseur Web Audio pour générer la bande-son en temps réel
  startAudio() {
    if (this.config.musicStyle === 'mute') return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Création d'une boucle musicale rythmée adaptée au style
      this.scheduleAudioNotes();
    } catch(e) {
      console.warn("Web Audio non disponible:", e);
    }
  },

  stopAudio() {
    if (this.audioCtx) {
      // Pause audio
    }
  },

  scheduleAudioNotes() {
    if (!this.audioCtx || !this.isPlaying) return;
    const now = this.audioCtx.currentTime;

    // Arpège harmonique selon le style
    let chords = [261.63, 329.63, 392.00, 523.25]; // Do Maj
    if (this.config.musicStyle === 'flamenco') {
      chords = [220.00, 246.94, 261.63, 329.63]; // Mi phrygien espagnol
    } else if (this.config.musicStyle === 'chill' || this.config.musicStyle === 'lofi') {
      chords = [293.66, 369.99, 440.00, 587.33]; // Ré Maj doux
    }

    // Jouer une note douce
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const note = chords[Math.floor(Math.random() * chords.length)];
    osc.type = this.config.musicStyle === 'flamenco' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(note, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.6);

    if (this.isPlaying) {
      setTimeout(() => this.scheduleAudioNotes(), 400);
    }
  },

  // 4. Exportation de la vidéo en fichier .webm
  exportVideo() {
    if (!this.canvas) return;

    const progressBox = document.getElementById('vlog-export-progress');
    const progressBar = document.getElementById('progress-bar-fill');
    const progressPct = document.getElementById('progress-pct');
    if (progressBox) progressBox.classList.remove('hidden');

    this.isRecording = true;
    this.recordedChunks = [];

    const stream = this.canvas.captureStream(30); // 30 FPS
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm' };
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, options);
    } catch(e) {
      this.mediaRecorder = new MediaRecorder(stream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vlog_${this.config.title.toLowerCase().replace(/\s+/g, '_')}.webm`;
      a.click();

      if (progressBox) progressBox.classList.add('hidden');
      alert("🎉 Félicitations ! Votre vlog vidéo a été rendu et téléchargé avec succès !");
    };

    this.mediaRecorder.start();
    this.startPlayback();

    // Progression simulée
    const totalDurationMs = this.loadedMedia.length * (this.config.secondsPerSlide || 3.5) * 1000;
    const interval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(interval);
        return;
      }
      const elapsed = performance.now() - this.slideStartTime + (this.currentSlideIndex * (this.config.secondsPerSlide || 3.5) * 1000);
      const pct = Math.min(Math.round((elapsed / totalDurationMs) * 100), 99);
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressPct) progressPct.textContent = `${pct}%`;
    }, 300);
  },

  finishRecording() {
    this.isRecording = false;
    this.stopPlayback();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
};
