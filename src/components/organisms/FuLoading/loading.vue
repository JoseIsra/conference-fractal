<template>
  <div
    class="fullscreen text-white text-center q-pa-md flex flex-center"
    :style="{ background: '#36393f' }"
  >
    <div>
      <figure>
        <img
          :style="{ width: '300px', 'min-width': '200px', height: '50px' }"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/LogoFU_head.svg"
          alt="logo-fractalup"
        />
      </figure>

      <q-spinner-dots v-if="errorType != 0" color="blue-1" size="2em" />
      <div
        v-if="errorType != 0"
        :style="{ 'font-size': '2vw', opacity: '0.3', margin: '12px 0' }"
      >
        {{ loadingMessage }}
      </div>

      <!-- <q-btn v-if="loadingMessage !== ''" label="Regresar" @click="leaveCall" /> -->

      <q-btn v-if="errorType == 0" label="Recargar" @click="refreshPage" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FuTLoading',
  props: {
    loadingMessage: {
      type: String,
      default: '',
    },
    errorType: {
      type: Number,
      default: -1,
    },
  },
  setup(props, { emit }) {
    const leaveCall = () => emit('handleLeaveCall');
    const refreshPage = () => {
      window.location.reload();
    };

    return { leaveCall, refreshPage };
  },
});
</script>

<style lang="sass">
@import 'loading'
</style>
