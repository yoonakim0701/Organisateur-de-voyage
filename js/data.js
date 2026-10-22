/**
 * ODYSSEY - CARNET & PLANIFICATEUR UNIVERSEL DE VOYAGES
 * Base de données globale : Catégories d'âge, types de voyages, destinations mondiales,
 * suggestions par âge, et gestion des comptes utilisateurs.
 */

// 1. Définition des 3 catégories d'âge
const AGE_CATEGORIES = {
  jeune: {
    key: 'jeune',
    label: 'Jeune',
    ageRange: '18 - 28 ans',
    minAge: 18,
    maxAge: 28,
    badge: '🎒 Jeune (18-28 ans)',
    icon: '🎒',
    desc: 'Voyages dynamiques, adrénaline, rencontres, vie nocturne et découvertes immersives à budget malin.'
  },
  adulte: {
    key: 'adulte',
    label: 'Adulte',
    ageRange: '29 - 50 ans',
    minAge: 29,
    maxAge: 50,
    badge: '🧭 Adulte (29-50 ans)',
    icon: '🧭',
    desc: 'Équilibre parfait entre confort, grands espaces sauvages, immersion culturelle et expériences gastronomiques.'
  },
  senior: {
    key: 'senior',
    label: 'Senior',
    ageRange: '51 - 120 ans',
    minAge: 51,
    maxAge: 120,
    badge: '👑 Senior (51-120 ans)',
    icon: '👑',
    desc: 'Séjours sereins, panoramas grand confort, trains scéniques, croisières fluviales et patrimoine historique préservé.'
  }
};

// 2. Définition des 6 types de voyage avec textes exacts et répartition budgétaire suggérée
const TRAVEL_TYPES = {
  chill: {
    key: 'chill',
    name: 'Détente et Farniente (Chill)',
    icon: '🌴',
    description: "L'objectif principal est de déconnecter et de se reposer, que ce soit sur une plage au soleil ou lors d'une escapade tranquille entre amies pour faire du shopping et flâner.",
    budgetWeights: {
      hotels: 40,      // Logement confort / spa / plage
      food: 20,        // Repas gourmands & terrasses
      activities: 10,  // Visites légères & détente
      flights: 15,     // Transports
      shopping: 10,    // Boutiques & flâneries
      emergency: 5     // Marge imprévus
    }
  },
  aventure: {
    key: 'aventure',
    name: 'Aventure et Sport',
    icon: '🧗‍♂️',
    description: "Ce style s'adresse à ceux qui recherchent l'adrénaline et le dépassement de soi, avec des activités physiques comme le trekking, l'alpinisme, le surf ou les expéditions en milieu sauvage.",
    budgetWeights: {
      hotels: 18,      // Logement simple / refuge / van
      food: 15,        // Ravitaillement & énergie
      activities: 38,  // Guides, matériel outdoor, permis
      flights: 20,     // Transports & transferts 4x4
      shopping: 4,     // Équipement local
      emergency: 5     // Sécurité & secours
    }
  },
  culturel: {
    key: 'culturel',
    name: 'Culturel et Historique',
    icon: '🏛️',
    description: "Le séjour est entièrement axé sur la découverte du patrimoine, incluant la visite de musées, l'exploration de sites archéologiques et l'immersion dans les traditions locales.",
    budgetWeights: {
      hotels: 28,      // Logement centre historique
      food: 20,        // Restaurants traditionnels
      activities: 30,  // Musées, pass coupe-file, guides
      flights: 14,     // Transports
      shopping: 4,     // Livres d'art & souvenirs
      emergency: 4     // Imprévus
    }
  },
  urbain: {
    key: 'urbain',
    name: 'Urbain (City Trip)',
    icon: '🌆',
    description: "Privilégiant les grandes métropoles, ce format dynamique est parfait pour explorer l'architecture d'une ville, sa vie nocturne, ses expositions et ses boutiques sur une courte durée.",
    budgetWeights: {
      hotels: 30,      // Logement branché en ville
      food: 24,        // Rooftops, street food & bistrots
      activities: 16,  // Expos, belvédères, clubs
      flights: 12,     // Vols ou TGV
      shopping: 14,    // Mode, concept stores
      emergency: 4     // Imprévus
    }
  },
  nature: {
    key: 'nature',
    name: 'Nature et Écotourisme',
    icon: '🌿',
    description: "Les itinéraires se concentrent sur les grands espaces, les parcs nationaux et l'observation de la faune, avec une attention particulière portée à l'environnement et au tourisme responsable.",
    budgetWeights: {
      hotels: 30,      // Écolodges & cabanes éco-responsables
      food: 16,        // Produits du terroir & fermes bio
      activities: 28,  // Parcs nationaux, réserves fauniques
      flights: 18,     // Transports verts ou location hybride
      shopping: 3,     // Artisanat local écologique
      emergency: 5     // Imprévus
    }
  },
  gastronomique: {
    key: 'gastronomique',
    name: 'Gastronomique',
    icon: '🍷',
    description: "Le fil conducteur du voyage est la découverte culinaire, rythmé par la visite de vignobles, la dégustation sur des marchés locaux et les repas dans des établissements régionaux.",
    budgetWeights: {
      hotels: 24,      // Hôtels avec charme & étapes relais
      food: 42,        // Tables étoilées, caves, halles
      activities: 18,  // Ateliers cuisine, dégustations vins
      flights: 10,     // Transports
      shopping: 4,     // Produits du terroir, vins, épicerie
      emergency: 2     // Imprévus
    }
  }
};

