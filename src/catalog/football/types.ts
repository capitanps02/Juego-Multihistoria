export type EuropeanCountryCode = "ES" | "GB" | "IT" | "DE" | "FR" | "PT" | "NL" | "BE";

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
  id: string;
  countryCode: EuropeanCountryCode;
  country: string;
  name: string;
  tier: number;
  clubCount: number;
}

export interface FootballClub {
  id: string;
  name: string;
  shortName: string;
  city: string;
  countryCode: EuropeanCountryCode;
  country: string;
  divisionId: string;
  tier: number;
  prestige: number;
  financialPower: number;
  youthQuality: number;
  developmentBias: number;
  pressure: number;
  internationalAttraction: number;
  archetypes: ClubArchetype[];
  /** Working identity only. Every final commercial name still requires trademark clearance. */
  clearanceStatus: "working_name_unchecked";
}
