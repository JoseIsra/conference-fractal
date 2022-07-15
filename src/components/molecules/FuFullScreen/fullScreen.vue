<template>
  <section :class="['m-full', layoutStyle]" @click.self="closePanels">
    <fu-full-screen-users
      v-if="
        mainViewState.mode === MAIN_VIEW_MODE.USER &&
        mainViewState.pinnedUsers.length > 0
      "
    />
    <fu-external-video v-if="mainViewState.mode === MAIN_VIEW_MODE.VIDEO" />
    <fu-board v-if="mainViewState.mode === MAIN_VIEW_MODE.BOARD" />

    <fu-excali-board v-if="renderExcaliOnDesktop" />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import {
  useMainView,
  useSidebarToogle,
  useToogleFunctions,
  useScreen,
} from '@/composables';
import { useLayout } from '@/composables/layout';
import FuFullScreenUsers from 'molecules/FuFullScreenUsers';
import FuExternalVideo from 'molecules/FuExternalVideo';
import FuBoard from 'molecules/FuCooperateBoard';
import FuExcaliBoard from 'molecules/FuExcaliBoard';

import { LAYOUT, MAIN_VIEW_MODE } from '@/utils/enums';

export default defineComponent({
  name: 'FuFullScreen',
  components: {
    FuFullScreenUsers,
    FuExternalVideo,
    FuBoard,
    FuExcaliBoard,
  },
  setup() {
    const { mainViewState } = useMainView();

    const { isSidebarRender, setSidebarState } = useSidebarToogle();

    const { openOptionsMenu, openFunctionResponsiveMenu, setShowChat } =
      useToogleFunctions();

    const { layout } = useLayout();
    const { isMobile } = useScreen();
    const excaliModal = ref(true);

    const closePanels = () => {
      if (isSidebarRender.value) {
        setSidebarState(false);
        openOptionsMenu(false);
        openFunctionResponsiveMenu(false);
        setShowChat(false);
      }
    };
    const layoutStyle = computed(() => ({
      '--split': layout.value == LAYOUT.GRID_LAYOUT && !isMobile(),
    }));

    const renderExcaliOnDesktop = computed(() => {
      return mainViewState.mode === MAIN_VIEW_MODE.EXCALI && !isMobile();
    });

    return {
      mainViewState,
      MAIN_VIEW_MODE,
      closePanels,
      layoutStyle,
      renderExcaliOnDesktop,
      excaliModal,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreen.scss';
</style>