// 3. Catégories de curseurs budgétaires (6 catégories demandées)
const BUDGET_CATEGORIES = [
  { key: 'hotels', label: 'Logement & Hébergements', icon: '🏨', color: '#E05D6D', desc: 'Hôtels, écolodges, appartements ou resorts' },
  { key: 'food', label: 'Repas & Gastronomie', icon: '🍽️', color: '#E66A38', desc: 'Restaurants, marchés locaux, cafés et dégustations' },
  { key: 'activities', label: 'Activités & Visites', icon: '🎟️', color: '#D69E2E', desc: 'Musées, pass, excursions, guides et aventures' },
  { key: 'flights', label: 'Transports & Déplacements', icon: '✈️', color: '#3182CE', desc: 'Vols, trains, locations de véhicule et taxis' },
  { key: 'shopping', label: 'Shopping & Souvenirs', icon: '🛍️', color: '#9F7AEA', desc: 'Achats, artisanat local, mode et cadeaux' },
  { key: 'emergency', label: 'Marge Imprévus', icon: '🛡️', color: '#38A169', desc: 'Fonds de sécurité, santé, flexibilité et extras' }
];

// 4. Suggestions de voyages filtrées par catégorie d'âge (Accueil)
const AGE_TRIP_SUGGESTIONS = {
  jeune: [
    {
      id: 'sug-bali-jeune',
      title: 'Bali Surf & Jungle Festivities',
      destination: 'Bali, Indonésie',
      coordinates: { lat: -8.4095, lng: 115.1889 },
      type: 'aventure',
      image: 'assets/images/world_filmstrip_3.jpg',
      duration: '14 jours',
      budgetPerPerson: 950,
      badge: 'Surf & Nightlife',
      tagline: 'Cascades secrètes, surf à Canggu et auberges sociales branchées.',
      highlights: ['Surf à Echo Beach', 'Rizières de Jatiluwih', 'Temples au coucher de soleil', 'Soirées sur la plage à Uluwatu']
    },
    {
      id: 'sug-tokyo-jeune',
      title: 'Tokyo Cyberpunk & Pop Culture',
      destination: 'Tokyo, Japon',
      coordinates: { lat: 35.6762, lng: 139.6503 },
      type: 'urbain',
      image: 'assets/images/world_filmstrip_2.jpg',
      duration: '10 jours',
      budgetPerPerson: 1400,
      badge: 'Manga & Electro',
      tagline: 'Quartiers néon d’Akihabara, friperies de Shimokitazawa et izakayas animés.',
      highlights: ['Shibuya Crossing', 'Arcades et cafés thématiques', 'Street food à Omoide Yokocho', 'TeamLab Planets immersif']
    },
    {
      id: 'sug-interrail-jeune',
      title: 'Grand Interrail Express Européen',
      destination: 'Amsterdam - Berlin - Prague - Budapest',
      coordinates: { lat: 52.5200, lng: 13.4050 },
      type: 'culturel',
      image: 'assets/images/world_filmstrip_1.jpg',
      duration: '12 jours',
      budgetPerPerson: 850,
      badge: 'Roadtrip Ferroviaire',
      tagline: 'Traversez les capitales d’Europe en train avec vos amis et vos sacs à dos.',
      highlights: ['Pass Interrail illimité', 'Ruin bars de Budapest', 'Clubs légendaires de Berlin', 'Balade à vélo sur les canaux']
    },
    {
      id: 'sug-costarica-jeune',
      title: 'Costa Rica Adrénaline & Surf Camp',
      destination: 'Santa Teresa & La Fortuna, Costa Rica',
      coordinates: { lat: 9.7489, lng: -83.7534 },
      type: 'aventure',
      image: 'assets/images/world_filmstrip_3.jpg',
      duration: '11 jours',
      budgetPerPerson: 1100,
      badge: 'Surf & Rafting',
      tagline: 'Rafting en eaux vives, tyroliennes au-dessus de la canopée et bivouacs sauvages.',
      highlights: ['Volcan Arenal et sources chaudes', 'Surf camp Pacifique', 'Tyroliennes géantes', 'Observation des paresseux']
    }
  ],

  adulte: [
    {
      id: 'sug-islande-adulte',
      title: 'Islande : Route 1, Fjords & Aurores',
      destination: 'Reykjavik & Sud de l’Islande',
      coordinates: { lat: 64.1466, lng: -21.9426 },
      type: 'nature',
      image: 'assets/images/world_filmstrip_2.jpg',
      duration: '9 jours',
      budgetPerPerson: 1650,
      badge: 'Nature & Grands Espaces',
      tagline: 'Cascades monumentales, lagons géothermaux et aurores boréales dans le silence absolu.',
      highlights: ['Baignade au Blue Lagoon', 'Chutes de Skógafoss', 'Plage de sable noir de Vik', 'Chasse aux aurores en 4x4']
    },
    {
      id: 'sug-toscane-adulte',
      title: 'Toscane : Agriturismo & Route des Vins',
      destination: 'Florence & Val d’Orcia, Italie',
      coordinates: { lat: 43.7696, lng: 11.2558 },
      type: 'gastronomique',
      image: 'assets/images/world_filmstrip_2.jpg',
      duration: '7 jours',
      budgetPerPerson: 1300,
      badge: 'Vins & Renaissance',
      tagline: 'Collines de cyprès, dégustations privées de Brunello et villas toscanes authentiques.',
      highlights: ['Domaines viticoles de Montalcino', 'Galerie des Offices à Florence', 'Villages médiévaux perchés', 'Dîners truffes et pasta maison']
    },
    {
      id: 'sug-newyork-adulte',
      title: 'New York : Rooftops, Galeries & Broadway',
      destination: 'New York, États-Unis',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      type: 'urbain',
      image: 'assets/images/world_filmstrip_3.jpg',
      duration: '6 jours',
      budgetPerPerson: 1800,
      badge: 'City Trip Élite',
      tagline: 'Architecture iconique, comédies musicales de Broadway et adresses gastronomiques branchées.',
      highlights: ['High Line & Hudson Yards', 'Spectacle à Broadway', 'Vue panoramique The Edge', 'Flânerie à Greenwich Village & SoHo']
    },
    {
      id: 'sug-cyclades-adulte',
      title: 'Cyclades Authentiques : Milos & Santorin',
      destination: 'Santorin & Îles Cyclades, Grèce',
      coordinates: { lat: 36.3932, lng: 25.4615 },
      type: 'chill',
      image: 'assets/images/world_filmstrip_3.jpg',
      duration: '8 jours',
      budgetPerPerson: 1450,
      badge: 'Méditerranée Chic',
      tagline: 'Maisons blanchies à la chaux, criques secrètes aux eaux cristallines et couchers de soleil.',
      highlights: ['Croisière catamaran privée', 'Villages d’Oia et Imerovigli', 'Dégustation d’Assyrtiko face à la Caldeira', 'Crique lunaire de Sarakiniko']
    }
  ],

  senior: [
    {
      id: 'sug-fjords-senior',
      title: 'Croisière Sérénité dans les Fjords de Norvège',
      destination: 'Bergen & Geirangerfjord, Norvège',
      coordinates: { lat: 60.3913, lng: 5.3221 },
      type: 'nature',
      image: 'assets/images/world_filmstrip_2.jpg',
      duration: '10 jours',
      budgetPerPerson: 2100,
      badge: 'Croisière & Panorama',
      tagline: 'Navigation feutrée entre les parois vertigineuses, hôtels historiques et air pur scandinave.',
      highlights: ['Geirangerfjord classé UNESCO', 'Train historique de Flåm', 'Quartier hanséatique de Bryggen', 'Confort absolu sans fatigue']
    },
    {
      id: 'sug-kyoto-senior',
      title: 'Kyoto Millénaire : Temples Zen & Jardins',
      destination: 'Kyoto & Nara, Japon',
      coordinates: { lat: 35.0116, lng: 135.7681 },
      type: 'culturel',
      image: 'assets/images/world_filmstrip_2.jpg',
      duration: '12 jours',
      budgetPerPerson: 2400,
      badge: 'Patrimoine & Douceur',
      tagline: 'Ryokans traditionnels avec onsens privés, cérémonies du thé et allées de bambous séculaires.',
      highlights: ['Pavillon d’Or Kinkaku-ji', 'Cérémonie du thé avec maître artisan', 'Balade matinale à Gion', 'Bain thermal Onsen relaxant']
    },
    {
      id: 'sug-douro-senior',
      title: 'Vallée du Douro : Quintas & Vignobles d’Exception',
      destination: 'Porto & Vallée du Douro, Portugal',
      coordinates: { lat: 41.1579, lng: -8.6291 },
      type: 'gastronomique',
      image: 'assets/images/world_filmstrip_1.jpg',
      duration: '7 jours',
      budgetPerPerson: 1500,
      badge: 'Fleuve & Gastronomie',
      tagline: 'Croisière fluviale privée, manoirs séculaires, vins de Porto vintage et douceur de vivre portugaise.',
      highlights: ['Dégustation dans une Quinta historique', 'Bateau rabelo privatisé', 'Visite guidée du centre de Porto', 'Cuisine raffinée du terroir lusitanien']
    },
    {
      id: 'sug-glacier-senior',
      title: 'Suisse : Le Glacier Express & Hôtels d’Altitude',
      destination: 'Zermatt & Saint-Moritz, Suisse',
      coordinates: { lat: 45.9763, lng: 7.7491 },
      type: 'chill',
      image: 'assets/images/world_filmstrip_1.jpg',
      duration: '6 jours',
      budgetPerPerson: 2200,
      badge: 'Train Panoramique Luxe',
      tagline: 'Voitures vitrées panoramiques, sommets enneigés, spas thermaux et accueil alpin d’excellence.',
      highlights: ['Trajet dans le Glacier Express première classe', 'Vue sur le Cervin', 'Soins bien-être en station thermale', 'Fondue savoyarde en altitude']
    }
  ]
};

