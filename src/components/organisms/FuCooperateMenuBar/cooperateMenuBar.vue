<template>
  <div class="a-menuBar">
    <div
      v-if="!screenMinimized"
      class="a-menuBar__box row items-center full-width justify-center"
    >
      <section
        class="a-menuBar__box__main row absolute items-center justify-center q-pa-xs"
      >
        <aside class="a-menuBar__periferics">
          <q-btn
            flat
            round
            :class="['a-menuBar__icon', { active: userMe.isMicOn }]"
            :icon="
              !userMe.isMicOn
                ? iconsPeriferics.mic.offState
                : iconsPeriferics.mic.onState
            "
            :disable="
              userMe.isPublishing == 2 || userMe.isMicBlocked || !userMe.hasMic
            "
            size="13px"
            @click="toggleMIC"
          >
            <q-tooltip class="bg-grey-10" v-if="userMe.micPublishedState == 0">
              <label class="a-menuBar__icon__tooltip">
                {{
                  !userMe.isMicOn
                    ? iconsPeriferics.mic.toolTipMessage
                    : iconsPeriferics.mic.toolTipSecondMessage
                }}
              </label>
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            :class="['a-menuBar__icon', { active: userMe.isCameraOn }]"
            :icon="
              userMe.cameraPublishedState == 1
                ? iconsPeriferics.camera.onState
                : userMe.cameraPublishedState == 2
                ? iconsPeriferics.camera.loadingState
                : iconsPeriferics.camera.offState
            "
            :disable="
              userMe.isPublishing == 2 ||
              userMe.isCameraBlocked ||
              !userMe.hasWebcam
            "
            size="13px"
            @click="toggleCamera"
          >
            <q-tooltip class="bg-grey-10">
              <label class="a-menuBar__icon__tooltip">
                {{
                  !userMe.isCameraOn
                    ? iconsPeriferics.camera.toolTipMessage
                    : iconsPeriferics.camera.toolTipSecondMessage
                }}
              </label>
            </q-tooltip>
          </q-btn>
        </aside>
        <div class="a-menuBar__functions">
          <!-- TODO: Icon active like camera and mic porque cuando se presiona en dejar de compartir se queda con el círculo -->
          <q-btn
            flat
            round
            :class="[
              'a-menuBar__icon',
              {
                active: userMe.isScreenSharing,
              },
            ]"
            :icon="
              !userMe.isScreenSharing
                ? iconsFunctions.screenShare.onState
                : iconsFunctions.screenShare.offState
            "
            size="13px"
            :disable="userMe.isPublishing == 2 || userMe.isScreenShareBlocked"
            @click="toggleDesktopScreenCapture"
          >
            <q-tooltip class="bg-grey-10">
              <label class="a-menuBar__icon__tooltip">
                {{
                  !userMe.isScreenSharing
                    ? iconsFunctions.screenShare.toolTipMessage
                    : iconsFunctions.screenShare.toolTipSecondMessage
                }}
              </label>
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            :class="[
              'a-menuBar__icon',
              {
                active: functionsOnMenuBar.handNotificationActive,
              },
            ]"
            :icon="
              functionsOnMenuBar.handNotificationActive
                ? iconsFunctions.hand.onState
                : iconsFunctions.hand.offState
            "
            size="13px"
            @click="toogleHandUp"
          >
            <q-tooltip class="bg-grey-10">
              <label class="a-menuBar__icon__tooltip">
                {{
                  functionsOnMenuBar.handNotificationActive
                    ? iconsFunctions.hand.toolTipSecondMessage
                    : iconsFunctions.hand.toolTipMessage
                }}
              </label>
            </q-tooltip>
          </q-btn>
        </div>
        <div v-if="!screenMinimized" class="a-menuBar__functions__responsive">
          <q-btn
            icon="reorder"
            flat
            round
            color="white"
            @click="openResponsiveMenuOfFunctions"
          >
            <q-badge
              v-show="
                chatNotification &&
                (notificationCount == 0 || amountHandNotification == 0)
              "
              color="red"
              class="a-menuBar__icon__chatbadge"
              rounded
              floating
            >
            </q-badge>
            <q-badge
              rounded
              floating
              v-show="notificationCount > 0 || amountHandNotification > 0"
              :class="[
                'a-menuBar__icon__topin',
                { '--roleOne': userMe.roleId == 1 },
                waitingParticipants.length > 0
                  ? '--participants'
                  : '--noparticipants',
              ]"
            >
              {{ notificationCount + amountHandNotification }}
            </q-badge>
          </q-btn>
          <q-btn
            icon="pan_tool"
            class="a-menuBar__functions__responsive__handBtn"
            flat
            round
            color="grey-1"
            size="13px"
            @click="handleEspecialBehaviour('HANDUP')"
          >
            <q-badge
              v-show="functionsOnMenuBar.handNotificationActive"
              color="red"
              rounded
              floating
              >x</q-badge
            >
          </q-btn>

          <fu-cooperate-menu
            v-show="functionsOnMenuBar.renderResponsiveFunctionMenu"
            :objectFunctionalities="objectFunctionalities"
            class="a-menuBar__functions__responsive__menu"
            :isActions="false"
            :renderFunctions="true"
            width="100%"
            bottom="120%"
            ref="target"
          />
        </div>
        <aside class="a-menuBar__options">
          <q-btn
            round
            flat
            :ripple="false"
            v-for="icon in iconsOptions"
            :key="icon.id"
            :icon="icon.onState"
            class="a-menuBar__icon"
            @click="handleMenuPosition(icon.ubication)"
            size="13px"
          >
            <q-tooltip class="bg-grey-10">
              <label class="a-menuBar__icon__tooltip">
                {{ icon.toolTipMessage }}
              </label>
            </q-tooltip>
          </q-btn>
          <fu-cooperate-menu
            v-show="functionsOnMenuBar.renderPopupMenu"
            class="a-menuBar__options__menu"
            :isActions="isActions"
            :isOptions="isOptions"
            :renderFunctions="false"
            width="280px"
            bottom="120%"
          />
        </aside>
        <fu-cooperate-menu
          class="a-menuBar__responsiveOptions"
          v-show="functionsOnMenuBar.renderPopupMenu"
          :isActions="isActions"
          :isOptions="isOptions"
          :renderFunctions="false"
          width="100%"
          bottom="120%"
        />
      </section>
      <aside
        class="a-menuBar__rightToolbar row items-center absolute q-mr-lg gt-xs"
      >
        <q-btn
          flat
          round
          :class="[
            'a-menuBar__icon',
            {
              active: functionsOnMenuBar.renderUsersList && isSidebarRender,
            },
          ]"
          :icon="
            functionsOnMenuBar.renderUsersList && isSidebarRender
              ? iconsFunctions.users.onState
              : iconsFunctions.users.offState
          "
          size="13px"
          @click="toggleUsersList"
        >
          <q-badge
            rounded
            floating
            v-show="notificationCount > 0 || amountHandNotification > 0"
            :class="[
              'a-menuBar__icon__topin',
              { '--roleOne': userMe.roleId == 1 },
              waitingParticipants.length > 0
                ? '--participants'
                : '--noparticipants',
            ]"
          >
            {{ notificationCount + amountHandNotification }}
          </q-badge>
          <q-tooltip class="bg-grey-10">
            <label class="a-menuBar__icon__tooltip">
              {{
                functionsOnMenuBar.renderUsersList && isSidebarRender
                  ? iconsFunctions.users.toolTipSecondMessage
                  : iconsFunctions.users.toolTipMessage
              }}
            </label>
          </q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          :class="[
            'a-menuBar__icon',
            {
              active: functionsOnMenuBar.renderChat && isSidebarRender,
            },
          ]"
          :icon="
            functionsOnMenuBar.renderChat && isSidebarRender
              ? iconsFunctions.chat.onState
              : iconsFunctions.chat.offState
          "
          size="13px"
          @click="toogleChat"
        >
          <q-badge
            v-show="chatNotification"
            class="a-menuBar__icon__chatbadge"
            rounded
            color="red"
            floating
          >
          </q-badge>
          <q-tooltip class="bg-grey-10">
            <label class="a-menuBar__icon__tooltip">
              {{
                functionsOnMenuBar.renderChat && isSidebarRender
                  ? iconsFunctions.chat.toolTipSecondMessage
                  : iconsFunctions.chat.toolTipMessage
              }}
            </label>
          </q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          :class="'a-menuBar__icon'"
          :icon="iconsFunctions.minimize.onState"
          size="13px"
          @click="minimizeScreen"
        >
          <q-tooltip class="bg-grey-10">
            <label class="a-menuBar__icon__tooltip">
              {{ iconsFunctions.minimize.toolTipMessage }}
            </label>
          </q-tooltip>
        </q-btn>
      </aside>
    </div>
    <fu-tiny-menu-bar
      v-else
      class="absolute-bottom row items-center justify-center q-pa-sm"
      :objectFunctionalities="objectFunctionalities"
    />
    <q-dialog v-model="openAdminPanel">
      <fu-admin-panel />
    </q-dialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  watch,
  computed,
  provide,
  nextTick,
} from 'vue';
import FuCooperateMenu from 'molecules/FuCooperateMenu';
import { Functionalities } from '@/types';
import { MediaType } from '@/utils/enums/general';
import { iconsPeriferics, iconsFunctions } from '@/helpers/iconsMenuBar';

