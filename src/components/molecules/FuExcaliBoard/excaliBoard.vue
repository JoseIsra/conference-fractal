<template>
  <section :class="['m-excali', excaliStyle]">
    <iframe class="m-excali__board" src="https://excalidraw.com/" />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useLayout } from '@/composables/layout';
import { useScreen } from '@/composables/screen';
import { LAYOUT } from '@/utils/enums';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'FuExcaliBoard',
  setup() {
    const { layout } = useLayout();
    const $q = useQuasar();
    const { isMobile } = useScreen();

    const excaliStyle = computed(() => {
      return {
        '--mobile': $q.screen.lt.md,
        '--presentation': layout.value == LAYOUT.ROW_LAYOUT && !isMobile(),
      };
    });

    return {
      excaliStyle,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './excaliBoard.scss';
</style>