// 5. Base de connaissances des destinations du monde pour suggestions sur mesure & Google Maps
const WORLD_DESTINATIONS_DATA = {
  "Tokyo": {
    country: "Japon",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    places: [
      { name: "Carrefour de Shibuya & Temple Meiji", desc: "Le sanctuaire shintoïste niché dans une forêt sacrée au cœur de la mégalopole.", petFriendly: false, petNote: "Non admis dans les sanctuaires religieux." },
      { name: "Parc Yoyogi", desc: "Immense parc verdoyant idéal pour pique-niquer et flâner.", petFriendly: true, petNote: "Chiens tenus en laisse bienvenus, zone d'ébats canins dédiée." },
      { name: "TeamLab Planets Immersif", desc: "Musée d'art numérique interactif avec bassins d'eau et fleurs infinies.", petFriendly: false, petNote: "Animaux non admis." }
    ],
    activities: [
      { name: "Visite guidée Street Food à Shinjuku", price: 65, duration: "3h", petFriendly: true, petNote: "Terrasses extérieures des yatai accessibles aux petits animaux." },
      { name: "Pass Métro Tokyo Illimité 72h", price: 20, duration: "3 jours", petFriendly: true, petNote: "Animaux en sac de transport tolérés." },
      { name: "Atelier confection de Ramen & Gyozas", price: 80, duration: "2h30", petFriendly: false, petNote: "Règles d'hygiène stricte en cuisine." }
    ],
    restaurants: [
      { name: "Izakaya Gonpachi (Kill Bill)", style: "Japonais Traditionnel", priceRange: "€€€", petFriendly: false, petNote: "Animaux non admis en salle." },
      { name: "Café Komazawa & Terrace", style: "Bistrot & Brunch Tokyoïte", priceRange: "€€", petFriendly: true, petNote: "Café pet-friendly avec menu gourmand pour chien." },
      { name: "Ramen Yashiki Harajuku", style: "Bar à Ramen rapide", priceRange: "€", petFriendly: false, petNote: "Comptoir étroit, animaux non admis." }
    ],
    hotels: [
      { name: "Cerulean Tower Tokyu Hotel", stars: 5, pricePerNight: 240, petFriendly: false, petNote: "Hôtel d'affaires, animaux non admis." },
      { name: "Kimpton Shinjuku Tokyo", stars: 5, pricePerNight: 280, petFriendly: true, petNote: "Hôtel 100% pet-friendly : gamelles design, lit pour chien et friandises offertes." },
      { name: "The Millennials Shibuya", stars: 3, pricePerNight: 85, petFriendly: false, petNote: "Capsules individuelles, animaux interdits." }
    ]
  },

  "Bali": {
    country: "Indonésie",
    coordinates: { lat: -8.4095, lng: 115.1889 },
    places: [
      { name: "Rizières en terrasses de Tegallalang", desc: "Paysage spectaculaire d'escaliers d'émeraude et balançoires géantes.", petFriendly: true, petNote: "Sentiers de randonnée accessibles avec animaux." },
      { name: "Temple d'Uluwatu sur les falaises", desc: "Temple perché à 70m au-dessus de l'océan Indien avec spectacle de danse Kecak.", petFriendly: false, petNote: "Interdit en raison des singes sauvages protecteurs." },
      { name: "Plage d'Echo Beach & Canggu", desc: "Spot de surf renommé avec ambiance décontractée et couchers de soleil dorés.", petFriendly: true, petNote: "Plage libre, chiens adorés par la communauté surf." }
    ],
    activities: [
      { name: "Cours particulier de Surf 2h", price: 40, duration: "2h", petFriendly: false, petNote: "Sur l'eau, non adapté." },
      { name: "Randonnée au lever du soleil sur le Mont Batur", price: 55, duration: "5h", petFriendly: true, petNote: "Chiens habitués au trekking acceptés avec guide." },
      { name: "Journée Spa balinais & massage aux huiles de coco", price: 50, duration: "4h", petFriendly: false, petNote: "Espace bien-être calme." }
    ],
    restaurants: [
      { name: "La Brisa Beach Club Canggu", style: "Cuisine côtière & Tapas", priceRange: "€€", petFriendly: true, petNote: "Chiens autorisés sur l'immense terrasse ombragée face à la mer." },
      { name: "Locavore NXT Ubud", style: "Gastronomie durable d'Indonésie", priceRange: "€€€€", petFriendly: false, petNote: "Haute gastronomie, animaux non admis." },
      { name: "Warung Bu Mi", style: "Buffet indonésien Nasi Campur traditionnel", priceRange: "€", petFriendly: true, petNote: "Terrasse ouverte accessible." }
    ],
    hotels: [
      { name: "COMO Uma Canggu", stars: 5, pricePerNight: 220, petFriendly: false, petNote: "Animaux non autorisés." },
      { name: "Desa Seni Eco Resort & Yoga", stars: 4, pricePerNight: 110, petFriendly: true, petNote: "Maisons balinaises en bois avec jardin privatif où les animaux gambadent librement." },
      { name: "Puri Garden Hostel & Pool", stars: 3, pricePerNight: 35, petFriendly: false, petNote: "Dortoirs et chambres privées, animaux non admis." }
    ]
  },

  "Reykjavik": {
    country: "Islande",
    coordinates: { lat: 64.1466, lng: -21.9426 },
    places: [
      { name: "Lagon Bleu Géothermal (Blue Lagoon)", desc: "Eaux turquoise riches en silice au milieu des champs de lave noire.", petFriendly: false, petNote: "Bains thermaux, animaux strictement interdits." },
      { name: "Chutes de Gullfoss & Cercle d'Or", desc: "Puissante double cascade tonitruante dans un canyon sculpté.", petFriendly: true, petNote: "Sentiers panoramiques extérieurs ouverts aux animaux tenus en laisse." },
      { name: "Parc National de Thingvellir", desc: "Faille tectonique entre les plaques eurasienne et américaine.", petFriendly: true, petNote: "Accessible aux animaux tenus en laisse sur les passerelles." }
    ],
    activities: [
      { name: "Safari Aurores Boréales en Super Jeep", price: 120, duration: "4h", petFriendly: false, petNote: "Véhicule collectif chauffé, animaux non admis." },
      { name: "Randonnée sur glacier avec crampons", price: 95, duration: "3h30", petFriendly: false, petNote: "Conditions extrêmes et crevasses dangereuses." },
      { name: "Visite des grottes de lave volcanique", price: 75, duration: "2h", petFriendly: false, petNote: "Grottes souterraines, animaux interdits." }
    ],
    restaurants: [
      { name: "Dill Restaurant Reykjavik", style: "Nouvelle cuisine nordique étoilée", priceRange: "€€€€", petFriendly: false, petNote: "Restaurant gastronomique, animaux non admis." },
      { name: "Bæjarins Beztu Pylsur", style: "Hot-dogs islandais légendaires", priceRange: "€", petFriendly: true, petNote: "Kiosque extérieur en plein air, animaux tout à fait bienvenus." },
      { name: "Kaffi Slippur & Harbour", style: "Poissons frais & Soupes islandaises", priceRange: "€€", petFriendly: true, petNote: "Terrasse du port acceptant les chiens." }
    ],
    hotels: [
      { name: "The Retreat at Blue Lagoon", stars: 5, pricePerNight: 850, petFriendly: false, petNote: "Sanctuaire spa exclusif, animaux interdits." },
      { name: "Center Hotels Plaza Reykjavik", stars: 4, pricePerNight: 160, petFriendly: true, petNote: "Chiens acceptés sur demande préalable (supplément ménage 30€/séjour)." },
      { name: "Kex Hostel Reykjavik", stars: 3, pricePerNight: 55, petFriendly: false, petNote: "Auberge vintage, animaux non admis." }
    ]
  },

  "Rome": {
    country: "Italie",
    coordinates: { lat: 41.9028, lng: 12.4964 },
    places: [
      { name: "Le Colisée & Forum Romain", desc: "Le plus grand amphithéâtre jamais construit sous l'Empire romain.", petFriendly: false, petNote: "Chiens guides uniquement sur le site archéologique." },
      { name: "Parc de la Villa Borghèse", desc: "Vaste parc arboré surplombant la Piazza del Popolo avec lacs et statues.", petFriendly: true, petNote: "Paradis pour les chiens avec grands espaces d'ébats autorisés." },
      { name: "Fontaine de Trevi & Place d'Espagne", desc: "Chef-d'œuvre baroque où lancer une pièce pour s'assurer de revenir à Rome.", petFriendly: true, petNote: "Espace public extérieur, tout à fait accessible avec animaux." }
    ],
    activities: [
      { name: "Visite coupe-file Musées du Vatican & Chapelle Sixtine", price: 45, duration: "3h", petFriendly: false, petNote: "Musée d'État, animaux strictement interdits." },
      { name: "Atelier Pizza & Tiramisu chez un chef romain", price: 70, duration: "2h30", petFriendly: false, petNote: "Cuisine fermée." },
      { name: "Balade en Vespa vintage dans le quartier du Trastevere", price: 90, duration: "3h", petFriendly: false, petNote: "Activité deux-roues." }
    ],
    restaurants: [
      { name: "Trattoria Da Enzo al 29", style: "Cacio e Pepe & Carbonara romaine", priceRange: "€€", petFriendly: true, petNote: "Terrasse typique du Trastevere accueillant les toutous." },
      { name: "La Pergola (Heinz Beck)", style: "3 étoiles Michelin avec vue sur Rome", priceRange: "€€€€", petFriendly: false, petNote: "Tenue correcte exigée, animaux non admis." },
      { name: "Pinsa ‘Mbucca Campo de’ Fiori", style: "Pinsa romaine croustillante sur le pouce", priceRange: "€", petFriendly: true, petNote: "Vente à emporter et tables extérieures ouvertes." }
    ],
    hotels: [
      { name: "Hotel Artemide", stars: 4, pricePerNight: 175, petFriendly: true, petNote: "Très bon accueil des animaux avec coussin et bol fournis en chambre." },
      { name: "Singer Palace Hotel", stars: 5, pricePerNight: 390, petFriendly: false, petNote: "Animaux non admis." },
      { name: "The RomeHello Hostel & Design", stars: 3, pricePerNight: 60, petFriendly: false, petNote: "Chambres partagées, animaux non admis." }
    ]
  },

  "New York": {
    country: "États-Unis",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    places: [
      { name: "Central Park & The Ramble", desc: "Poumon vert de Manhattan avec sentiers ombragés, étangs et ponts de pierre.", petFriendly: true, petNote: "Off-leash hours : chiens autorisés en liberté avant 9h et après 21h !" },
      { name: "Observatoire Summit One Vanderbilt", desc: "Expérience vertigineuse tout en miroirs au 91e étage avec vue sur Manhattan.", petFriendly: false, petNote: "Attraction vitrée, animaux non admis." },
      { name: "Promenade de la High Line & Chelsea", desc: "Ancienne voie ferrée aérienne transformée en jardin suspendu.", petFriendly: false, petNote: "Règlement municipal strict : animaux interdits sur la High Line." }
    ],
    activities: [
      { name: "Billet Comédie Musicale Broadway", price: 130, duration: "2h45", petFriendly: false, petNote: "Théâtres fermés aux animaux." },
      { name: "Croisière Ferry Statue de la Liberté & Ellis Island", price: 35, duration: "2h", petFriendly: false, petNote: "Contrôles fédéraux de sécurité." },
      { name: "Visite guidée Street Art à Brooklyn (Bushwick)", price: 40, duration: "2h", petFriendly: true, petNote: "Visite pédestre extérieure 100% accessible avec animaux." }
    ],
    restaurants: [
      { name: "Shake Shack Madison Square Park", style: "Burgers iconiques new-yorkais", priceRange: "€", petFriendly: true, petNote: "Kiosque dans le parc proposant même le 'Pooch-ini' (glace pour chien) !" },
      { name: "Le Bernardin (Eric Ripert)", style: "Haute gastronomie marine 3 étoiles", priceRange: "€€€€", petFriendly: false, petNote: "Animaux non admis." },
      { name: "Katz's Delicatessen", style: "Pastrami sandwich mythique du Lower East Side", priceRange: "€€", petFriendly: false, petNote: "Salle bondée, animaux non admis." }
    ],
    hotels: [
      { name: "The Benjamin Royal Sonesta New York", stars: 4, pricePerNight: 290, petFriendly: true, petNote: "Programme 'Barking Zoo' : lit moelleux, friandises artisanales et conciergerie canine." },
      { name: "The Plaza Hotel Fifth Avenue", stars: 5, pricePerNight: 750, petFriendly: true, petNote: "Chambres de luxe acceptant les chiens jusqu'à 15kg." },
      { name: "Pod 39 Hotel Murray Hill", stars: 3, pricePerNight: 120, petFriendly: false, petNote: "Micro-chambres, animaux non autorisés." }
    ]
  },

  "Barcelone": {
    country: "Espagne",
    coordinates: { lat: 41.3879, lng: 2.1699 },
    places: [
      { name: "Basilique de la Sagrada Família", desc: "Chef-d'œuvre inachevé d'Antoni Gaudí avec ses tours colossales et vitraux flamboyants.", petFriendly: false, petNote: "Monument religieux classé, animaux non admis." },
      { name: "Parc Güell & Colline du Carmel", desc: "Parc onirique aux mosaïques colorées surplombant la Méditerranée.", petFriendly: true, petNote: "Chiens autorisés en laisse dans la zone forestière et les sentiers extérieurs." },
      { name: "Barrio Gótico & Plage de la Barceloneta", desc: "Ruelle médiévales ombragées débouchant sur la promenade maritime.", petFriendly: true, petNote: "Zone canine balisée sur la plage de Llevant en saison." }
    ],
    activities: [
      { name: "Spectacle de Flamenco intime au Palais Dalmases", price: 38, duration: "1h", petFriendly: false, petNote: "Salle fermée avec acoustique feutrée." },
      { name: "Tour guidé tapas et vins catalans dans El Born", price: 55, duration: "2h30", petFriendly: true, petNote: "Terrasses extérieures des bars à tapas acceptant les animaux." },
      { name: "Téléphérique du Port de Barcelone à Montjuïc", price: 16, duration: "30 min", petFriendly: true, petNote: "Petits animaux dans panier ou sac de transport acceptés." }
    ],
    restaurants: [
      { name: "Cervecería Catalana", style: "Tapas catalanes & fruits de mer", priceRange: "€€", petFriendly: true, petNote: "Terrasse animée avec accueil très chaleureux des animaux." },
      { name: "Disfrutar Barcelona", style: "Élu Meilleur Restaurant du Monde 2024 (3 étoiles)", priceRange: "€€€€", petFriendly: false, petNote: "Gastronomie d'avant-garde, animaux interdits." },
      { name: "El Xampanyet", style: "Bar à tapas et cava authentique depuis 1929", priceRange: "€€", petFriendly: false, petNote: "Bar historique exigu, animaux non recommandés." }
    ],
    hotels: [
      { name: "Hotel Acta Voraport & Rooftop Pool", stars: 3, pricePerNight: 85, petFriendly: true, petNote: "Poblenou, à 10 min de la plage avec animaux bienvenus (supplément 15€)." },
      { name: "W Barcelona (Hôtel Voile)", stars: 5, pricePerNight: 350, petFriendly: true, petNote: "Programme 'P.A.W. (Pets Are Welcome)' avec lit W, jouets et room service canin." },
      { name: "Chic & Basic Habana Hoose", stars: 3, pricePerNight: 95, petFriendly: false, petNote: "Style rétro chic, animaux non admis." }
    ]
  }
};

