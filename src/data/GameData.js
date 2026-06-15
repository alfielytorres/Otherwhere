// Static game data for Bagong Lupa City (BGC + Makati vibes)

export const BUILDINGS = [
  {
    id: 'HOME',
    name: 'Condo Ko',
    nameEn: 'My BGC Condo',
    buildingType: 'residential',
    color: 0x1a2a3a,
    roofColor: 0x0d1a2a,
    width: 14, depth: 12, height: 28,
    x: -70, z: -70,
    interactionRadius: 12,
    activities: ['SLEEP', 'COOK', 'SHOWER', 'WATCH_TV', 'READ'],
  },
  {
    id: 'POBLACION_BAR',
    name: 'Cantina sa Poblacion',
    nameEn: 'Poblacion Bar',
    buildingType: 'bar',
    color: 0x1a0a0a,
    roofColor: 0x0a0505,
    width: 10, depth: 8, height: 5,
    x: 30, z: 60,
    interactionRadius: 10,
    activities: ['DRINK', 'SOCIALIZE', 'SING'],
    neonSign: { text: 'OPEN', color: 0xFF0044 },
  },
  {
    id: 'STREET_FOOD',
    name: 'Ihaw-Ihaw ni Mang Jun',
    nameEn: 'Street BBQ',
    buildingType: 'outdoor',
    color: 0x2a1a0a,
    roofColor: 0x1a0a00,
    width: 6, depth: 4, height: 1,
    x: 50, z: 70,
    interactionRadius: 8,
    activities: ['EAT_ISAW', 'EAT_BBQPORK', 'EAT_BALUT'],
    isOutdoor: true,
  },
  {
    id: 'SEVEN_ELEVEN',
    name: '7-Eleven',
    nameEn: 'Convenience Store',
    buildingType: 'store',
    color: 0x00AA44,
    roofColor: 0xDD0000,
    width: 8, depth: 6, height: 5,
    x: 70, z: -50,
    interactionRadius: 8,
    activities: ['BUY_DRINKS', 'BUY_SNACKS', 'BUY_CIGARETTE'],
    neonSign: { text: '7-ELEVEN', color: 0x00FF44 },
  },
  {
    id: 'BGC_TOWER',
    name: 'BGC Opisina',
    nameEn: 'BGC Office Tower',
    buildingType: 'office',
    color: 0x88CCFF,
    roofColor: 0x4488BB,
    width: 22, depth: 18, height: 35,
    x: -20, z: -60,
    interactionRadius: 15,
    activities: ['WORK', 'REPORT_TO_BOSS'],
  },
  {
    id: 'MALL',
    name: 'Greenbelt Makati',
    nameEn: 'Greenbelt Mall',
    buildingType: 'mall',
    color: 0xE0D8C8,
    roofColor: 0xB0A898,
    width: 30, depth: 24, height: 16,
    x: 60, z: 20,
    interactionRadius: 20,
    activities: ['SHOP', 'EAT_FOOD_COURT', 'AIRCON_BREAK'],
  },
  {
    id: 'CHURCH',
    name: 'Simbahang Luma',
    nameEn: 'Old Stone Church',
    buildingType: 'church',
    color: 0xC8B89A,
    roofColor: 0x888070,
    width: 16, depth: 20, height: 18,
    x: -40, z: 30,
    interactionRadius: 14,
    activities: ['ATTEND_MASS', 'PRAY', 'LIGHT_CANDLE'],
  },
  {
    id: 'RESTAURANT',
    name: 'Hole-in-the-Wall',
    nameEn: 'Carinderia',
    buildingType: 'restaurant',
    color: 0x3a2a1a,
    roofColor: 0x2a1a0a,
    width: 12, depth: 10, height: 5,
    x: 80, z: -20,
    interactionRadius: 11,
    activities: ['EAT_ADOBO', 'EAT_SINIGANG', 'EAT_LECHON'],
    neonSign: { text: 'KAIN NA!', color: 0xFF8800 },
  },
  {
    id: 'INTERNET_CAFE',
    name: 'Netopia BGC',
    nameEn: 'Internet Cafe',
    buildingType: 'entertainment',
    color: 0x0a0a2a,
    roofColor: 0x050510,
    width: 12, depth: 10, height: 6,
    x: -70, z: 20,
    interactionRadius: 10,
    activities: ['PLAY_GAMES', 'BROWSE_INTERNET'],
    neonSign: { text: 'INTERNET', color: 0x00FFFF },
  },
  {
    id: 'BASKETBALL',
    name: 'Court sa Likod',
    nameEn: 'Back Alley Court',
    buildingType: 'outdoor',
    color: 0x444444,
    roofColor: 0x333333,
    width: 22, depth: 12, height: 1,
    x: -80, z: 60,
    interactionRadius: 16,
    activities: ['PLAY_BASKETBALL', 'WATCH_GAME'],
    isOutdoor: true,
  },
  {
    id: 'GYM',
    name: 'BGC Fitness',
    nameEn: 'BGC Gym',
    buildingType: 'gym',
    color: 0xFF4400,
    roofColor: 0xCC2200,
    width: 16, depth: 12, height: 8,
    x: -80, z: -30,
    interactionRadius: 12,
    activities: ['EXERCISE', 'TRAIN'],
    neonSign: { text: 'GYM', color: 0xFF4400 },
  },
  {
    id: 'KARAOKE',
    name: 'KTV sa Poblacion',
    nameEn: 'Poblacion KTV',
    buildingType: 'entertainment',
    color: 0x2a0a2a,
    roofColor: 0x1a051a,
    width: 12, depth: 10, height: 7,
    x: 40, z: 70,
    interactionRadius: 11,
    activities: ['SING', 'DRINK', 'SOCIALIZE'],
    neonSign: { text: 'VIDEOKE', color: 0xFF00FF },
  },
  {
    id: 'HILOT_SPA',
    name: 'Spa ng Kapitolyo',
    nameEn: 'Filipino Massage Spa',
    buildingType: 'spa',
    color: 0x2a1a0a,
    roofColor: 0x1a0a00,
    width: 12, depth: 10, height: 6,
    x: -50, z: -50,
    interactionRadius: 10,
    activities: ['GET_HILOT', 'REST'],
  },
  {
    id: 'PALENGKE',
    name: 'Wet Market',
    nameEn: 'Marikina-style Market',
    buildingType: 'market',
    color: 0x4a3a2a,
    roofColor: 0x3a2a1a,
    width: 22, depth: 16, height: 6,
    x: 70, z: -70,
    interactionRadius: 14,
    activities: ['BUY_GROCERIES', 'BUY_SNACKS'],
  },
  {
    id: 'SARI_SARI',
    name: 'Tindahan sa Kanto',
    nameEn: 'Corner Store',
    buildingType: 'store',
    color: 0x3a2a1a,
    roofColor: 0x2a1a0a,
    width: 8, depth: 6, height: 5,
    x: 90, z: -50,
    interactionRadius: 8,
    activities: ['BUY_DRINKS', 'BUY_SNACKS', 'CHISMIS'],
  },
  // RED LIGHT DISTRICT (Burgos St / Ermita area, positioned near z=90-110)
  {
    id: 'BURGOS_BAR',
    name: 'Roses Club',
    nameEn: 'Burgos St Girlie Bar',
    buildingType: 'girlie_bar',
    color: 0x3a0010, roofColor: 0x1a0008,
    width: 14, depth: 12, height: 6,
    x: 20, z: 90, interactionRadius: 11,
    activities: ['WATCH_SHOW', 'DRINK', 'SOCIALIZE', 'VIP_ROOM'],
    neonSign: { text: 'ROSES', color: 0xFF0066 },
    district: 'red_light'
  },
  {
    id: 'UNDERGROUND_CASINO',
    name: 'Lucky 13',
    nameEn: 'Underground Casino',
    buildingType: 'casino',
    color: 0x1a1400, roofColor: 0x0a0a00,
    width: 16, depth: 14, height: 7,
    x: -20, z: 95, interactionRadius: 12,
    activities: ['GAMBLE', 'DRINK'],
    neonSign: { text: 'LUCKY 13', color: 0xFFAA00 },
    district: 'red_light'
  },
  {
    id: 'PAWNSHOP',
    name: 'Quick Cash Sangla',
    nameEn: 'Pawnshop',
    buildingType: 'store',
    color: 0x2a2a1a, roofColor: 0x1a1a0a,
    width: 8, depth: 6, height: 5,
    x: -45, z: 85, interactionRadius: 8,
    activities: ['PAWN_ITEM', 'BUY_CONTRABAND'],
    neonSign: { text: 'SANGLA', color: 0xFFDD00 },
    district: 'red_light'
  },
  {
    id: 'SKETCHY_MASSAGE',
    name: 'Pink Palace',
    nameEn: 'Questionable Massage',
    buildingType: 'spa', // reuse spa type
    color: 0x2a0a1a, roofColor: 0x1a0510,
    width: 10, depth: 8, height: 5,
    x: 50, z: 95, interactionRadius: 9,
    activities: ['GET_SPECIAL_MASSAGE', 'REST'],
    neonSign: { text: 'OPEN 24H', color: 0xFF66AA },
    district: 'red_light'
  },
  {
    id: 'DARK_ALLEY',
    name: 'Eskinita',
    nameEn: 'Dark Alley',
    buildingType: 'outdoor',
    color: 0x0a0a0a, roofColor: 0x050505,
    width: 6, depth: 8, height: 4,
    x: 0, z: 110, interactionRadius: 7,
    activities: ['BUY_DRUGS', 'SELL_STOLEN'],
    isOutdoor: true,
    district: 'red_light'
  },
];

