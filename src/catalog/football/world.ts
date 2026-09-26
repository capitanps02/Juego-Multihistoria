import type { ClubArchetype, FootballConfederation, FootballCountryCode, FootballClub, FootballDivision } from "./types.js";

const COUNTRY_CONFIGS = {
  "ESP": {
    "country": "España",
    "divisions": [
      [
        "Liga Superior Española",
        20
      ],
      [
        "Liga Nacional Española",
        22
      ],
      [
        "Categoría Nacional III Española",
        20
      ]
    ],
    "cities": [
      "Madrid",
      "Barcelona",
      "Valencia",
      "Sevilla",
      "Zaragoza",
      "Málaga",
      "Murcia",
      "Palma",
      "Las Palmas",
      "Bilbao",
      "Alicante",
      "Córdoba",
      "Valladolid",
      "Vigo",
      "Gijón",
      "A Coruña",
      "Granada",
      "Vitoria",
      "Elche",
      "Oviedo",
      "Cartagena",
      "Jerez",
      "Pamplona",
      "Almería",
      "San Sebastián",
      "Burgos",
      "Santander",
      "Salamanca",
      "Logroño",
      "Tarragona",
      "Lleida",
      "Girona",
      "Castellón",
      "Albacete",
      "Huelva",
      "León",
      "Cádiz",
      "Jaén",
      "Badajoz",
      "Sabadell",
      "Terrassa",
      "Ourense",
      "Pontevedra",
      "Lugo",
      "Toledo",
      "Cuenca",
      "Segovia",
      "Ávila",
      "Soria",
      "Cáceres",
      "Mérida",
      "Ceuta",
      "Melilla",
      "Huesca",
      "Ferrol",
      "Marbella",
      "Reus",
      "Eivissa",
      "Algeciras",
      "Torrelavega",
      "Ponferrada",
      "Arrecife"
    ],
    "mods": [
      "Horizonte",
      "Ribera",
      "Aurora",
      "Norte",
      "Central",
      "Litoral",
      "Cívico",
      "Bruma",
      "Estrella",
      "Vanguardia",
      "Puente",
      "Mirador"
    ],
    "confederation": "UEFA",
    "strength": 88,
    "finance": 86,
    "youth": 86,
    "development": 82,
    "pressure": 88,
    "international": 90
  },
  "ENG": {
    "country": "Inglaterra",
    "divisions": [
      [
        "Liga Superior Inglesa",
        20
      ],
      [
        "Liga Nacional Inglesa",
        24
      ],
      [
        "Liga Profesional III Inglesa",
        24
      ]
    ],
    "cities": [
      "London",
      "Manchester",
      "Liverpool",
      "Birmingham",
      "Leeds",
      "Bristol",
      "Sheffield",
      "Newcastle",
      "Nottingham",
      "Leicester",
      "Coventry",
      "Bradford",
      "Stoke",
      "Wolverhampton",
      "Plymouth",
      "Southampton",
      "Portsmouth",
      "Derby",
      "Reading",
      "Hull",
      "Sunderland",
      "York",
      "Oxford",
      "Cambridge",
      "Norwich",
      "Ipswich",
      "Middlesbrough",
      "Blackpool",
      "Preston",
      "Bolton",
      "Wigan",
      "Blackburn",
      "Burnley",
      "Lancaster",
      "Exeter",
      "Bath",
      "Gloucester",
      "Cheltenham",
      "Swindon",
      "Milton Keynes",
      "Luton",
      "Watford",
      "Peterborough",
      "Lincoln",
      "Doncaster",
      "Rotherham",
      "Barnsley",
      "Wakefield",
      "Huddersfield",
      "Halifax",
      "Chester",
      "Carlisle",
      "Durham",
      "Gateshead",
      "Maidstone",
      "Canterbury",
      "Brighton",
      "Hastings",
      "Eastbourne",
      "Bournemouth",
      "Poole",
      "Worcester",
      "Hereford",
      "Shrewsbury",
      "Telford",
      "Northampton",
      "Bedford",
      "Colchester"
    ],
    "mods": [
      "Vale",
      "Foundry",
      "Harbour",
      "Civic",
      "Northstar",
      "Riverside",
      "Borough",
      "Forge",
      "Crown",
      "Bridge",
      "Meadow",
      "Beacon"
    ],
    "confederation": "UEFA",
    "strength": 92,
    "finance": 93,
    "youth": 84,
    "development": 80,
    "pressure": 92,
    "international": 94
  },
  "ITA": {
    "country": "Italia",
    "divisions": [
      [
        "Liga Superior Italiana",
        20
      ],
      [
        "Liga Nacional Italiana",
        20
      ]
    ],
    "cities": [
      "Roma",
      "Milano",
      "Napoli",
      "Torino",
      "Palermo",
      "Genova",
      "Bologna",
      "Firenze",
      "Bari",
      "Catania",
      "Venezia",
      "Verona",
      "Messina",
      "Padova",
      "Trieste",
      "Taranto",
      "Brescia",
      "Parma",
      "Prato",
      "Modena",
      "Reggio Calabria",
      "Perugia",
      "Ravenna",
      "Livorno",
      "Cagliari",
      "Foggia",
      "Rimini",
      "Salerno",
      "Ferrara",
      "Sassari",
      "Latina",
      "Monza",
      "Siracusa",
      "Pescara",
      "Bergamo",
      "Vicenza",
      "Terni",
      "Bolzano",
      "Novara",
      "Piacenza"
    ],
    "mods": [
      "Aurora",
      "Civica",
      "Rinascita",
      "Stella",
      "Porta",
      "Fiume",
      "Colle",
      "Nuova",
      "Vela",
      "Arco",
      "Luce",
      "Ponte"
    ],
    "confederation": "UEFA",
    "strength": 86,
    "finance": 82,
    "youth": 84,
    "development": 78,
    "pressure": 88,
    "international": 89
  },
  "DEU": {
    "country": "Alemania",
    "divisions": [
      [
        "Liga Superior Alemana",
        18
      ],
      [
        "Liga Nacional Alemana",
        18
      ]
    ],
    "cities": [
      "Berlin",
      "Hamburg",
      "München",
      "Köln",
      "Frankfurt",
      "Stuttgart",
      "Düsseldorf",
      "Leipzig",
      "Dortmund",
      "Essen",
      "Bremen",
      "Dresden",
      "Hannover",
      "Nürnberg",
      "Duisburg",
      "Bochum",
      "Wuppertal",
      "Bielefeld",
      "Bonn",
      "Münster",
      "Karlsruhe",
      "Mannheim",
      "Augsburg",
      "Wiesbaden",
      "Gelsenkirchen",
      "Mönchengladbach",
      "Braunschweig",
      "Chemnitz",
      "Kiel",
      "Aachen",
      "Halle",
      "Magdeburg",
      "Freiburg",
      "Lübeck",
      "Erfurt",
      "Mainz"
    ],
    "mods": [
      "Spree",
      "Hafen",
      "Isar",
      "Werk",
      "Nord",
      "Brücke",
      "Wald",
      "Stadt",
      "Krone",
      "Tor",
      "Hain",
      "Rhein"
    ],
    "confederation": "UEFA",
    "strength": 87,
    "finance": 88,
    "youth": 86,
    "development": 85,
    "pressure": 85,
    "international": 90
  },
  "FRA": {
    "country": "Francia",
    "divisions": [
      [
        "Liga Superior Francesa",
        18
      ],
      [
        "Liga Nacional Francesa",
        18
      ]
    ],
    "cities": [
      "Paris",
      "Marseille",
      "Lyon",
      "Toulouse",
      "Nice",
      "Nantes",
      "Montpellier",
      "Strasbourg",
      "Bordeaux",
      "Lille",
      "Rennes",
      "Reims",
      "Le Havre",
      "Saint-Étienne",
      "Toulon",
      "Grenoble",
      "Dijon",
      "Angers",
      "Nîmes",
      "Villeurbanne",
      "Clermont-Ferrand",
      "Le Mans",
      "Aix-en-Provence",
      "Brest",
      "Tours",
      "Amiens",
      "Limoges",
      "Annecy",
      "Perpignan",
      "Metz",
      "Besançon",
      "Orléans",
      "Rouen",
      "Mulhouse",
      "Caen",
      "Nancy"
    ],
    "mods": [
      "Rive",
      "Étoile",
      "Civique",
      "Rivage",
      "Horizon",
      "Pont",
      "Aurore",
      "Mont",
      "Vallon",
      "Azur",
      "Couronne",
      "Prairie"
    ],
    "confederation": "UEFA",
    "strength": 83,
    "finance": 82,
    "youth": 88,
    "development": 88,
    "pressure": 80,
    "international": 87
  },
  "PRT": {
    "country": "Portugal",
    "divisions": [
      [
        "Liga Superior Portuguesa",
        18
      ],
      [
        "Liga Nacional Portuguesa",
        18
      ]
    ],
    "cities": [
      "Lisboa",
      "Porto",
      "Braga",
      "Coimbra",
      "Funchal",
      "Setúbal",
      "Aveiro",
      "Évora",
      "Faro",
      "Leiria",
      "Viseu",
      "Guimarães",
      "Vila Real",
      "Bragança",
      "Castelo Branco",
      "Santarém",
      "Beja",
      "Viana do Castelo",
      "Portimão",
      "Lagos",
      "Cascais",
      "Sintra",
      "Matosinhos",
      "Gondomar",
      "Maia",
      "Chaves",
      "Covilhã",
      "Tomar",
      "Peniche",
      "Barreiro",
      "Almada",
      "Amadora",
      "Loures",
      "Oeiras",
      "Póvoa de Varzim",
      "Espinho"
    ],
    "mods": [
      "Tejo",
      "Douro",
      "Atlântico",
      "Luz",
      "Ribeira",
      "Horizonte",
      "Cívico",
      "Navegante",
      "Serra",
      "Ponte",
      "Maré",
      "Aurora"
    ],
    "confederation": "UEFA",
    "strength": 76,
    "finance": 68,
    "youth": 88,
    "development": 90,
    "pressure": 72,
    "international": 82
  },
  "NLD": {
    "country": "Países Bajos",
    "divisions": [
      [
        "Liga Superior Neerlandesa",
        18
      ],
      [
        "Liga Nacional Neerlandesa",
        20
      ]
    ],
    "cities": [
      "Amsterdam",
      "Rotterdam",
      "Den Haag",
      "Utrecht",
      "Eindhoven",
      "Tilburg",
      "Groningen",
      "Almere",
      "Breda",
      "Nijmegen",
      "Apeldoorn",
      "Haarlem",
      "Arnhem",
      "Enschede",
      "Amersfoort",
      "Zaanstad",
      "Den Bosch",
      "Zwolle",
      "Leiden",
      "Maastricht",
      "Dordrecht",
      "Ede",
      "Leeuwarden",
      "Alkmaar",
      "Emmen",
      "Delft",
      "Deventer",
      "Venlo",
      "Helmond",
      "Hilversum",
      "Roosendaal",
      "Oss",
      "Sittard",
      "Gouda",
      "Hoorn",
      "Vlaardingen",
      "Alphen aan den Rijn",
      "Middelburg"
    ],
    "mods": [
      "Amstel",
      "Maas",
      "Haven",
      "Noord",
      "Brug",
      "Polder",
      "Stad",
      "Wind",
      "Rijn",
      "Molen",
      "Delta",
      "Dijk"
    ],
    "confederation": "UEFA",
    "strength": 77,
    "finance": 70,
    "youth": 90,
    "development": 92,
    "pressure": 70,
    "international": 83
  },
  "BEL": {
    "country": "Bélgica",
    "divisions": [
      [
        "Liga Superior Belga",
        16
      ],
      [
        "Liga Nacional Belga",
        16
      ]
    ],
    "cities": [
      "Bruxelles",
      "Antwerpen",
      "Gent",
      "Charleroi",
      "Liège",
      "Brugge",
      "Namur",
      "Leuven",
      "Mons",
      "Aalst",
      "Mechelen",
      "Kortrijk",
      "Hasselt",
      "Oostende",
      "Sint-Niklaas",
      "Tournai",
      "Genk",
      "Roeselare",
      "Verviers",
      "Mouscron",
      "Beveren",
      "Dendermonde",
      "Turnhout",
      "Geel",
      "Lier",
      "Vilvoorde",
      "Waregem",
      "Seraing",
      "Eupen",
      "Arlon",
      "Dinant",
      "Lokeren"
    ],
    "mods": [
      "Senne",
      "Schelde",
      "Civique",
      "Canal",
      "Couronne",
      "Noord",
      "Pont",
      "Étoile",
      "Vallée",
      "Rive",
      "Brug",
      "Horizon"
    ],
    "confederation": "UEFA",
    "strength": 70,
    "finance": 62,
    "youth": 84,
    "development": 88,
    "pressure": 64,
    "international": 74
  },
  "USA": {
    "country": "Estados Unidos",
    "confederation": "CONCACAF",
    "strength": 68,
    "finance": 82,
    "youth": 72,
    "development": 74,
    "pressure": 68,
    "international": 78,
    "divisions": [
      [
        "Liga Superior Estadounidense",
        30
      ]
    ],
    "cities": [
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
      "Philadelphia",
      "San Antonio",
      "San Diego",
      "Dallas",
      "Austin",
      "Jacksonville",
      "Fort Worth",
      "Columbus",
      "Indianapolis",
      "Charlotte",
      "Seattle",
      "Denver",
      "Washington",
      "Boston",
      "Nashville",
      "Detroit",
      "Portland",
      "Las Vegas",
      "Louisville",
      "Baltimore",
      "Milwaukee",
      "Albuquerque",
      "Tucson",
      "Sacramento",
      "Kansas City"
    ],
    "mods": [
      "Frontier",
      "Harbor",
      "Summit",
      "Pulse",
      "Redwood",
      "Lakes",
      "Prairie",
      "Atlantic",
      "Pacific",
      "Capitol",
      "Canyon",
      "Horizon"
    ]
  },
  "MEX": {
    "country": "México",
    "confederation": "CONCACAF",
    "strength": 66,
    "finance": 65,
    "youth": 76,
    "development": 74,
    "pressure": 78,
    "international": 68,
    "divisions": [
      [
        "Liga Superior Mexicana",
        18
      ]
    ],
    "cities": [
      "Ciudad de México",
      "Guadalajara",
      "Monterrey",
      "Puebla",
      "Tijuana",
      "León",
      "Ciudad Juárez",
      "Torreón",
      "Querétaro",
      "San Luis Potosí",
      "Aguascalientes",
      "Toluca",
      "Pachuca",
      "Morelia",
      "Mazatlán",
      "Veracruz",
      "Mérida",
      "Cancún"
    ],
    "mods": [
      "Valle",
      "Sol",
      "Sierra",
      "Horizonte",
      "Cobalto",
      "Nopal",
      "Mirador",
      "Pacífico",
      "Central",
      "Estrella",
      "Cumbre",
      "Laguna"
    ]
  },
  "ARG": {
    "country": "Argentina",
    "confederation": "CONMEBOL",
    "strength": 75,
    "finance": 58,
    "youth": 92,
    "development": 88,
    "pressure": 90,
    "international": 82,
    "divisions": [
      [
        "Liga Superior Argentina",
        30
      ]
    ],
    "cities": [
      "Buenos Aires",
      "Córdoba",
      "Rosario",
      "La Plata",
      "Mar del Plata",
      "San Miguel de Tucumán",
      "Salta",
      "Santa Fe",
      "Mendoza",
      "San Juan",
      "Resistencia",
      "Santiago del Estero",
      "Corrientes",
      "Posadas",
      "Paraná",
      "Neuquén",
      "Bahía Blanca",
      "Formosa",
      "San Salvador de Jujuy",
      "Río Cuarto",
      "Comodoro Rivadavia",
      "Ushuaia",
      "Trelew",
      "Rafaela",
      "Tandil",
      "San Luis",
      "Reconquista",
      "Pergamino",
      "Junín",
      "Avellaneda"
    ],
    "mods": [
      "Plata",
      "Federal",
      "Austral",
      "Pampero",
      "Sur",
      "Ribera",
      "Horizonte",
      "Cóndor",
      "Central",
      "Puerto",
      "Sierra",
      "Estrella"
    ]
  },
  "JPN": {
    "country": "Japón",
    "confederation": "AFC",
    "strength": 69,
    "finance": 74,
    "youth": 82,
    "development": 86,
    "pressure": 66,
    "international": 72,
    "divisions": [
      [
        "Liga Superior Japonesa",
        20
      ]
    ],
    "cities": [
      "Tokyo",
      "Yokohama",
      "Osaka",
      "Nagoya",
      "Sapporo",
      "Fukuoka",
      "Kobe",
      "Kyoto",
      "Kawasaki",
      "Saitama",
      "Hiroshima",
      "Sendai",
      "Chiba",
      "Niigata",
      "Shizuoka",
      "Okayama",
      "Kumamoto",
      "Kagoshima",
      "Nagasaki",
      "Kanazawa"
    ],
    "mods": [
      "Sakura",
      "Mirai",
      "Seaside",
      "Kaze",
      "Hikari",
      "Summit",
      "River",
      "Harbor",
      "Forest",
      "Sunrise",
      "North",
      "Central"
    ]
  },
  "CHN": {
    "country": "China",
    "confederation": "AFC",
    "strength": 60,
    "finance": 72,
    "youth": 66,
    "development": 64,
    "pressure": 70,
    "international": 64,
    "divisions": [
      [
        "Liga Superior China",
        16
      ]
    ],
    "cities": [
      "Beijing",
      "Shanghai",
      "Guangzhou",
      "Shenzhen",
      "Chengdu",
      "Chongqing",
      "Tianjin",
      "Wuhan",
      "Xi'an",
      "Nanjing",
      "Hangzhou",
      "Qingdao",
      "Dalian",
      "Jinan",
      "Changsha",
      "Zhengzhou"
    ],
    "mods": [
      "Jade",
      "River",
      "Harbor",
      "Skyline",
      "Horizon",
      "Mountain",
      "Lotus",
      "Central",
      "Northern",
      "Southern",
      "Golden",
      "Metro"
    ]
  },
  "TUR": {
    "country": "Turquía",
    "confederation": "UEFA",
    "strength": 73,
    "finance": 71,
    "youth": 76,
    "development": 72,
    "pressure": 88,
    "international": 79,
    "divisions": [
      [
        "Liga Superior Turca",
        18
      ]
    ],
    "cities": [
      "Istanbul",
      "Ankara",
      "Izmir",
      "Bursa",
      "Antalya",
      "Adana",
      "Gaziantep",
      "Konya",
      "Kayseri",
      "Mersin",
      "Diyarbakır",
      "Samsun",
      "Denizli",
      "Eskişehir",
      "Trabzon",
      "Erzurum",
      "Sakarya",
      "Rize"
    ],
    "mods": [
      "Anatolia",
      "Marmara",
      "Aegean",
      "Crescent",
      "Horizon",
      "Bridge",
      "Anka",
      "Bosphorus",
      "Toros",
      "Blacksea",
      "Capital",
      "Coast"
    ]
  },
  "NOR": {
    "country": "Noruega",
    "confederation": "UEFA",
    "strength": 61,
    "finance": 58,
    "youth": 80,
    "development": 85,
    "pressure": 55,
    "international": 67,
    "divisions": [
      [
        "Liga Superior Noruega",
        16
      ]
    ],
    "cities": [
      "Oslo",
      "Bergen",
      "Trondheim",
      "Stavanger",
      "Drammen",
      "Fredrikstad",
      "Kristiansand",
      "Sandnes",
      "Tromsø",
      "Sarpsborg",
      "Skien",
      "Ålesund",
      "Sandefjord",
      "Haugesund",
      "Molde",
      "Bodø"
    ],
    "mods": [
      "Fjord",
      "Nord",
      "Aurora",
      "Fjell",
      "Havn",
      "Vik",
      "Skog",
      "Polar",
      "Brygge",
      "Dal",
      "Kyst",
      "Stjerne"
    ]
  },
  "MAR": {
    "country": "Marruecos",
    "confederation": "CAF",
    "strength": 58,
    "finance": 49,
    "youth": 76,
    "development": 82,
    "pressure": 64,
    "international": 63,
    "divisions": [
      [
        "Liga Superior Marroquí",
        16
      ]
    ],
    "cities": [
      "Casablanca",
      "Rabat",
      "Fès",
      "Marrakech",
      "Tanger",
      "Agadir",
      "Meknès",
      "Oujda",
      "Kénitra",
      "Tétouan",
      "Safi",
      "El Jadida",
      "Béni Mellal",
      "Nador",
      "Khouribga",
      "Laâyoune"
    ],
    "mods": [
      "Atlas",
      "Medina",
      "Rif",
      "Oasis",
      "Kasbah",
      "Cedar",
      "Dune",
      "Sahara",
      "Azure",
      "Palm",
      "Coast",
      "Horizon"
    ]
  },
  "ZAF": {
    "country": "Sudáfrica",
    "confederation": "CAF",
    "strength": 55,
    "finance": 50,
    "youth": 70,
    "development": 76,
    "pressure": 62,
    "international": 58,
    "divisions": [
      [
        "Liga Superior Sudafricana",
        16
      ]
    ],
    "cities": [
      "Johannesburg",
      "Cape Town",
      "Durban",
      "Pretoria",
      "Gqeberha",
      "Bloemfontein",
      "Polokwane",
      "Mbombela",
      "Kimberley",
      "East London",
      "Rustenburg",
      "Pietermaritzburg",
      "Stellenbosch",
      "Soweto",
      "Richards Bay",
      "George"
    ],
    "mods": [
      "Highveld",
      "Cape",
      "Coast",
      "Savanna",
      "Frontier",
      "Bay",
      "Gold",
      "Valley",
      "Harbour",
      "Summit",
      "Plains",
      "Southern"
    ]
  }
} as const;