import {
  useHandleMessage,
  useHandleParticipants,
  useScreen,
  useUserMe,
  useToogleFunctions,
  useSidebarToogle,
} from '@/composables';
import { useJitsi } from '@/composables/jitsi';
import { usePanels } from '@/composables/panels';
import { useJitsiError } from '@/composables/jitsiError';
import { useLayout } from '@/composables/layout';
import { nanoid } from 'nanoid';

import FuAdminPanel from 'organisms/FuAdminPanel';
import { iconsOptions } from '@/helpers/iconsMenuBar';
import { cloneDeep as _cloneDeep, debounce as _debounce } from 'lodash';
import JitsiMeetJS from '@solyd/lib-jitsi-meet';
import JitsiLocalTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack';
import { MAIN_VIEW_MODE, MAIN_VIEW_LOCKED_TYPE } from '@/utils/enums';
import { onClickOutside } from '@vueuse/core';
import FuTinyMenuBar from 'atoms/FuTinyMenuBar';

export default defineComponent({
  name: 'FuCooperateMenuBar',
  components: {
    FuCooperateMenu,
    FuAdminPanel,
    FuTinyMenuBar,
  },
  setup() {
    /* const { options } = useActions(); */

    const { waitingParticipants } = useHandleParticipants();

    // const { roomState } = useRoom();
    let openNetworkConfig = ref(false);
    const target = ref(null);
    const objectFunctionalities = reactive<Functionalities>({
      CHAT: () => toogleChat(),
      SHARESCREEN: () => toggleDesktopScreenCapture(),
      HANDUP: () => toogleHandUp(),
      SHARENOTES: () => toogleShareNotes(),
      USERLIST: () => toggleUsersList(),
      MINIMIZE: () => minimizeScreen(),
      MIC: () => toggleMIC(),
      WEBCAM: () => toggleCamera(),
    });

    let isActions = ref<boolean>(false);
    let isOptions = ref<boolean>(false);
    let renderFunctionResponsiveMenu = ref<boolean>(false);
    let actionSelectionID = ref<string>('');
    let {
      functionsOnMenuBar,
      setShowChat,
      setShowNotes,
      setShowUsersList,
      openOptionsMenu,
      openFunctionResponsiveMenu,
      updateHandNotification,
    } = useToogleFunctions();

    const {
      turnOnLocalMic,
      turnOffLocalMic,
      turnOnLocalCamera,
      turnOffLocalCamera,
      sendNotification,
      roomAddTrack,
      updateRoomJitsi,
      testReplaceAudio,
      replaceLocalTrack,
    } = useJitsi();
    const { openAdminPanel, setOpenAdminPanel, setTabSharedWarning } =
      usePanels();
    const { errorsCallback } = useJitsiError();
    const { isMultichatUser } = useLayout();

    const notificationCount = computed(() => {
      return userMe.roleId === 0 ? waitingParticipants.value.length : 0;
    });

    const amountHandNotification = computed(() => {
      return notificateHandUp.value
        ? functionsOnMenuBar.handNotificationInfo.filter(
            (notific) => notific.from !== userMe.id
          ).length
        : functionsOnMenuBar.handNotificationInfo.length;
    });

    const notificateHandUp = computed(() => {
      return functionsOnMenuBar.handNotificationInfo.some(
        (notific) => notific.from == userMe.id
      );
    });

    provide('amountHandNotification', amountHandNotification);
    provide('notificationCount', notificationCount);

    let { isSidebarRender, setSidebarState } = useSidebarToogle();

    const {
      userMe,
      setMicState,
      setVideoActivatedState,
      setCameraState,
      setScreenState,
      localTracks,
      localVideoTrack,
      setLocalCameraLocked,
      updateUserMe,
      setLocalScreenSharingLocked,
    } = useUserMe();

    const canSeeActionsMenu = ref(userMe.roleId === 0);
    const showAdminPanel = ref(false);
    const {
      userMessages,
      showChatNotification,
      chatNotification,
      amountOfNewMessages,
      acumulateMessages,
    } = useHandleMessage();
    const newChatMessageSound = new Audio(
      'https://freesound.org/data/previews/342/342749_5260872-lq.mp3'
    );

    const lastMessageOwner = computed(() => {
      return userMessages.value[userMessages.value.length - 1].streamId;
    });

    const devicesAvailable = computed(() => {
      return userMe.isScreenSharing
        ? 'desktop'
        : userMe.hasWebcam
        ? 'video'
        : '';
    });

    // const modifierClass = computed(() => ({
    //   '--presentation': layout.value == LAYOUT.ROW_LAYOUT,
    //   '--screenPresentation':
    //     layout.value == LAYOUT.ROW_LAYOUT &&
    //     mainViewState.mode != MAIN_VIEW_MODE.NONE,
    // }));

    watch(
      () => _cloneDeep(userMessages.value),
      (current, prev) => {
        if (
          current.length - prev.length > 0 &&
          !functionsOnMenuBar.renderChat &&
          lastMessageOwner.value !== userMe.id
        ) {
          showChatNotification(true);
          if (amountOfNewMessages.value == 1) {
            newChatMessageSound.currentTime = 0;
            void newChatMessageSound.play();
          }
        } else {
          showChatNotification(false);
        }
      }
    );

    //**********************++FUNCIONES ********************** */
    const toogleChat = () => {
      if (!isSidebarRender.value) {
        setSidebarState(true);
        setShowChat(true);
        setShowNotes(false);
        setShowUsersList(false);
        showChatNotification(false);
        acumulateMessages(0);
        return;
      } else if (isSidebarRender.value && functionsOnMenuBar.renderChat) {
        setSidebarState(false);
        setShowChat(false);
        acumulateMessages(0);
        return;
      }
      setShowChat(true);
      setShowNotes(false);
      setShowUsersList(false);
      showChatNotification(false);
      acumulateMessages(0);
    };

    const toogleShareNotes = () => {
      if (!isSidebarRender.value) {
        setSidebarState(true);
        setShowNotes(true);
        setShowChat(false);
        setShowUsersList(false);
        return;
      } else if (isSidebarRender.value && functionsOnMenuBar.renderNotes) {
        setSidebarState(false);
        return;
      }
      setShowNotes(true);
      setShowChat(false);
      setShowUsersList(false);
    };

    const toggleUsersList = () => {
      if (!isSidebarRender.value) {
        setSidebarState(true);
        setShowUsersList(true);
        setShowNotes(false);
        setShowChat(false);
        return;
      } else if (isSidebarRender.value && functionsOnMenuBar.renderUsersList) {
        setSidebarState(false);
        return;
      }
      setShowUsersList(true);
      setShowNotes(false);
      setShowChat(false);
    };

    const toggleCamera = () => {
      if (userMe.isCameraOn) {
        setVideoActivatedState(false);
        turnOffLocalCamera();
        setLocalScreenSharingLocked(false);
        sendNotification('TURN_OFF_CAMERA', { value: userMe.id });
      } else {
        //send notification
        updateUserMe({ isPublishing: 2 });
        void nextTick(() => {
          turnOnLocalCamera();
        });
        setLocalScreenSharingLocked(true);
        setVideoActivatedState(true);
        sendNotification('TURN_ON_CAMERA', { value: userMe.id });
      }
      setCameraState(!userMe.isCameraOn);
      updateRoomJitsi(userMe);
    };

    const toggleMIC = () => {
      if (userMe.isMicOn) {
        turnOffLocalMic();
        // enviar notificación a participantes
        sendNotification('TURN_OFF_MIC', { value: userMe.id });
      } else {
        turnOnLocalMic();
        // enviar notificación a participantes
        sendNotification('TURN_ON_MIC', { value: userMe.id });
      }
      setMicState(!userMe.isMicOn);
      updateRoomJitsi(userMe);
    };

    const toogleHandUp = () => {
      const riseHand = {
        id: nanoid(),
        to: 'ALL',
        from: userMe.id,
        streamName: userMe.name,
        eventType: 'HAND_UP',
      };
      if (
        functionsOnMenuBar.handNotificationInfo.some(
          (notific) => notific.from === riseHand.from
        )
      ) {
        const downHand = { ...riseHand, eventType: 'HAND_DOWN' };
        const handDown = _debounce(() => {
          updateHandNotification(false);
          sendNotification(downHand.eventType, {
            value: JSON.stringify(downHand),
          });
        }, 200);
        handDown();
        return;
      }
      const handUp = _debounce(() => {
        updateHandNotification(true);
        sendNotification(riseHand.eventType, {
          value: JSON.stringify(riseHand),
        });
      }, 200);
      handUp();
    };

    const startScreenSharing = (tracks: JitsiLocalTrack[]) => {
      const desktopAudioTrack = tracks.find(
        (track) => track.getType() === MediaType.AUDIO
      );
      const desktopVideoTrack = tracks.find(
        (track) => track.getType() === MediaType.VIDEO
      );

      if (desktopVideoTrack) {
        setVideoActivatedState(true);
        setLocalCameraLocked(true);
        updateRoomJitsi(userMe);
        localTracks.value.push(desktopVideoTrack);
        void nextTick(() => {
          localTracks.value[1].attach(localVideoTrack.value);
        });
        // replaceLocalTrack(desktopVideoTrack, MediaType.VIDEO);
        roomAddTrack(desktopVideoTrack, null);
        // () => {
        //   sendNotification('PIN_USER_FOR_ALL_PARTICIPANTS', {
        //     value: JSON.stringify({
        //       mode: MAIN_VIEW_MODE.USER,
        //       pinnedUsers: [userMe.id],
        //       startedBy: userMe.id,
        //       locked: MAIN_VIEW_LOCKED_TYPE.NORMAL_USERS,
        //     }),
        //   });
        // }
        sendNotification('INIT_SCREEN_SHARING', { value: userMe.id });
        // setTimeout(() => {
        // }, 2200);
      }

      if (desktopAudioTrack) {
        // send audio
        testReplaceAudio(localTracks.value[0], desktopAudioTrack, false);
        setTabSharedWarning(true);
      }
    };

    const stopScreenSharing = (tracks: JitsiLocalTrack[]) => {
      setLocalCameraLocked(false);
      setVideoActivatedState(false);
      sendNotification('FINISH_SCREEN_SHARING', { value: userMe.id });
      sendNotification('PIN_USER_FOR_ALL_PARTICIPANTS', {
        value: JSON.stringify({
          mode: MAIN_VIEW_MODE.NONE,
          pinnedUsers: [],
          startedBy: userMe.id,
          locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
        }),
      });
      setTabSharedWarning(false);
      if (!tracks[0]) return;

      localTracks.value.push(tracks[0]);
      void nextTick(() => {
        localTracks.value[1].attach(localVideoTrack.value);
      });
      roomAddTrack(tracks[0], null);
      void tracks[0].mute();
      replaceLocalTrack(localTracks.value[0], MediaType.AUDIO);
    };

    const toggleDesktopScreenCapture = async () => {
      setScreenState(!userMe.isScreenSharing);
      // apagar local track
      if (localTracks.value[1]) {
        if (userMe.isCameraOn) {
          setCameraState(false);
        }
        localTracks.value[1].dispose();
        void localTracks.value.pop();
      }
      try {
        const tracks = (await JitsiMeetJS.createLocalTracks({
          devices: [devicesAvailable.value],
        })) as JitsiLocalTrack[];

        if (userMe.isScreenSharing) {
          startScreenSharing(tracks);
        } else {
          stopScreenSharing(tracks);
        }
      } catch (error: unknown) {
        const castError = error as Error;
        errorsCallback(castError.name, castError.message);
      }
    };

    // const videoTrackController = (tracks: JitsiLocalTrack[]) => {
    //   if (tracks.length == 1) {
    //     localTracks.value.push(tracks[0]);
    //     void nextTick(() => {
    //       localTracks.value[1].attach(localVideoTrack.value);
    //     });
    //     testReplaceAudio(localTracks.value[0], tracks[0], true);
    //     roomAddTrack(localTracks.value[1]);
    //   } else {
    //     // web tracks
    //     localTracks.value.push(tracks[1]);
    //     void nextTick(() => {
    //       localTracks.value[1].attach(localVideoTrack.value);
    //     });
    //     roomAddTrack(localTracks.value[1]);
    //     testReplaceAudio(localTracks.value[0], tracks[0], false);
    //   }
    // };

    const { updateScreenState, screenMinimized } = useScreen();

    const minimizeScreen = () => {
      updateScreenState();
      setSidebarState(false);
    };

    const handleMenuPosition = (ubication?: string) => {
      if (ubication == 'actions') {
        setOpenAdminPanel(!showAdminPanel.value);
      } else {
        isActions.value = false;
        isOptions.value = true;
        openOptionsMenu(!functionsOnMenuBar.renderPopupMenu);
      }
    };

    const handleFunctionSelected = (interaction?: string, ID?: string) => {
      if (functionsOnMenuBar.selectedButtonID == ID) {
        objectFunctionalities[interaction as keyof Functionalities]?.();
        return;
      }
      objectFunctionalities[interaction as keyof Functionalities]?.();
    };

    const handleEspecialBehaviour = (interaction: string) => {
      objectFunctionalities[interaction as keyof Functionalities]?.();
    };

    const openResponsiveMenuOfFunctions = () => {
      openFunctionResponsiveMenu(
        !functionsOnMenuBar.renderResponsiveFunctionMenu
      );
    };

    onClickOutside(target, () => {
      openFunctionResponsiveMenu(false);
    });

    return {
      userMe,
      handleMenuPosition,
      isActions,
      handleFunctionSelected,
      actionSelectionID,
      renderFunctionResponsiveMenu,
      openNetworkConfig,
      functionsOnMenuBar,
      objectFunctionalities,
      isOptions,
      handleEspecialBehaviour,
      openResponsiveMenuOfFunctions,
      canSeeActionsMenu,
      toggleCamera,
      toggleMIC,
      iconsPeriferics,
      showAdminPanel,
      chatNotification,
      notificationCount,
      waitingParticipants,
      iconsFunctions,
      toggleDesktopScreenCapture,
      toogleHandUp,
      toggleUsersList,
      isSidebarRender,
      toogleChat,
      minimizeScreen,
      iconsOptions,
      amountOfNewMessages,
      amountHandNotification,
      openAdminPanel,
      // modifierClass,
      target,
      screenMinimized,
      isMultichatUser,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenuBar.scss';
</style>