export const ACTIVITIES = {
  SLEEP: {
    name: 'Matulog',
    nameEn: 'Sleep',
    duration: 8,
    needsEffect: { lakas: 50, kalinisan: -5 },
    cost: 0,
    earnings: 0,
    emoji: '😴',
    description: 'Rest and recharge your energy'
  },
  COOK: {
    name: 'Magluto',
    nameEn: 'Cook',
    duration: 1,
    needsEffect: { gutom: 40, kasiyahan: 10 },
    cost: -200,
    earnings: 0,
    emoji: '🍳',
    description: 'Cook delicious Filipino food'
  },
  SHOWER: {
    name: 'Maligo',
    nameEn: 'Take a Shower',
    duration: 0.5,
    needsEffect: { kalinisan: 40, kasiyahan: 5 },
    cost: 0,
    earnings: 0,
    emoji: '🚿',
    description: 'Refresh yourself'
  },
  WATCH_TV: {
    name: 'Manood ng TV',
    nameEn: 'Watch TV',
    duration: 2,
    needsEffect: { kasiyahan: 30, lakas: -5 },
    cost: 0,
    earnings: 0,
    emoji: '📺',
    description: 'Watch your favorite teleserye'
  },
  READ: {
    name: 'Magbasa',
    nameEn: 'Read Book',
    duration: 1,
    needsEffect: { kasiyahan: 15, karera: 5 },
    cost: 0,
    earnings: 0,
    emoji: '📚',
    description: 'Expand your knowledge'
  },
  BUY_GROCERIES: {
    name: 'Mamili ng Pagkain',
    nameEn: 'Buy Groceries',
    duration: 0.5,
    needsEffect: { gutom: 5, kasiyahan: 5 },
    cost: -500,
    earnings: 0,
    emoji: '🛒',
    description: 'Stock up on food supplies'
  },
  BUY_SNACKS: {
    name: 'Bumili ng Meryenda',
    nameEn: 'Buy Snacks',
    duration: 0.25,
    needsEffect: { gutom: 20, kasiyahan: 10 },
    cost: -50,
    earnings: 0,
    emoji: '🍡',
    description: 'Kakanin at meryenda'
  },
  BUY_DRINKS: {
    name: 'Bumili ng Inumin',
    nameEn: 'Buy Drinks',
    duration: 0.25,
    needsEffect: { gutom: 10, lakas: 10 },
    cost: -30,
    earnings: 0,
    emoji: '🥤',
    description: 'Cold refreshments'
  },
  BUY_CIGARETTE: {
    name: 'Bumili ng Sigarilyo',
    nameEn: 'Buy Cigarette',
    duration: 0.1,
    needsEffect: { kasiyahan: 15 },
    cost: -10,
    earnings: 0,
    emoji: '🚬',
    description: 'Para relaxin lang...'
  },
  CHISMIS: {
    name: 'Makibalita',
    nameEn: 'Gossip / Chat',
    duration: 1,
    needsEffect: { lipunan: 35, kasiyahan: 20 },
    cost: 0,
    earnings: 0,
    emoji: '🗣️',
    description: 'Share tsismis with the neighbors'
  },
  EAT_ISAW: {
    name: 'Kumain ng Isaw',
    nameEn: 'Eat Isaw',
    duration: 0.2,
    needsEffect: { gutom: 20, kasiyahan: 25 },
    cost: -20,
    earnings: 0,
    emoji: '🍢',
    description: 'Grilled intestines na panalo!'
  },
  EAT_BBQPORK: {
    name: 'BBQ Pork',
    nameEn: 'Pork BBQ Stick',
    duration: 0.2,
    needsEffect: { gutom: 25, kasiyahan: 20 },
    cost: -15,
    earnings: 0,
    emoji: '🥩',
    description: 'Inihaw na baboy sa daan'
  },
  EAT_BALUT: {
    name: 'Kumain ng Balut',
    nameEn: 'Eat Balut',
    duration: 0.1,
    needsEffect: { gutom: 15, kasiyahan: 10 },
    cost: -18,
    earnings: 0,
    emoji: '🥚',
    description: 'Penoy o balut?'
  },
  EAT_BURGER: {
    name: 'Kumain ng Burger',
    nameEn: 'Eat Burger',
    duration: 0.5,
    needsEffect: { gutom: 40 },
    cost: -120,
    earnings: 0,
    emoji: '🍔',
    description: 'Classic burger and fries'
  },
  EAT_CHICKENJOY: {
    name: 'Kumain ng Manok',
    nameEn: 'Eat Fried Chicken',
    duration: 0.5,
    needsEffect: { gutom: 45, kasiyahan: 10 },
    cost: -150,
    earnings: 0,
    emoji: '🍗',
    description: 'Crispy fried chicken with rice'
  },
  EAT_SPAGHETTI: {
    name: 'Kumain ng Spaghetti',
    nameEn: 'Eat Sweet Spaghetti',
    duration: 0.5,
    needsEffect: { gutom: 35, kasiyahan: 15 },
    cost: -100,
    earnings: 0,
    emoji: '🍝',
    description: 'Classic Filipino sweet spaghetti'
  },
  EAT_ADOBO: {
    name: 'Kumain ng Adobo',
    nameEn: 'Eat Chicken Adobo',
    duration: 1,
    needsEffect: { gutom: 60, kasiyahan: 25, lipunan: 10 },
    cost: -250,
    earnings: 0,
    emoji: '🍱',
    description: 'Classic Filipino chicken adobo'
  },
  EAT_SINIGANG: {
    name: 'Kumain ng Sinigang',
    nameEn: 'Eat Sinigang Soup',
    duration: 1,
    needsEffect: { gutom: 55, kasiyahan: 20, kalinisan: 5 },
    cost: -280,
    earnings: 0,
    emoji: '🍲',
    description: 'Sour tamarind soup with veggies'
  },
  EAT_LECHON: {
    name: 'Kumain ng Lechon',
    nameEn: 'Eat Lechon',
    duration: 1,
    needsEffect: { gutom: 70, kasiyahan: 40, lipunan: 20 },
    cost: -500,
    earnings: 0,
    emoji: '🐷',
    description: 'Crispy whole roasted pig!'
  },
  EAT_FOOD_COURT: {
    name: 'Kumain sa Food Court',
    nameEn: 'Eat at Food Court',
    duration: 0.75,
    needsEffect: { gutom: 45, lipunan: 10 },
    cost: -200,
    earnings: 0,
    emoji: '🍜',
    description: 'Various food options to choose from'
  },
  SHOP: {
    name: 'Mamili',
    nameEn: 'Go Shopping',
    duration: 2,
    needsEffect: { kasiyahan: 30, lakas: -10 },
    cost: -1000,
    earnings: 0,
    emoji: '🛍️',
    description: 'Browse the shops in the mall'
  },
  AIRCON_BREAK: {
    name: 'Magpahinga sa Aircon',
    nameEn: 'Cool Down in AC',
    duration: 0.5,
    needsEffect: { lakas: 20, kasiyahan: 15 },
    cost: -50,
    earnings: 0,
    emoji: '❄️',
    description: 'Escape the tropical heat'
  },
  ATTEND_MASS: {
    name: 'Magsimba',
    nameEn: 'Attend Mass',
    duration: 1,
    needsEffect: { kasiyahan: 30, lipunan: 20, karera: 10 },
    cost: 0,
    earnings: 0,
    emoji: '⛪',
    description: 'Sunday mass with the community'
  },
  PRAY: {
    name: 'Manalangin',
    nameEn: 'Pray',
    duration: 0.5,
    needsEffect: { kasiyahan: 20, lakas: 10 },
    cost: 0,
    earnings: 0,
    emoji: '🙏',
    description: 'Find inner peace and guidance'
  },
  LIGHT_CANDLE: {
    name: 'Mag-ilaw ng Kandila',
    nameEn: 'Light a Candle',
    duration: 0.25,
    needsEffect: { kasiyahan: 10 },
    cost: -20,
    earnings: 0,
    emoji: '🕯️',
    description: 'Offer a prayer with candle'
  },
  WORK: {
    name: 'Magtrabaho',
    nameEn: 'Work',
    duration: 8,
    needsEffect: { lakas: -30, kasiyahan: -10, karera: 40 },
    cost: 0,
    earnings: 2000,
    emoji: '💼',
    description: 'Put in a full day\'s work'
  },
  REPORT_TO_BOSS: {
    name: 'Mag-ulat sa Boss',
    nameEn: 'Report to Boss',
    duration: 1,
    needsEffect: { kasiyahan: -5, karera: 20 },
    cost: 0,
    earnings: 0,
    emoji: '👔',
    description: 'Show your boss your progress'
  },
  SING: {
    name: 'Kumanta',
    nameEn: 'Sing Videoke',
    duration: 2,
    needsEffect: { kasiyahan: 50, lipunan: 40, lakas: -10 },
    cost: -300,
    earnings: 0,
    emoji: '🎤',
    description: 'Belt out your favorite OPM songs!'
  },
  DRINK: {
    name: 'Uminom',
    nameEn: 'Have a Drink',
    duration: 1,
    needsEffect: { kasiyahan: 30, lipunan: 30, kalinisan: -5 },
    cost: -200,
    earnings: 0,
    emoji: '🍺',
    description: 'San Miguel time with friends'
  },
  SOCIALIZE: {
    name: 'Makisalamuha',
    nameEn: 'Socialize',
    duration: 1.5,
    needsEffect: { lipunan: 50, kasiyahan: 20 },
    cost: -100,
    earnings: 0,
    emoji: '🎉',
    description: 'Meet and mingle with people'
  },
  EXERCISE: {
    name: 'Mag-ehersisyo',
    nameEn: 'Exercise',
    duration: 1,
    needsEffect: { lakas: -20, kasiyahan: 20, kalinisan: -15 },
    cost: -200,
    earnings: 0,
    emoji: '💪',
    description: 'Stay fit and healthy'
  },
  TRAIN: {
    name: 'Mag-ensayo',
    nameEn: 'Train Hard',
    duration: 2,
    needsEffect: { lakas: -35, kasiyahan: 10, karera: 15 },
    cost: -300,
    earnings: 0,
    emoji: '🏋️',
    description: 'Push your physical limits'
  },
  PLAY_GAMES: {
    name: 'Maglaro ng Laro',
    nameEn: 'Play Computer Games',
    duration: 2,
    needsEffect: { kasiyahan: 40, lakas: -10, gutom: -10 },
    cost: -100,
    earnings: 0,
    emoji: '🎮',
    description: 'Online gaming session'
  },
  BROWSE_INTERNET: {
    name: 'Mag-internet',
    nameEn: 'Browse Internet',
    duration: 1,
    needsEffect: { kasiyahan: 15, karera: 5 },
    cost: -50,
    earnings: 0,
    emoji: '💻',
    description: 'Catch up on social media'
  },
  PLAY_BASKETBALL: {
    name: 'Maglaro ng Basketball',
    nameEn: 'Play Basketball',
    duration: 2,
    needsEffect: { kasiyahan: 40, lakas: -25, lipunan: 30, kalinisan: -20 },
    cost: 0,
    earnings: 0,
    emoji: '🏀',
    description: 'Palaruan fun with the barkada'
  },
  WATCH_GAME: {
    name: 'Manood ng Laro',
    nameEn: 'Watch the Game',
    duration: 1,
    needsEffect: { kasiyahan: 25, lipunan: 20 },
    cost: 0,
    earnings: 0,
    emoji: '👀',
    description: 'Cheer for your team'
  },
  GET_HILOT: {
    name: 'Magpa-hilot',
    nameEn: 'Get Traditional Massage',
    duration: 2,
    needsEffect: { lakas: 40, kasiyahan: 35, kalinisan: 10 },
    cost: -800,
    earnings: 0,
    emoji: '💆',
    description: 'Traditional Filipino hilot massage'
  },
  REST: {
    name: 'Magpahinga',
    nameEn: 'Rest and Relax',
    duration: 1,
    needsEffect: { lakas: 25, kasiyahan: 20 },
    cost: -400,
    earnings: 0,
    emoji: '🛋️',
    description: 'Complete rest and relaxation'
  },
  WATCH_SHOW: {
    name: 'Manood ng Show',
    nameEn: 'Watch the Show',
    duration: 1.5,
    needsEffect: { kasiyahan: 35, lipunan: 20 },
    cost: -500, earnings: 0,
    emoji: '💃',
    description: 'Watch the stage performers'
  },
  VIP_ROOM: {
    name: 'VIP Room',
    nameEn: 'VIP Room',
    duration: 2,
    needsEffect: { kasiyahan: 50, lipunan: 30 },
    cost: -2000, earnings: 0,
    emoji: '🔞',
    description: 'Private VIP experience...'
  },
  GAMBLE: {
    name: 'Magsugal',
    nameEn: 'Gamble',
    duration: 2,
    needsEffect: { kasiyahan: 20, lakas: -10 },
    cost: -1000, earnings: 3000,
    emoji: '🎲',
    description: 'Try your luck at cards or mahjong (you might lose!)'
  },
  PAWN_ITEM: {
    name: 'Magsangla',
    nameEn: 'Pawn Something',
    duration: 0.25,
    needsEffect: { kasiyahan: -10 },
    cost: 0, earnings: 500,
    emoji: '💍',
    description: 'Get quick cash by pawning valuables'
  },
  BUY_CONTRABAND: {
    name: 'Bumili ng Kontraband',
    nameEn: 'Buy Contraband',
    duration: 0.25,
    needsEffect: { kasiyahan: 10 },
    cost: -200, earnings: 0,
    emoji: '📦',
    description: 'No questions asked purchases'
  },
  GET_SPECIAL_MASSAGE: {
    name: 'Espesyal na Masahe',
    nameEn: 'Special Massage',
    duration: 1.5,
    needsEffect: { lakas: 30, kasiyahan: 40 },
    cost: -1500, earnings: 0,
    emoji: '🌸',
    description: '...'
  },
  BUY_DRUGS: {
    name: 'Bumili ng Droga',
    nameEn: 'Buy Drugs',
    duration: 0.1,
    needsEffect: { kasiyahan: 30, kalinisan: -20, lakas: -10 },
    cost: -300, earnings: 0,
    emoji: '💊',
    description: 'This is dangerous... and illegal'
  },
  SELL_STOLEN: {
    name: 'Magbenta ng Ninakaw',
    nameEn: 'Sell Stolen Goods',
    duration: 0.25,
    needsEffect: { kasiyahan: -5 },
    cost: 0, earnings: 800,
    emoji: '🕵️',
    description: 'Fence stolen goods in the alley'
  }
};