const MAX_SHORT_NAME_LENGTH = 22;
const TIER_STRENGTH_PENALTY = [0, 0, 14, 25] as const;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function asciiToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function clubId(countryCode: FootballCountryCode, city: string): string {
  return `${countryCode}_${asciiToken(city)}`;
}

function variation(id: string, channel: string, radius = 7): number {
  return (hashString(`${id}|${channel}`) % (radius * 2 + 1)) - radius;
}

function tierAdjusted(value: number, tier: number): number {
  return clamp(value - (TIER_STRENGTH_PENALTY[tier] ?? 30));
}

function shortName(city: string, modifier: string): string {
  const full = `${city} ${modifier}`;
  if (full.length <= MAX_SHORT_NAME_LENGTH) return full;
  const modifierLength = Math.min(5, modifier.length);
  const cityLength = Math.max(4, MAX_SHORT_NAME_LENGTH - modifierLength - 1);
  return `${city.slice(0, cityLength).trim()} ${modifier.slice(0, modifierLength)}`.slice(0, MAX_SHORT_NAME_LENGTH).trim();
}

function archetypesFor(tier: number, prestige: number, seed: number): readonly ClubArchetype[] {
  const pool: ClubArchetype[] = ["development","selling","historic","high_pressure","community","technical","physical"];
  const first: ClubArchetype = prestige >= 84 && tier === 1 ? "continental" : pool[seed % pool.length]!;
  const second = pool[(seed + 3) % pool.length]!;
  return Object.freeze(first === second ? [first] : [first, second]);
}

