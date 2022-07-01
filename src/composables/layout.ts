import { ref } from 'vue';
import { LAYOUT } from '@/utils/enums/general';

const layout = ref(LAYOUT.DEFAULT_LAYOUT);
const isMultichatUser = ref(window.xprops?.multichat || false);

export function useLayout() {
  const setNewLayout = (newLayout: LAYOUT) => {
    layout.value = newLayout;
  };

  return {
    setNewLayout,
    layout,
    isMultichatUser,
  };
}
