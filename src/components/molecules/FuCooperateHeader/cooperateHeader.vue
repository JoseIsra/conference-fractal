<template>
  <header class="m-header full-width">
    <div class="m-header__logo q-mt-md q-ml-sm">
      <img
        loading="lazy"
        class="m-header__logo__image"
        alt="logo-collaborate"
        src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/LogoFU_head.svg"
      />
    </div>
    <div
      v-show="!screenMinimized"
      class="m-header__recordingContainer absolute"
    >
      <fu-recording />
    </div>
    <!-- <div class="m-header__minimizeContainer"> -->
    <!-- Para el botoón de minimizar -->
    <!-- <q-btn color="primary" icon="check" label="Minimizar" /> -->
    <!-- </div> -->

    <div
      v-if="!showBoard"
      class="m-header__activeBoard"
      @click="toggleShowBoard"
    >
      <q-icon
        style="margin-right: 10px"
        name="fas fa-drafting-compass"
        v-if="!showBoard"
      />
      <span v-if="!showBoard"> Pizarra activa</span>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuRecording from '@/components/molecules/FuRecording';
import { useBoard, useScreen } from '@/composables';

export default defineComponent({
  name: 'FuCooperateHeader',
  components: {
    FuRecording,
  },
  setup() {
    const { showBoard, toggleShowBoard } = useBoard();
    const { screenMinimized } = useScreen();
    return {
      showBoard,
      toggleShowBoard,
      screenMinimized,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateHeader.scss';
</style>