// 6. Utilisateurs pré-configurés de démonstration pour tester instantanément les 3 âges
const DEFAULT_SAMPLE_USERS = [
  {
    id: 'user_lea_jeune',
    email: 'lea.jeune@odyssey.travel',
    pseudo: 'Léa_Wanderlust',
    birthYear: 2003, // 23 ans -> Jeune
    createdAt: '2026-01-15'
  },
  {
    id: 'user_thomas_adulte',
    email: 'thomas.adulte@odyssey.travel',
    pseudo: 'Thomas_Explorer',
    birthYear: 1988, // 38 ans -> Adulte
    createdAt: '2026-02-10'
  },
  {
    id: 'user_helene_senior',
    email: 'helene.senior@odyssey.travel',
    pseudo: 'Hélène_Voyages',
    birthYear: 1962, // 64 ans -> Senior
    createdAt: '2026-03-05'
  }
];

// 7. Dossiers de voyage par défaut créés pour chaque utilisateur de démo
const DEFAULT_USER_TRIPS = {
  user_lea_jeune: [
    {
      id: 'trip_bali_2027',
      title: 'Roadtrip Surf & Rivières à Bali',
      destination: 'Bali',
      country: 'Indonésie',
      coordinates: { lat: -8.4095, lng: 115.1889 },
      travelersCount: 2,
      maxBudgetPerPerson: 1000,
      totalBudget: 2000,
      travelType: 'aventure',
      hasPets: false,
      startDate: '2027-07-10',
      endDate: '2027-07-24',
      status: 'planned', // 'planned' (prévu) ou 'past' (passé)
      coverImage: 'assets/images/world_filmstrip_3.jpg',
      budgetBreakdown: {
        hotels: 360,
        food: 300,
        activities: 760,
        flights: 400,
        shopping: 80,
        emergency: 100
      },
      notes: "Logement en éco-resort, sessions de surf tous les matins et trek au volcan Batur."
    },
    {
      id: 'trip_lisbonne_2025',
      title: 'Escapade Estivale à Lisbonne',
      destination: 'Barcelone', // Utilisé avec image et souvenirs
      country: 'Espagne',
      coordinates: { lat: 41.3879, lng: 2.1699 },
      travelersCount: 3,
      maxBudgetPerPerson: 550,
      totalBudget: 1650,
      travelType: 'urbain',
      hasPets: false,
      startDate: '2025-06-12',
      endDate: '2025-06-18',
      status: 'past',
      coverImage: 'assets/images/barcelona_sagrada.jpg',
      budgetBreakdown: {
        hotels: 480,
        food: 420,
        activities: 310,
        flights: 240,
        shopping: 120,
        emergency: 80
      },
      rating: 5,
      notes: "Superbe voyage ! Les tapas étaient délicieuses et le spectacle flamenco inoubliable."
    }
  ],

  user_thomas_adulte: [
    {
      id: 'trip_islande_2027',
      title: 'Grand Tour d’Islande en 4x4',
      destination: 'Reykjavik',
      country: 'Islande',
      coordinates: { lat: 64.1466, lng: -21.9426 },
      travelersCount: 2,
      maxBudgetPerPerson: 1700,
      totalBudget: 3400,
      travelType: 'nature',
      hasPets: true, // Avec animal de compagnie !
      startDate: '2027-09-05',
      endDate: '2027-09-15',
      status: 'planned',
      coverImage: 'assets/images/world_filmstrip_2.jpg',
      budgetBreakdown: {
        hotels: 1020,
        food: 550,
        activities: 950,
        flights: 610,
        shopping: 100,
        emergency: 170
      },
      notes: "Voyage avec notre chien berger australien. Recherche de chalets avec jardins clos."
    },
    {
      id: 'trip_rome_2024',
      title: 'Immersion Baroque & Saveurs à Rome',
      destination: 'Rome',
      country: 'Italie',
      coordinates: { lat: 41.9028, lng: 12.4964 },
      travelersCount: 2,
      maxBudgetPerPerson: 1200,
      totalBudget: 2400,
      travelType: 'culturel',
      hasPets: false,
      startDate: '2024-10-18',
      endDate: '2024-10-24',
      status: 'past',
      coverImage: 'assets/images/world_filmstrip_3.jpg',
      budgetBreakdown: {
        hotels: 680,
        food: 580,
        activities: 620,
        flights: 320,
        shopping: 110,
        emergency: 90
      },
      rating: 5,
      notes: "Visite privée du Vatican au crépuscule et dîner mémorable au Trastevere."
    }
  ],

  user_helene_senior: [
    {
      id: 'trip_fjords_2027',
      title: 'Fjords de Norvège & Ligne de Flåm',
      destination: 'Reykjavik',
      country: 'Norvège',
      coordinates: { lat: 60.3913, lng: 5.3221 },
      travelersCount: 2,
      maxBudgetPerPerson: 2200,
      totalBudget: 4400,
      travelType: 'chill',
      hasPets: false,
      startDate: '2027-06-01',
      endDate: '2027-06-11',
      status: 'planned',
      coverImage: 'assets/images/world_filmstrip_1.jpg',
      budgetBreakdown: {
        hotels: 1760,
        food: 880,
        activities: 440,
        flights: 660,
        shopping: 440,
        emergency: 220
      },
      notes: "Cabine avec balcon vue sur le fjord et billets en première classe pour le train de Flåm."
    },
    {
      id: 'trip_kyoto_2025',
      title: 'Kyoto : Jardins Zen & Ryokans Impériaux',
      destination: 'Tokyo',
      country: 'Japon',
      coordinates: { lat: 35.0116, lng: 135.7681 },
      travelersCount: 2,
      maxBudgetPerPerson: 2500,
      totalBudget: 5000,
      travelType: 'culturel',
      hasPets: false,
      startDate: '2025-04-02',
      endDate: '2025-04-14',
      status: 'past',
      coverImage: 'assets/images/world_filmstrip_2.jpg',
      budgetBreakdown: {
        hotels: 1500,
        food: 1100,
        activities: 1350,
        flights: 700,
        shopping: 200,
        emergency: 150
      },
      rating: 5,
      notes: "Les cerisiers en fleurs étaient en pleine floraison. Hospitalité japonaise exceptionnelle."
    }
  ]
};

