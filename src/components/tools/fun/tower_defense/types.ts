export type TowerEffect = 'slow' | 'aoe' | 'gold' | 'buff' | 'radar';

export interface TowerConfig {
  name: string;
  cost: number;
  range: number;
  baseDamage: number;
  baseRate: number;
  color: string;
  projectileSpeed?: number;
  emoji: string;
  desc: string;
  effect?: TowerEffect;
}

export interface TowerInstance {
  r: number;
  c: number;
  x: number;
  y: number;
  type: TowerConfig;
  level: number;
  totalCost: number;
  cooldown: number;
  damageBuff?: number;
  rangeBuff?: number;
}

export interface Enemy {
  x: number;
  y: number;
  waypointIndex: number;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  type: string;
  emoji: string;
  reward: number;
  frozen: number;
  slowed: number;
  revealed: boolean;
}

export interface SupplyBox {
  x: number;
  y: number;
  type: 'gold' | 'mana';
  life: number;
}

export interface LevelConfig {
  waves: number;
  hpScale: number;
}
