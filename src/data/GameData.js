// Static game data for Bagong Lupa

export const BUILDINGS = [
  {
    id: 'HOME',
    name: 'Bahay Ko',
    nameEn: 'My Home',
    buildingType: 'residential',
    activities: ['SLEEP', 'COOK', 'SHOWER', 'WATCH_TV', 'READ'],
    x: -80, z: -80,
    width: 12, depth: 10,
    height: 8,
    interactionRadius: 12,
    color: 0xE8D5B7,
    roofColor: 0xC0392B
  },
  {
    id: 'PALENGKE',
    name: 'Palengke',
    nameEn: 'Wet Market',
    buildingType: 'market',
    activities: ['BUY_GROCERIES', 'BUY_SNACKS'],
    x: 60, z: -70,
    width: 20, depth: 15,
    height: 7,
    interactionRadius: 14,
    color: 0xF39C12,
    roofColor: 0xE74C3C
  },
  {
    id: 'SARI_SARI',
    name: 'Tindahan ni Aling Nena',
    nameEn: 'Sari-Sari Store',
    buildingType: 'store',
    activities: ['BUY_DRINKS', 'BUY_SNACKS', 'CHISMIS'],
    x: 80, z: -50,
    width: 10, depth: 8,
    height: 6,
    interactionRadius: 10,
    color: 0x27AE60,
    roofColor: 0x1E8449
  },
  {
    id: 'FASTFOOD',
    name: "Manang's Fastfood",
    nameEn: 'Fastfood Restaurant',
    buildingType: 'restaurant',
    activities: ['EAT_BURGER', 'EAT_CHICKENJOY', 'EAT_SPAGHETTI'],
    x: 70, z: -30,
    width: 14, depth: 12,
    height: 8,
    interactionRadius: 12,
    color: 0xE74C3C,
    roofColor: 0xC0392B
  },
  {
    id: 'RESTAURANT',
    name: 'Kainang Pinoy',
    nameEn: 'Filipino Restaurant',
    buildingType: 'restaurant',
    activities: ['EAT_ADOBO', 'EAT_SINIGANG', 'EAT_LECHON'],
    x: 85, z: -10,
    width: 16, depth: 14,
    height: 9,
    interactionRadius: 13,
    color: 0x8E44AD,
    roofColor: 0x6C3483
  },
  {
    id: 'MALL',
    name: 'Bagong SM',
    nameEn: 'New Mall',
    buildingType: 'mall',
    activities: ['SHOP', 'EAT_FOOD_COURT', 'AIRCON_BREAK'],
    x: 60, z: 20,
    width: 30, depth: 25,
    height: 18,
    interactionRadius: 20,
    color: 0x2980B9,
    roofColor: 0x1A5276
  },
  {
    id: 'CHURCH',
    name: 'Simbahan',
    nameEn: 'Church',
    buildingType: 'church',
    activities: ['ATTEND_MASS', 'PRAY', 'LIGHT_CANDLE'],
    x: 0, z: -30,
    width: 18, depth: 22,
    height: 16,
    interactionRadius: 15,
    color: 0xECF0F1,
    roofColor: 0xBDC3C7
  },
  {
    id: 'OFFICE',
    name: 'Opisina',
    nameEn: 'Office Building',
    buildingType: 'office',
    activities: ['WORK', 'REPORT_TO_BOSS'],
    x: 70, z: 60,
    width: 20, depth: 18,
    height: 20,
    interactionRadius: 15,
    color: 0x7F8C8D,
    roofColor: 0x5D6D7E
  },
  {
    id: 'KTV',
    name: 'Videoke Bar',
    nameEn: 'KTV Bar',
    buildingType: 'entertainment',
    activities: ['SING', 'DRINK', 'SOCIALIZE'],
    x: -60, z: 60,
    width: 14, depth: 12,
    height: 8,
    interactionRadius: 12,
    color: 0x9B59B6,
    roofColor: 0x7D3C98
  },
  {
    id: 'GYM',
    name: 'Palakasan Gym',
    nameEn: 'Gym',
    buildingType: 'gym',
    activities: ['EXERCISE', 'TRAIN'],
    x: -80, z: 40,
    width: 18, depth: 15,
    height: 10,
    interactionRadius: 14,
    color: 0xE67E22,
    roofColor: 0xCA6F1E
  },
  {
    id: 'INTERNET_CAFE',
    name: 'Internet Cafe',
    nameEn: 'Internet Cafe',
    buildingType: 'entertainment',
    activities: ['PLAY_GAMES', 'BROWSE_INTERNET'],
    x: -70, z: 20,
    width: 12, depth: 10,
    height: 7,
    interactionRadius: 11,
    color: 0x16A085,
    roofColor: 0x0E6655
  },
  {
    id: 'BASKETBALL_COURT',
    name: 'Palaruan',
    nameEn: 'Basketball Court',
    buildingType: 'outdoor',
    activities: ['PLAY_BASKETBALL', 'WATCH_GAME'],
    x: -40, z: 70,
    width: 25, depth: 15,
    height: 1,
    interactionRadius: 18,
    color: 0xF1C40F,
    roofColor: 0xD4AC0D
  },
  {
    id: 'BEACH',
    name: 'Dagat-dagatan',
    nameEn: 'Beachfront',
    buildingType: 'outdoor',
    activities: ['SWIM', 'RELAX_SAND', 'TAKE_PHOTOS'],
    x: 0, z: 100,
    width: 40, depth: 20,
    height: 1,
    interactionRadius: 25,
    color: 0x1ABC9C,
    roofColor: 0x17A589
  },
  {
    id: 'HILOT_SPA',
    name: 'Hilot Spa',
    nameEn: 'Traditional Massage',
    buildingType: 'spa',
    activities: ['GET_HILOT', 'REST'],
    x: -50, z: -60,
    width: 12, depth: 10,
    height: 7,
    interactionRadius: 11,
    color: 0xF8C471,
    roofColor: 0xF0A500
  }
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
  SWIM: {
    name: 'Lumangoy',
    nameEn: 'Swim in the Ocean',
    duration: 1.5,
    needsEffect: { kasiyahan: 45, lakas: -15, kalinisan: 10 },
    cost: 0,
    earnings: 0,
    emoji: '🏊',
    description: 'Enjoy the crystal blue ocean'
  },
  RELAX_SAND: {
    name: 'Magpahinga sa Buhangin',
    nameEn: 'Relax on the Beach',
    duration: 2,
    needsEffect: { kasiyahan: 40, lakas: 20, lipunan: 15 },
    cost: 0,
    earnings: 0,
    emoji: '🏖️',
    description: 'Feel the warm tropical sand'
  },
  TAKE_PHOTOS: {
    name: 'Mag-selfie',
    nameEn: 'Take Beach Photos',
    duration: 0.5,
    needsEffect: { kasiyahan: 25, lipunan: 10 },
    cost: 0,
    earnings: 0,
    emoji: '📸',
    description: 'Capture beautiful memories'
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