const divisions: FootballDivision[] = [];
const clubs: FootballClub[] = [];
const seenClubIds = new Set<string>();

for (const [rawCode, config] of Object.entries(COUNTRY_CONFIGS)) {
  const countryCode = rawCode as FootballCountryCode;
  const confederation = config.confederation as FootballConfederation;
  const expected = config.divisions.reduce((sum, division) => sum + division[1], 0);
  if (config.cities.length !== expected) {
    throw new Error(`Football catalog ${countryCode}: expected ${expected} cities, got ${config.cities.length}.`);
  }

  let cityOffset = 0;
  config.divisions.forEach(([name, clubCount], divisionIndex) => {
    const tier = divisionIndex + 1;
    const divisionId = `${countryCode}_D${tier}`;
    const divisionStrength = tierAdjusted(config.strength, tier);
    divisions.push(Object.freeze({
      id: divisionId,
      countryCode,
      country: config.country,
      confederation,
      name,
      tier,
      clubCount,
      strength: divisionStrength
    }));

    for (let index = 0; index < clubCount; index += 1) {
      const city = config.cities[cityOffset + index]!;
      const id = clubId(countryCode, city);
      if (seenClubIds.has(id)) {
        throw new Error(`Football catalog duplicate stable club id: ${id}. Add an explicit club identity before allowing multiple clubs in one city.`);
      }
      seenClubIds.add(id);

      const identitySeed = hashString(`${countryCode}|${city}|identity`);
      const modifier = config.mods[identitySeed % config.mods.length]!;
      const nameValue = `${city} ${modifier}`;
      const prestige = clamp(divisionStrength + variation(id, "prestige"));
      clubs.push(Object.freeze({
        id,
        name: nameValue,
        shortName: shortName(city, modifier),
        city,
        countryCode,
        country: config.country,
        confederation,
        divisionId,
        tier,
        prestige,
        financialPower: clamp(tierAdjusted(config.finance, tier) + variation(id, "finance")),
        youthQuality: clamp(tierAdjusted(config.youth, tier) + variation(id, "youth")),
        developmentBias: clamp(tierAdjusted(config.development, tier) + variation(id, "development")),
        pressure: clamp(tierAdjusted(config.pressure, tier) + variation(id, "pressure")),
        internationalAttraction: clamp(tierAdjusted(config.international, tier) + variation(id, "international")),
        archetypes: archetypesFor(tier, prestige, identitySeed),
        clearanceStatus: "working_name_unchecked"
      }));
    }
    cityOffset += clubCount;
  });
}

export const FOOTBALL_DIVISIONS: readonly FootballDivision[] = Object.freeze(divisions);
export const FOOTBALL_CLUBS: readonly FootballClub[] = Object.freeze(clubs);
export const FOOTBALL_CATALOG_VERSION = "world-v1-2026-09-26";
