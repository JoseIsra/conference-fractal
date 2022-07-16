<template>
  <section class="a-menu" ref="target">
    <ul class="a-menu__optionList">
      <li
        class="a-menu__optionList__item"
        v-for="option in firstSectionOptions"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
      >
        <q-icon :name="option.iconName" size="20px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <!-- <q-separator spaced color="white" /> -->
      <li
        class="a-menu__optionList__item"
        v-for="option in options.secondSection"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
      >
        <q-icon :name="option.iconName" size="18px" />
        <label class="a-menu__optionList__item__description">{{
          boardOptionLabel
        }}</label>
      </li>
      <q-separator spaced color="white" />
      <li
        class="a-menu__optionList__item"
        v-for="option in options.thirdSection"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
      >
        <q-icon :name="option.iconName" size="18px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
        <span v-show="renderLabel(option.interaction)">(Actual)</span>
      </li>
      <q-separator spaced color="white" />
      <li
        :class="[
          'a-menu__optionList__item',
          { '--important': endVideoCallButton.important },
        ]"
        @click="handleOptionSelected(endVideoCallButton.interaction)"
      >
        <q-icon :name="endVideoCallButton.iconName" size="18px" color="white" />
        <label class="a-menu__optionList__item__description">{{
          endVideoCallButton.description
        }}</label>
      </li>
    </ul>
    <q-dialog v-model="openModal">
      <fu-delete-room-modal v-if="cardContent == 'delete-card'" />
      <fu-device-configuration-modal
        v-if="cardContent == 'configuration-card'"
      />
    </q-dialog>
    <q-dialog
      v-model="excaliModal"
      persitent
      maximized
      @hide="closeExcaliBoard"
    >
      <q-card class="relative-position" flat>
        <q-card-section tag="header">
          <q-card-actions class="absolute-right">
            <q-btn flat icon="close" round dense v-close-popup />
          </q-card-actions>
        </q-card-section>
        <q-card-section class="fit no-padding">
          <fu-excali-board />
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue';
import { menuOptions, MenuOptions, Options } from '@/helpers/menuOptions';
import FuDeleteRoomModal from 'molecules/FuDeleteRoomModal';
import {
  useInitWebRTC,
  useHandleParticipants,
  useUserMe,
  useToogleFunctions,
  useMainView,
  useBoard,
  useScreen,
} from '@/composables';
import { useLayout } from '@/composables/layout';
import { usePanels } from '@/composables/panels';
import { REASON_TO_LEAVE_ROOM, MAIN_VIEW_MODE, LAYOUT } from '@/utils/enums';
import FuDeviceConfigurationModal from 'molecules/FuDeviceConfigurationModal';
import { MenuOptionsInteractions } from '@/types/general';
import FuExcaliBoard from 'molecules/FuExcaliBoard';
import { onClickOutside } from '@vueuse/core';

export default defineComponent({
  name: 'FuMenuContentOptions',
  components: { FuDeleteRoomModal, FuDeviceConfigurationModal, FuExcaliBoard },
  setup() {
    const options = ref<MenuOptions>(menuOptions);
    let openModal = ref(false);
    const { openOptionsMenu } = useToogleFunctions();
    const { participants } = useHandleParticipants();

    const { userMe } = useUserMe();
    const { sendNotificationEvent } = useInitWebRTC();
    const { updateMainViewState } = useMainView();
    const { setNewLayout, layout } = useLayout();
    const { showExcaliBoard, setShowExcaliBoard } = useBoard();
    const { isMobile } = useScreen();
    const { setOpenAdminPanel } = usePanels();
    const excaliModal = ref(false);
    const cardContent = ref('');
    const target = ref(null);
    const canEndCall = ref(userMe.roleId === 0);

    const canLeaveCall = ref(
      (userMe.roleId === 0 || userMe.roleId === 1) && !userMe.isHost
    );
    const renderExcaliOnMobile = ref(showExcaliBoard.value && isMobile());
    const optionsMethodsObject = reactive<MenuOptionsInteractions>({
      LEAVE: () => {
        participants.value.length > 0
          ? window.xprops?.handleParticipantLeave()
          : window.xprops?.handleLeaveCall?.(
              REASON_TO_LEAVE_ROOM.I_CLOSE_ROOM,
              []
            );
        if (userMe.isRecording) {
          sendNotificationEvent('RECORDING_STOPPED', userMe.id);
        }
      },
      END: () => openModalWithName('delete-card'),
      DEVICECONFIGURATION: () => openModalWithName('configuration-card'),
      BOARD: () => openExcaliBoard(),
      GRID_LAYOUT: () => initDefaultLayout(),
      ROW_LAYOUT: () => initPresentationLayout(),
      ADMIN_PANEL: () => initAdminPanel(),
    });

    const boardOptionLabel = computed(() => {
      return showExcaliBoard.value
        ? options.value.secondSection[0].secondDescription
        : options.value.secondSection[0].description;
    });

    const isAdmin = computed(() => userMe.roleId == 0);

    const endVideoCallButton = computed(() => {
      return options.value.fourthSection.find(
        (op) => op.admin == (userMe.roleId == 0 && userMe.isHost)
      ) as Options;
    });

    const firstSectionOptions = computed(() => {
      return options.value.firstSection.filter(
        (op) => op.admin == isAdmin.value
      );
    });

    const openModalWithName = (modalName: string) => {
      openModal.value = true;
      cardContent.value = modalName;
    };

    const handleOptionSelected = (interaction?: string) => {
      optionsMethodsObject[interaction as keyof MenuOptionsInteractions]();
      openOptionsMenu(false);
    };

    const openExcaliBoard = () => {
      setShowExcaliBoard(!showExcaliBoard.value);
      if (isMobile()) {
        excaliModal.value = true;
        return;
      }
      if (showExcaliBoard.value) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.EXCALI,
          startedBy: userMe.id,
        });
      } else {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.NONE,
          startedBy: '',
        });
      }
    };
    const initDefaultLayout = () => {
      setNewLayout(LAYOUT.GRID_LAYOUT);
    };
    const initPresentationLayout = () => {
      setNewLayout(LAYOUT.ROW_LAYOUT);
    };

    const closeExcaliBoard = () => {
      setShowExcaliBoard(false);
    };

    const renderLabel = (interaction?: string) => {
      return (
        (interaction == 'GRID_LAYOUT' && layout.value == LAYOUT.GRID_LAYOUT) ||
        (interaction == 'ROW_LAYOUT' && layout.value == LAYOUT.ROW_LAYOUT)
      );
    };
    onClickOutside(target, () => {
      openOptionsMenu(false);
    });

    const initAdminPanel = () => {
      setOpenAdminPanel(true);
    };

    return {
      options,
      handleOptionSelected,
      openModal,
      canEndCall,
      canLeaveCall,
      cardContent,
      showExcaliBoard,
      boardOptionLabel,
      closeExcaliBoard,
      renderExcaliOnMobile,
      excaliModal,
      renderLabel,
      target,
      userMe,
      endVideoCallButton,
      firstSectionOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './menuContentOptions.scss';
</style>
