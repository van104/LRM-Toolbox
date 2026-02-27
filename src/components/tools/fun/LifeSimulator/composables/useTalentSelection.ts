import { ref, nextTick } from 'vue';
import type { Talent, GameState } from '@/data/life_simulator/types';

export function useTalentSelection(gameState: GameState, talents: Talent[]) {
  const talentOptions = ref<Talent[]>([]);
  const selectedTalent = ref<Talent | null>(null);
  const availablePoints = ref(10);
  const tempStats = ref<Partial<GameState> | null>(null);
  const baseStats = ref<Partial<GameState>>({});

  const startSelection = () => {
    tempStats.value = {
      age: 0,
      health: Math.floor(Math.random() * 21),
      happiness: 40 + Math.floor(Math.random() * 21),
      smarts: Math.floor(Math.random() * 21),
      looks: Math.floor(Math.random() * 21),
      wealth: 0,
      fame: 0,
      lifespan: 70 + Math.floor(Math.random() * 31),
      houses: [],
      cars: [],
      savings: 0,
      inventory: []
    };
    baseStats.value = { ...tempStats.value };
    availablePoints.value = 10;

    const pool = talents || [];
    talentOptions.value = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
    selectedTalent.value = null;
  };

  const selectTalent = (talent: Talent) => {
    selectedTalent.value = talent;
  };

  const handlePointChange = (stat: keyof GameState, val: number) => {
    if (!tempStats.value) return;

    const getBase = (key: keyof GameState) =>
      ((baseStats.value[key] as number) || 0) +
      (selectedTalent.value?.effect?.[key as keyof Talent['effect']] || 0);

    const stats: (keyof GameState)[] = ['health', 'smarts', 'looks', 'happiness'];
    const usedByOthers = stats.reduce((sum, key) => {
      if (key !== stat) {
        return sum + ((tempStats.value![key] as number) - getBase(key));
      }
      return sum;
    }, 0);

    const base = getBase(stat);
    const maxAllowed = base + (10 - usedByOthers);

    let verifiedVal = val;
    if (verifiedVal > maxAllowed) {
      verifiedVal = Math.max(0, maxAllowed);
    }

    if (verifiedVal !== val) {
      nextTick(() => {
        if (tempStats.value) (tempStats.value[stat] as number) = verifiedVal;
      });
    }

    const currentUsed = verifiedVal - base + usedByOthers;
    availablePoints.value = 10 - currentUsed;
  };

  const confirmTalent = () => {
    if (selectedTalent.value && selectedTalent.value.effect && tempStats.value) {
      const ef = selectedTalent.value.effect;
      for (const k in ef) {
        const key = k as keyof GameState;
        if (Object.prototype.hasOwnProperty.call(tempStats.value, key)) {
          (tempStats.value[key] as number) += ef[k as keyof Talent['effect']] || 0;
        }
      }
    }
  };

  return {
    talentOptions,
    selectedTalent,
    availablePoints,
    tempStats,
    startSelection,
    selectTalent,
    handlePointChange,
    confirmTalent
  };
}
