# 🌍 ODYSSEY · Carnet de Voyage Universel, Planificateur & Studio Vlog

Plateforme web moderne et complète dédiée à **tous les voyages à travers le monde**, avec gestion intelligente des profils par tranche d'âge, curseurs de budget interactifs, cartographie Google Maps au point GPS rouge, répertoire scindé entre voyages prévus et passés, et studio de montage vidéo vlog en 1 clic.

---

## 🌟 Fonctionnalités Implémentées

### 1. 🔐 Page de Connexion & Inscription avec Bande de Film Défilante
- **Arrière-plan cinématique** : Bande de paysages du monde (Polynésie, Alpes suisses, Sahara, Tokyo néon, fjords d'Islande, rizières de Bali, New York, etc.) en défilement horizontal continu (`@keyframes filmstripScroll`), bordée de perforations de pellicule 35mm et d'un voile flou doux pour garantir une lisibilité absolue.
- **Formulaire d'inscription** :
  - **Adresse email**
  - **Pseudo**
  - **Année de naissance**
- **Calcul dynamique de l'âge et catégorisation en temps réel** :
  - 🎒 **18 à 28 ans : Jeune** — *Dynamisme, adrénaline, surf camps, auberges sociales et roadtrips.*
  - 🧭 **29 à 50 ans : Adulte** — *Équilibre confort, grands espaces sauvages, immersion culturelle et gastronomie.*
  - 👑 **51 à 120 ans : Senior** — *Sérénité, trains panoramiques de luxe, croisières fluviales et patrimoine d'exception.*
- **Raccourcis de test immédiat en 1 clic** :
  - *Léa Martin* (23 ans · Jeune)
  - *Thomas Dubois* (38 ans · Adulte)
  - *Hélène & Pierre* (64 ans · Senior)

---

### 2. 🏠 Page d'Accueil & Bande de Navigation
- **Carte de Session Utilisateur** : Affiche le profil connecté (pseudo, email, âge calculé, badge de catégorie, statistiques de dossiers) avec bouton pour changer de compte ou se déconnecter.
- **Bande de navigation du site** : Accès direct aux 4 pages principales.
- **Suggestions de voyage strictement filtrées par catégorie d'âge** :
  - **Profil Jeune** : *Bali Surf & Jungle, Tokyo Cyberpunk, Interrail Européen, Costa Rica Adrénaline*.
  - **Profil Adulte** : *Islande Route 1 & Aurores, Toscane Agriturismo & Vins, New York City Trip & Broadway, Cyclades Chic*.
  - **Profil Senior** : *Croisière Fjords de Norvège, Kyoto Jardins Zen & Ryokans, Vallée du Douro en Bateau Privé, Glacier Express Suisse*.
- **Création en 1 clic depuis une suggestion** : Pré-remplit automatiquement le formulaire du voyage !

---

### 3. ➕ Page 1 : Créer un Nouveau Dossier (un dossier = un voyage)
- **Informations initiales** :
  - Destination (pays ou ville, avec puces de sélection rapide).
  - Nombre de voyageurs (avec boutons pas à pas).
  - Budget maximal par personne (€).
  - Les **6 types de voyage** avec leurs descriptions complètes :
    - 🌴 *Détente et Farniente (Chill)*
    - 🧗‍♂️ *Aventure et Sport*
    - 🏛️ *Culturel et Historique*
    - 🌆 *Urbain (City Trip)*
    - 🌿 *Nature et Écotourisme*
    - 🍷 *Gastronomique*
  - Présence ou non d'animaux de compagnie (🐾 Oui / 🚫 Non).
  - Dates prévues du séjour.
- **Métamorphose dynamique dès saisie** :
  - **Curseurs interactifs de budget** : 6 catégories (Logement, Repas, Activités, Transports, Shopping, Marge imprévus) avec pondérations calculées automatiquement selon le type de voyage choisi.
  - **Cartographie Google Maps avec Point GPS Rouge** : Cadre interactif centré sur la destination avec repère GPS rouge pulsant et bouton direct d'ouverture dans Google Maps.
  - **Suggestions sur mesure débloquées par le style** : Endroits à visiter, activités recommandées, restaurants où aller, logements à choisir.
  - **Mention obligatoire pour les animaux** : Chaque lieu indique explicitement s'il accepte les animaux (`🐾 Animaux bienvenus` avec détails / `🚫 Animaux non admis`).
  - **Bouton d'enregistrement** : Sauvegarde dans le compte de l'utilisateur actif et redirection vers le répertoire.

---

### 4. 📁 Page 2 : Répertoire des Voyages
- **En premier (en haut) : Voyages Prévus** :
  - Cartes avec couverture photo, dates, compte à rebours avant le départ (*"Départ dans 42 jours"*), type de voyage, budget engagé vs total, badge animal, et boutons d'action (Localiser GPS, Photos/Vlog, basculer le statut, supprimer).
- **En bas : Voyages Passés** :
  - Historique des voyages réalisés avec note de satisfaction (étoiles), souvenirs et bouton direct *"Voir les photos & Générer le Vlog"*.
- **Sauvegarde & Restauration** : Export complet des dossiers au format JSON.

---

### 5. 🎬 Page 3 : Photos, Vidéos & Studio Vlog en 1 Clic
- **Médias rangés par voyage** : Sélecteur déroulant et puces pour filtrer les souvenirs par dossier créé.
- **Zone d'import drag-and-drop** : Permet d'importer ses propres photos et vidéos.
- **Générateur de Vlog en 1 Clic** :
  1. **Fichiers qui doivent apparaître** : Grille avec cases à cocher pour inclure/exclure des photos en direct.
  2. **Musique de fond** : Flamenco & guitare, Chill baléares, Lo-Fi beat, Électro roadtrip, Épique orchestrale, ou import MP3 personnel.
  3. **Police d'écriture** : *Outfit*, *Playfair Display*, *Cinzel*, *Montserrat*, *Pacifico*.
  4. **Template de la vidéo** :
     - 🌅 *Cinématique Ken Burns*
     - ⚡ *Roadtrip Dynamique*
     - 🎞️ *Vintage Film 35mm*
     - 💎 *Luxe & Minimaliste*
     - 📸 *Souvenirs Polaroid*
  - **Moteur Canvas HTML5 + Web Audio** : Prévisualisation en direct avec sous-titres animés et export vidéo au format `.webm` !

---

## 🛠️ Structure Modulaire des Fichiers

- [`index.html`](file:///c:/xampp/htdocs/Espagne%202027/index.html) : Structure sémantique, portail d'authentification filmstrip, navigation et sections.
- [`css/style.css`](file:///c:/xampp/htdocs/Espagne%202027/css/style.css) : Design system complet, animations de défilement de film, curseurs, styles de cartes et studio vlog.
- [`js/data.js`](file:///c:/xampp/htdocs/Espagne%202027/js/data.js) : Données mondiales, catégories d'âge, types de voyage, destinations et comptes démo.
- [`js/auth.js`](file:///c:/xampp/htdocs/Espagne%202027/js/auth.js) : Inscription, calcul d'âge dynamique et session multi-utilisateurs.
- [`js/trip-creator.js`](file:///c:/xampp/htdocs/Espagne%202027/js/trip-creator.js) : Formulaire initial, curseurs de budget, Google Maps GPS et suggestions animaux.
- [`js/repertoire.js`](file:///c:/xampp/htdocs/Espagne%202027/js/repertoire.js) : Répertoire classé (Voyages prévus en haut, voyages passés en bas).
- [`js/photos.js`](file:///c:/xampp/htdocs/Espagne%202027/js/photos.js) : Galerie de médias classée par voyage et déclencheur du vlog.
- [`js/vlog.js`](file:///c:/xampp/htdocs/Espagne%202027/js/vlog.js) : Studio vidéo avec sélection des fichiers, musique, polices, templates et export.
- [`js/app.js`](file:///c:/xampp/htdocs/Espagne%202027/js/app.js) : Routeur général, session sur l'accueil et suggestions par âge.
