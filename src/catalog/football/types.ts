export type EuropeanCountryCode = "ESP" | "ENG" | "ITA" | "DEU" | "FRA" | "PRT" | "NLD" | "BEL";

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
  readonly countryCode: EuropeanCountryCode;
  readonly country: string;
  readonly name: string;
  readonly tier: number;
  readonly clubCount: number;
}

export interface FootballClub {
  /** Stable internal identity. It is deliberately independent from division and display name. */
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly city: string;
  readonly countryCode: EuropeanCountryCode;
  readonly country: string;
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
