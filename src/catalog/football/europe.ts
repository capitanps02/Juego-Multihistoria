import type { ClubArchetype, EuropeanCountryCode, FootballClub, FootballDivision } from "./types.js";

const COUNTRY_CONFIGS = {
  "ES": {
    "country": "España",
    "divisions": [
      [
        "Primera Nacional Española",
        20
      ],
      [
        "Segunda Nacional Española",
        22
      ],
      [
        "Liga Federal Española",
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
    ]
  },
  "GB": {
    "country": "Inglaterra",
    "divisions": [
      [
        "Liga Mayor Inglesa",
        20
      ],
      [
        "Campeonato Nacional Inglés",
        24
      ],
      [
        "Liga Uno Inglesa",
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
    ]
  },
  "IT": {
    "country": "Italia",
    "divisions": [
      [
        "Lega Nazionale",
        20
      ],
      [
        "Lega Due",
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
    ]
  },
  "DE": {
    "country": "Alemania",
    "divisions": [
      [
        "Liga Mayor Alemana",
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
    ]
  },
  "FR": {
    "country": "Francia",
    "divisions": [
      [
        "Liga Mayor Francesa",
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
    ]
  },
  "PT": {
    "country": "Portugal",
    "divisions": [
      [
        "Liga Maior Portuguesa",
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
    ]
  },
  "NL": {
    "country": "Países Bajos",
    "divisions": [
      [
        "Liga Mayor Neerlandesa",
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
    ]
  },
  "BE": {
    "country": "Bélgica",
    "divisions": [
      [
        "Liga Mayor Belga",
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
    ]
  }
} as const;

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

function score(code: string, tier: number, index: number, channel: string): number {
  const roll = hashString(`${code}|${tier}|${index}|${channel}`) % 21;
  const base = tier === 1 ? 72 : tier === 2 ? 50 : 34;
  const spread = tier === 1 ? 18 : tier === 2 ? 20 : 18;
  return clamp(base + Math.round((roll / 20) * spread));
}

function archetypesFor(tier: number, prestige: number, seed: number): ClubArchetype[] {
  const pool: ClubArchetype[] = ["development","selling","historic","high_pressure","community","technical","physical"];
  const first = prestige >= 84 && tier === 1 ? "continental" : pool[seed % pool.length]!;
  const second = pool[(seed + 3) % pool.length]!;
  return first === second ? [first] : [first, second];
}

export const EUROPEAN_DIVISIONS: FootballDivision[] = [];
export const EUROPEAN_CLUBS: FootballClub[] = [];

for (const [rawCode, config] of Object.entries(COUNTRY_CONFIGS)) {
  const countryCode = rawCode as EuropeanCountryCode;
  const expected = config.divisions.reduce((sum, division) => sum + division[1], 0);
  if (config.cities.length !== expected) {
    throw new Error(`Football catalog ${countryCode}: expected ${expected} cities, got ${config.cities.length}.`);
  }

  let cityOffset = 0;
  config.divisions.forEach(([name, clubCount], divisionIndex) => {
    const tier = divisionIndex + 1;
    const divisionId = `${countryCode}_D${tier}`;
    EUROPEAN_DIVISIONS.push({ id: divisionId, countryCode, country: config.country, name, tier, clubCount });

    for (let index = 0; index < clubCount; index += 1) {
      const city = config.cities[cityOffset + index]!;
      const modifier = config.mods[(index + divisionIndex * 5) % config.mods.length]!;
      const clubName = `${city} ${modifier}`;
      const prestige = score(countryCode, tier, index, "prestige");
      const seed = hashString(`${divisionId}|${city}|${modifier}`);
      EUROPEAN_CLUBS.push({
        id: `${countryCode}_D${tier}_${String(index + 1).padStart(2, "0")}`,
        name: clubName,
        shortName: clubName.length <= 22 ? clubName : `${city} ${modifier.slice(0, 4)}`,
        city,
        countryCode,
        country: config.country,
        divisionId,
        tier,
        prestige,
        financialPower: score(countryCode, tier, index, "finance"),
        youthQuality: score(countryCode, tier, index, "youth"),
        developmentBias: score(countryCode, tier, index, "development"),
        pressure: score(countryCode, tier, index, "pressure"),
        internationalAttraction: clamp(prestige + (tier === 1 ? 4 : -8) + (seed % 9) - 4),
        archetypes: archetypesFor(tier, prestige, seed),
        clearanceStatus: "working_name_unchecked"
      });
    }
    cityOffset += clubCount;
  });
}

export const EUROPEAN_FOOTBALL_CATALOG_VERSION = "europe-v1-2026-09-26";
