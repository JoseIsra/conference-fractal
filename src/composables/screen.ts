import { ref } from 'vue';
import { Platform } from 'quasar';

// screenState (FALSE > NOT MINIMIZED)
const screenMinimized = ref<boolean>(false);
const isLandscape = ref<boolean>(false);

export const useScreen = () => {
  const updateScreenState = () => {
    screenMinimized.value = !screenMinimized.value;
    window.xprops?.toggleMinimize?.(screenMinimized.value);
  };

  const setScreenDeviceOrientation = (value: boolean) => {
    isLandscape.value = value;
  };

  const isMobile = () => {
    return Platform.is.mobile as boolean;
  };
  const updateScreenTest = (payload: boolean) => {
    screenMinimized.value = payload;
  };
  return {
    screenMinimized,
    updateScreenState,
    setScreenDeviceOrientation,
    isLandscape,
    isMobile,
    updateScreenTest,
  };
};
