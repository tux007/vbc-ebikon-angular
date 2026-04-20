export interface GameResult {
  teamName: string;
  playDateTime: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  league: string;
  city: string;
  setResults: SetResult[];
  wonSetsHome: number;
  wonSetsAway: number;
}

export interface SetResult {
  home: number;
  away: number;
}

export interface UpcomingGame {
  teamName: string;
  playDateTime: string;
  playDate: Date;
  homeTeam: string;
  awayTeam: string;
  league: string;
  city: string;
  hall: string;
}

export interface RankingEntry {
  rank: number;
  teamCaption: string;
  games: number;
  wins: number;
  defeats: number;
  points: number;
}

export interface TeamConfig {
  teamId: number;
  gender: 'f' | 'm';
  name: string;
  groupId: string;
  slug: string;
}

// Sanity types
export interface SanityImage {
  asset: {
    _ref: string;
    url?: string;
  };
}

export interface BoardMember {
  _id: string;
  name: string;
  role: string;
  order?: number;
  email?: string;
  photo?: SanityImage & { url: string };
}

export interface Sponsor {
  _id: string;
  name: string;
  url?: string;
  order: number;
  active: boolean;
  logo?: SanityImage & { url: string };
}

export interface Team {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  gender?: 'f' | 'm';
  level?: string;
  photo?: SanityImage & { url: string };
  trainingTimes?: { _key?: string; day?: string; time?: string; location?: string }[];
  players?: string[];
  coaches?: string[];
  rankingLink?: string;
  groupId?: string;
}

export type AnnualProgramCategory =
  | 'Vereinsanlass'
  | 'Spezialtraining'
  | 'Spieltag'
  | 'Trainingsweekend'
  | 'Volleyballlager';

export interface AnnualProgramEvent {
  _key: string;
  startDate: string;
  endDate?: string;
  description: string;
  category: AnnualProgramCategory;
}

export interface AnnualProgramPage {
  _id: string;
  title: string;
  slug: string;
  body?: PortableTextBlock[];
  programYear?: number;
  annualProgramEvents?: AnnualProgramEvent[];
}

export interface StaticPage {
  _id: string;
  title: string;
  slug: string;
  body?: PortableTextBlock[];
  documents?: PageDocument[];
}

export interface PortableTextBlock {
  _type: string;
  children?: { text: string }[];
  style?: string;
}

export interface PageDocument {
  _key: string;
  title: string;
  file: { asset: { url: string } };
}