export const NEEDS_CONFIG = {
  gutom: -0.5,
  lakas: -0.3,
  lipunan: -0.4,
  kasiyahan: -0.4,
  kalinisan: -0.2,
  karera: 0
};

export const NPC_NAMES = [
  'Mang Tasyo', 'Aling Nena', 'Kuya Boyet', 'Ate Cora', 'Tito Ben',
  'Lola Sita', 'Bunso', 'Dodong', 'Pedro', 'Maria Clara',
  'Jose', 'Rizal', 'Nanding', 'Sabel', 'Carding'
];

export const NPC_DIALOGUES = {
  'Mang Tasyo': [
    'Uy, kumusta na ang buhay?',
    'Ang init naman ngayon, pre!',
    'Mahal na ang lahat ngayon, ano?',
    'Sige na, ingat ka lagi!'
  ],
  'Aling Nena': [
    'Hoy! Ano ang balita mo?',
    'Bili ka na ng paninda ko!',
    'Fresh-fresh ang mga bilihin ko dito!',
    'Sale ngayon, ha! Huwag palampasin!'
  ],
  'Kuya Boyet': [
    'Pare, laro tayo ng basketball mamaya!',
    'Anong team mo? PBA fan ka ba?',
    'Three-pointer lang! Ako pa rin champion!',
    'Uhaw na ako, bili muna ng Coke!'
  ],
  'Ate Cora': [
    'Kumain ka na ba? Kain tayo!',
    'Sinigang na ba natin yan o adobo?',
    'Masarap ang niluto ko ngayon, tikman mo!',
    'Ingat lagi, ha? God bless!'
  ],
  'Tito Ben': [
    'Kumusta ang trabaho mo, anak?',
    'Mag-ipon ka ng pera para sa kinabukasan.',
    'Noon pa man, matrabaho na ako.',
    'Anong mga plano mo ngayong weekend?'
  ],
  'Lola Sita': [
    'Kumain ka na ba, mahal? Baka magutom ka.',
    'Simbahan tayo mamaya, ha?',
    'Ang saya-saya ko ngayon! Salamat sa Diyos.',
    'Ingat ka, ha, anak. Mahal kita!'
  ],
  'Bunso': [
    'Kuya/Ate, kain tayo! Gutom na ako!',
    'Pwede bang manood ng TV?',
    'Gusto ko mag-internet cafe!',
    'Alam mo ba ang latest na meme? Haha!'
  ],
  'Dodong': [
    'Uy, laro ka ng basketball?',
    'Kita kits sa court mamaya, bro!',
    'Grabe, ang ganda ng araw ngayon!',
    'Game na tayo, pre!'
  ],
  'Pedro': [
    'Magandang umaga! O, magandang hapon!',
    'Saan ka pupunta ngayon?',
    'Busy ka ba? Chika naman tayo.',
    'Ingat, ha!'
  ],
  'Maria Clara': [
    'Ay nako, ang ganda ng iyong damit!',
    'Saan ka nag-shopping? Gusto ko rin!',
    'Takam na takam ako sa sinigang ngayon.',
    'Let\'s go sa mall, sis!'
  ],
  'Jose': [
    'Hoy pare, anong gagawin mo today?',
    'Libre ba kayo ngayon? Kita kita?',
    'Grabe ang traffic kanina, pre!',
    'Sige, catch you later!'
  ],
  'Rizal': [
    'Isang bansa, isang diwa!',
    'Ang ganda ng ating bayan, hindi ba?',
    'Trabaho muna bago saya!',
    'Mabuhay ang Pilipino!'
  ],
  'Nanding': [
    'Kalma lang, bro. Chill lang.',
    'Anong ulam niyo ngayon?',
    'Matulog na muna ako, antok na!',
    'Walang malisya, pare!'
  ],
  'Sabel': [
    'Huy! Tagal mo nang wala! Kumusta?',
    'Bago ko ba ang singsing na ito?',
    'Diyos mio, ang init ng panahon!',
    'Samahan mo ako sa palengke!'
  ],
  'Carding': [
    'Pre, basketball tayo bukas!',
    'Wala akong pera ngayon, bale na.',
    'Gutom na ako! Kain muna tayo!',
    'Ingat ka sa kalye ha, maraming jeep!'
  ]
};

export const DAYS_OF_WEEK = [
  'Linggo', 'Lunes', 'Martes', 'Miyerkules',
  'Huwebes', 'Biyernes', 'Sabado'
];

export const MONTHS = [
  'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
  'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'
];
