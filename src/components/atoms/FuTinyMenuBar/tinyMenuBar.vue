<template>
  <section class="a-tiny row items-center">
    <main class="a-tiny__mainWrapper q-mr-lg q-pa-sm">
      <q-btn
        round
        :class="['a-tiny__btn', { active: userMe.isMicOn }]"
        :icon="micIcon"
        :disable="micDisabled"
        size="13px"
        flat
        dense
        text-color="white"
        @click="activateInteraction(iconsPeriferics.mic.interaction)"
      >
        <q-tooltip class="bg-grey-10" v-if="userMe.micPublishedState == 0">
          <label class="a-tiny__btn__tooltip">
            {{ micTooltip }}
          </label>
        </q-tooltip>
      </q-btn>
      <q-btn
        round
        flat
        :class="['a-tiny__btn', { active: userMe.isCameraOn }]"
        :icon="cameraIcon"
        :disable="cameraDisabled"
        size="13px"
        dense
        text-color="white"
        @click="activateInteraction(iconsPeriferics.camera.interaction)"
      >
        <q-tooltip class="bg-grey-10">
          <label class="a-tiny__btn__tooltip">
            {{ cameraTooltip }}
          </label>
        </q-tooltip>
      </q-btn>
      <q-btn
        round
        flat
        :class="[
          'a-tiny__btn',
          {
            active: handNotificationActive,
          },
        ]"
        :icon="handNotificationActive ? hand.onState : hand.offState"
        size="13px"
        dense
        text-color="white"
        @click="activateInteraction(hand.interaction)"
      >
        <q-tooltip class="bg-grey-10">
          <label class="a-tiny__btn__tooltip">
            {{
              handNotificationActive
                ? hand.toolTipSecondMessage
                : hand.toolTipMessage
            }}
          </label>
        </q-tooltip>
      </q-btn>
    </main>
    <aside>
      <q-btn
        :icon="finishButton.iconName"
        size="15px"
        round
        color="red-6"
        @click="handleEndCall(finishButton.interaction)"
      >
        <q-tooltip class="bg-grey-10">
          <label>
            {{ finishButton.description }}
          </label>
        </q-tooltip>
      </q-btn>
    </aside>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, toRefs } from 'vue';
import { Functionalities } from '@/types';
import { iconsPeriferics, iconsFunctions } from '@/helpers/iconsMenuBar';
import { useUserMe, useToogleFunctions } from '@/composables';
import { menuOptions } from '@/helpers/menuOptions';

export default defineComponent({
  name: 'FuTinyMenuBar',
  props: {
    objectFunctionalities: {
      type: Object as PropType<Functionalities>,
    },
  },
  setup(props) {
    const { userMe } = useUserMe();
    const { functionsOnMenuBar } = useToogleFunctions();

    const activateInteraction = (interaction: string) => {
      props?.objectFunctionalities?.[interaction as keyof Functionalities]?.();
    };

    const cameraTooltip = computed(() => {
      return !userMe.isCameraOn
        ? iconsPeriferics.camera.toolTipMessage
        : iconsPeriferics.camera.toolTipSecondMessage;
    });
    const micTooltip = computed(() => {
      return !userMe.isMicOn
        ? iconsPeriferics.mic.toolTipMessage
        : iconsPeriferics.mic.toolTipSecondMessage;
    });

    const micIcon = computed(() => {
      return !userMe.isMicOn
        ? iconsPeriferics.mic.offState
        : iconsPeriferics.mic.onState;
    });

    const cameraIcon = computed(() => {
      return userMe.cameraPublishedState == 1
        ? iconsPeriferics.camera.onState
        : userMe.cameraPublishedState == 2
        ? iconsPeriferics.camera.loadingState
        : iconsPeriferics.camera.offState;
    });

    const cameraDisabled = computed(() => {
      return (
        userMe.isPublishing == 2 || userMe.isCameraBlocked || !userMe.hasWebcam
      );
    });

    const micDisabled = computed(() => {
      return userMe.isPublishing == 2 || userMe.isMicBlocked || !userMe.hasMic;
    });

    const finishButton = computed(() => {
      return menuOptions.fourthSection.find((b) => b.admin == userMe.isHost);
    });

    const handleEndCall = () => {
      // go end call 🚀
      window.xprops?.handleParticipantLeave();
    };

    return {
      userMe,
      iconsPeriferics,
      activateInteraction,
      cameraTooltip,
      micTooltip,
      micIcon,
      cameraIcon,
      micDisabled,
      cameraDisabled,
      ...toRefs(functionsOnMenuBar),
      ...toRefs(iconsFunctions),
      menuOptions,
      finishButton,
      handleEndCall,
    };
  },
});
</script>

<style scoped lang="scss">
@import './tinyMenuBar.scss';
</style>
