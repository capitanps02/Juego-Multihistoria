export type FootballCountryCode =
  | "ESP" | "ENG" | "ITA" | "DEU" | "FRA" | "PRT" | "NLD" | "BEL"
  | "USA" | "MEX" | "ARG" | "JPN" | "CHN" | "TUR" | "NOR" | "MAR" | "ZAF";

export type FootballConfederation = "UEFA" | "CONCACAF" | "CONMEBOL" | "AFC" | "CAF";

export type ClubArchetype =
  | "continental"
  | "development"
  | "selling"
  | "historic"
  | "high_pressure"
  | "community"
  | "technical"
  | "physical";

export interface FootballDivision {
  readonly id: string;
  readonly countryCode: FootballCountryCode;
  readonly country: string;
  readonly confederation: FootballConfederation;
  readonly name: string;
  readonly tier: number;
  readonly clubCount: number;
  /** Game-design coefficient, 0..100. It is not an official federation ranking. */
  readonly strength: number;
}

export interface FootballClub {
  /** Stable internal identity. It is deliberately independent from division and display name. */
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly city: string;
  readonly countryCode: FootballCountryCode;
  readonly country: string;
  readonly confederation: FootballConfederation;
  readonly divisionId: string;
  readonly tier: number;
  readonly prestige: number;
  readonly financialPower: number;
  readonly youthQuality: number;
  readonly developmentBias: number;
  readonly pressure: number;
  readonly internationalAttraction: number;
  readonly archetypes: readonly ClubArchetype[];
  /** Working identity only. Every final commercial name still requires trademark clearance. */
  readonly clearanceStatus: "working_name_unchecked";
}
