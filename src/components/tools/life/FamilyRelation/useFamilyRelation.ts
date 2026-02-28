import { ref, computed } from 'vue';
import { relationDict, labelMap, genderAwareResults } from './FamilyRelationData';

export function useFamilyRelation() {
  const myGender = ref(1); // 1: 男, 0: 女
  const chain = ref<string[]>([]);

  const currentGender = computed(() => {
    if (chain.value.length === 0) return myGender.value;
    const last = chain.value[chain.value.length - 1];
    if (['父', '兄', '弟', '子', '夫'].includes(last)) return 1;
    if (['母', '姐', '妹', '女', '妻'].includes(last)) return 0;
    return -1;
  });

  const setGender = (gender: number) => {
    myGender.value = gender;
    chain.value = [];
  };

  const append = (relation: string) => {
    chain.value.push(relation);
  };

  const backspace = () => {
    chain.value.pop();
  };

  const clear = () => {
    chain.value = [];
  };

  const getStepLabel = (step: string) => labelMap[step] || step;

  const expressionText = computed(() => {
    if (chain.value.length === 0) return '我';
    const labels = chain.value.map(k => labelMap[k] || k);
    return '我 的 ' + labels.join(' 的 ');
  });

  const resultText = computed(() => {
    if (chain.value.length === 0) return '我';
    const key = chain.value.join(',');
    const genderResult = genderAwareResults[key];
    if (genderResult) {
      return myGender.value === 1 ? genderResult.male : genderResult.female;
    }
    return relationDict[key] || '未知亲戚';
  });

  return {
    myGender,
    chain,
    currentGender,
    expressionText,
    resultText,
    setGender,
    append,
    backspace,
    clear,
    getStepLabel
  };
}
