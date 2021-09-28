import { ref } from 'vue';

import { Icons } from '@/types';

import {
  iconsPeriferics,
  iconsFunctions,
  iconsOptions,
} from '@/helpers/iconsMenuBar';

const periferics = ref<Icons[]>(iconsPeriferics);
const functions = ref<Icons[]>(iconsFunctions);
const options = ref<Icons[]>(iconsOptions);

export const useActions = () => {
  const setMicIconState = (state: boolean) =>
    (periferics.value.filter((p) => p.id === '1')[0].active = state);

  const setCamIconState = (state: boolean) =>
    (periferics.value.filter((p) => p.id === '2')[0].active = state);

  const setScreenShareIconState = (state: boolean) =>
    (functions.value.filter((f) => f.id === '1')[0].active = state);

  return {
    periferics,
    functions,
    options,
    setMicIconState,
    setCamIconState,
    setScreenShareIconState,
  };
};
