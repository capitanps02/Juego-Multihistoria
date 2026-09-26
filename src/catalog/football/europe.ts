import type { ClubArchetype, EuropeanCountryCode, FootballClub, FootballDivision } from "./types.js";

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
        "Liga Profesional III Española",
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
} as const;

const MAX_SHORT_NAME_LENGTH = 22;

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

function clubId(countryCode: EuropeanCountryCode, city: string): string {
  return `${countryCode}_${asciiToken(city)}`;
}

function score(id: string, tier: number, channel: string): number {
  const roll = hashString(`${id}|${tier}|${channel}`) % 21;
  const base = tier === 1 ? 72 : tier === 2 ? 50 : 34;
  const spread = tier === 1 ? 18 : tier === 2 ? 20 : 18;
  return clamp(base + Math.round((roll / 20) * spread));
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
  const countryCode = rawCode as EuropeanCountryCode;
  const expected = config.divisions.reduce((sum, division) => sum + division[1], 0);
  if (config.cities.length !== expected) {
    throw new Error(`Football catalog ${countryCode}: expected ${expected} cities, got ${config.cities.length}.`);
  }

  let cityOffset = 0;
  config.divisions.forEach(([name, clubCount], divisionIndex) => {
    const tier = divisionIndex + 1;
    const divisionId = `${countryCode}_D${tier}`;
    divisions.push(Object.freeze({ id: divisionId, countryCode, country: config.country, name, tier, clubCount }));

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
      const prestige = score(id, tier, "prestige");
      clubs.push(Object.freeze({
        id,
        name: nameValue,
        shortName: shortName(city, modifier),
        city,
        countryCode,
        country: config.country,
        divisionId,
        tier,
        prestige,
        financialPower: score(id, tier, "finance"),
        youthQuality: score(id, tier, "youth"),
        developmentBias: score(id, tier, "development"),
        pressure: score(id, tier, "pressure"),
        internationalAttraction: clamp(prestige + (tier === 1 ? 4 : -8) + (identitySeed % 9) - 4),
        archetypes: archetypesFor(tier, prestige, identitySeed),
        clearanceStatus: "working_name_unchecked"
      }));
    }
    cityOffset += clubCount;
  });
}

export const EUROPEAN_DIVISIONS: readonly FootballDivision[] = Object.freeze(divisions);
export const EUROPEAN_CLUBS: readonly FootballClub[] = Object.freeze(clubs);
export const EUROPEAN_FOOTBALL_CATALOG_VERSION = "europe-v1-2026-09-26";
