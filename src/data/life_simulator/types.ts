export interface Career {
  id: string;
  name: string;
  salary: number;
  req: {
    smarts?: number;
    looks?: number;
    health?: number;
    happiness?: number;
    fame?: number;
    wealth?: number;
  };
}

export interface Talent {
  id: string;
  name: string;
  desc: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  effect: {
    looks?: number;
    smarts?: number;
    health?: number;
    happiness?: number;
    wealth?: number;
    luck?: number;
  };
  gift?: string;
}

export interface EducationLevel {
  id: string;
  name: string;
  age: number;
  maxAge: number;
  free?: boolean;
  cost?: number;
  req?: {
    smarts?: number;
  };
}

export interface House {
  id: string;
  name: string;
  type: 'rent' | 'buy';
  price: number;
  rent: number;
  desc: string;
  image: string;
}

export interface Vehicle {
  id: string;
  name: string;
  price: number;
  desc: string;
  image: string;
}

export interface Bank {
  depositRates: {
    current: number;
    fixed1: number;
    fixed3: number;
  };
  loanRate: number;
}

export interface AgeEvent {
  text: string;
  effect?: {
    health?: number;
    smarts?: number;
    happiness?: number;
    wealth?: number;
    fame?: number;
    looks?: number;
    karma?: number;
    stress?: number;
    luck?: number;
    death?: boolean;
  };
  minAge?: number;
  maxAge?: number;

  choices?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  log?: string;
}

export interface LifeData {
  careers: Career[];
  talents: Talent[];
  education: {
    levels: EducationLevel[];
  };
  housing: House[];
  vehicles: Vehicle[];
  bank: Bank;
  ageEvents: Record<number, AgeEvent[]>;
  deathEvents: Record<string, AgeEvent[]>;
  periods: Record<string, AgeEvent[]>;
}

export interface GameState {
  age: number;
  health: number;
  happiness: number;
  smarts: number;
  looks: number;
  wealth: number;
  fame: number;
  isAlive: boolean;

  log: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  job: Career | null;
  savings: number;
  houses: House[];
  cars: Vehicle[];
  degree: string;
  hasWorked?: boolean;
  hasStudied?: boolean;
  lifespan?: number;
  stress?: number;

  inventory: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}