// 8. Galerie de photos initiales pour le Studio Vlog et la Galerie
const DEFAULT_MEDIA_GALLERY = [
  {
    id: 'media-1',
    tripId: 'trip_bali_2027',
    destination: 'Bali',
    url: 'assets/images/world_filmstrip_3.jpg',
    type: 'image',
    title: 'Rizières de Tegallalang à l’aube',
    caption: 'Lumière matinale sur les palmiers et les terrasses sacrées.',
    favoriteForVlog: true
  },
  {
    id: 'media-2',
    tripId: 'trip_bali_2027',
    destination: 'Bali',
    url: 'assets/images/world_filmstrip_1.jpg',
    type: 'image',
    title: 'Lagon Turquoise & Bungalows sur pilotis',
    caption: 'Pause fraîcheur dans les eaux cristallines de l’océan Indien.',
    favoriteForVlog: true
  },
  {
    id: 'media-3',
    tripId: 'trip_islande_2027',
    destination: 'Reykjavik',
    url: 'assets/images/world_filmstrip_2.jpg',
    type: 'image',
    title: 'Aurore Boréale sur les Fjords',
    caption: 'Nuit magique illuminée par des rubans verts et violets.',
    favoriteForVlog: true
  },
  {
    id: 'media-4',
    tripId: 'trip_rome_2024',
    destination: 'Rome',
    url: 'assets/images/world_filmstrip_3.jpg',
    type: 'image',
    title: 'Acropole & Temples Antiques au crépuscule',
    caption: 'Contemplation des colonnes de marbre doré sous le soleil couchant.',
    favoriteForVlog: true
  },
  {
    id: 'media-5',
    tripId: 'trip_lisbonne_2025',
    destination: 'Barcelone',
    url: 'assets/images/barcelona_sagrada.jpg',
    type: 'image',
    title: 'Flèches de la Sagrada Família',
    caption: 'Le génie de Gaudí s’élevant vers le ciel azur de Catalogne.',
    favoriteForVlog: true
  },
  {
    id: 'media-6',
    tripId: 'trip_lisbonne_2025',
    destination: 'Barcelone',
    url: 'assets/images/tapas_gastronomy.jpg',
    type: 'image',
    title: 'Dégustation de Tapas en terrasse',
    caption: 'Jambon ibérique, pan con tomate et rires partagés.',
    favoriteForVlog: true
  }
];
