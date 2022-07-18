<template>
  <div class="t-cooperate">
    <div class="t-cooperate__page" v-show="!isLoadingOrError">
      <!-- <fu-lobby v-if="denied !== 1" @handleLeaveCall="handleZoidLeaveCall" /> -->

      <fu-cooperate @mounted="fuCooperateMountedHandler" />
    </div>

    <fu-t-loading
      v-if="isLoadingOrError"
      :loadingMessage="loadingOrErrorMessage"
      :errorType="errorType"
      @handleLeaveCall="handleZoidLeaveCall"
    />

    <!-- TODO: Move This (Prev of recording) -->
    <video
      v-show="false"
      id="localVideo2"
      class="a-userVideo__box__stream"
      autoplay
      muted
      playsinline
    ></video>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, onMounted, onUnmounted } from 'vue';
import FuCooperate from 'organisms/FuCooperate';
import { useRoute } from 'vue-router';
import { useRoom, useAuthState, useInitWebRTC, useUserMe } from '@/composables';
import { useJitsi } from '@/composables/jitsi';
import FuTLoading from 'organisms/FuLoading';
import {
  PERMISSION_STATUS,
  REASON_TO_LEAVE_ROOM,
  ROOM_PRIVACY,
} from '@/utils/enums';

import DetectRTC from 'detectrtc';
import { regexConferenceName } from '@/config/constants';

export default defineComponent({
  name: 'FuTCooperate',
  components: {
    FuCooperate,
    FuTLoading,
  },
  setup() {
    const {
      userMe,
      setUserMe,
      setVideoActivatedState,
      // setMicState,
      setCameraState,
      setScreenState,
      updateUserMe,
    } = useUserMe();

    const { roomState, setRoom } = useRoom();

    const route = useRoute();

    const { authState, setLoadingOrErrorMessage } = useAuthState();

    const {
      turnOffLocalCamera,
      resetDesktop,
      switchDesktopCapture,
      turnOnLocalCamera,
      unmuteLocalMic,
      muteLocalMic,
      sendNotificationEvent,
      publish,
      stopPublishing,
    } = useInitWebRTC();

    const { stablisConnection, diconnectAll } = useJitsi();

    /* const { setMicIconState, setCameraIconState } = useActions(); */

    //Datos del usuario
    const streamId =
      window?.xprops?.streamId || (route.query.streamId as string) || '';

    const streamName =
      window?.xprops?.streamName || (route.query.streamName as string);

    const defaultAvatar =
      'https://encrypted.fractalup.com/file/MainPublic/classrooms/147/logos/1329107980918';
    // old-logo-not-remove 'https://encrypted.fractalup.com/file/FractalUp/Logos/logo_azul.svg';

    const avatar =
      window?.xprops?.photoURL ||
      (route.query.photoURL as string) ||
      defaultAvatar;

    //Para no colocar una imagen rota
    if (avatar !== defaultAvatar) {
      const splittedAvatarUrl = avatar.split('.');
      const extension = splittedAvatarUrl[splittedAvatarUrl.length - 1];
      const imageExtensions = ['png', 'jpg', 'jpeg', 'svg'];
      if (!imageExtensions.includes(extension)) {
        updateUserMe({
          avatar: defaultAvatar,
        });
      }
    }

    let roomId = window?.xprops?.roomId || (route.query.roomId as string) || '';
    roomId = roomId.trim().replace(regexConferenceName, '').replace(/\s/g, '-');
    const classroomId =
      window?.xprops?.classroomId || (route.query.classroomId as string) || '1';

    const roleId =
      window.xprops?.roleId || parseInt(route.query.roleId as string) || 0;

    let roomRestriction = window.xprops?.roomRestriction as number;

    if (!roomRestriction) {
      roomRestriction =
        parseInt(route.query.roomRestriction as string) || ROOM_PRIVACY.PUBLIC;
    }

    const isMicLocked = window.xprops?.isMicLocked || false;

    const cameraId =
      window.xprops?.cameraId || (route.query.cameraId as string);

    const micId = window.xprops?.micId || (route.query.micId as string);

    const speakerId =
      window.xprops?.speakerId || (route.query.speakerId as string);

    const isCameraLocked = window.xprops?.isCameraLocked || false;

    const isScreenShareLocked = false;

    const sharingLink =
      window?.xprops?.sharedLink || (route.query.sharedLink as string) || '';

    const fractalUserId =
      window?.xprops?.fractalUserId ||
      (route.query.fractalUserId as string) ||
      '';

    const isCameraOn =
      window?.xprops?.isCameraOn ||
      (route.query.isCameraOn as string) === 'camera' ||
      false;

    const isMicOn =
      window?.xprops?.isMicOn ||
      (route.query.isMicOn as string) == 'micro' ||
      false;

    const isHost =
      window?.xprops?.isHost ||
      (JSON.parse((route.query.isHost as string) || 'false') as boolean);

    if (isHost) {
      window?.xprops?.setHostId?.(streamId);
    }

    const hostId =
      (window?.xprops?.hostId as string) || (route.query.hostId as string);

    let bgInfo = window?.xprops?.bgInfo || {
      url: '',
      maximized: false,
      allowResetBg: false,
    };

    if (window?.xprops?.bgInfo?.url === '' || !window?.xprops?.bgInfo?.url) {
      bgInfo = {
        url: '',
        maximized: false,
        allowResetBg: false,
      };
    }

    /* const isBeingRecorded = window?.xprops?.isBeingRecorded || false; */

    if (isCameraOn) {
      setVideoActivatedState(true);
      setCameraState(true);
      /* setCameraIconState(true); */
    }

    DetectRTC.load(() => {
      updateUserMe({
        hasWebcam: DetectRTC.hasWebcam,
        hasMic: DetectRTC.hasMicrophone,
      });
    });
    setUserMe({
      id: '', // se actualiza luego al ingresar a la conferencia
      name: streamName,
      avatar,
      roleId,
      isMicOn,
      isCameraOn,
      isScreenSharing: false,
      isVideoActivated: false,
      isMicBlocked: roleId === 1 ? isMicLocked : false,
      isCameraBlocked: roleId === 1 ? isCameraLocked : false,
      isScreenShareBlocked: roleId === 1 ? isScreenShareLocked : false,
      fractalUserId,
      denied:
        roomRestriction === ROOM_PRIVACY.PRIVATE
          ? roleId === 1
            ? PERMISSION_STATUS.asked
            : PERMISSION_STATUS.admitted
          : PERMISSION_STATUS.admitted,
      isRecording: false,
      isHost,
      cameraId,
      micId,
      isPublishing: 0,
      speakerId,
      canDraw: false,
      isVideoOwner: false,
      tracks: [],
    });
    console.debug('userm', userMe);
    /* setMicIconState(isMicLocked ? false : isMicOn); */
    // setCameraIconState(!isCameraLocked);
    // setScreenShareIconState(!isScreenShareLocked);

    const startDate = window.xprops?.startDate || '2020-01-11 11:23';

    //data de sala
    setRoom({
      id: roomId,
      sharingLink,
      classroomId,
      roomRestriction,
      isMicBlocked: isMicLocked,
      isCameraBlocked: isCameraLocked,
      isScreenShareBlocked: isScreenShareLocked,
      bgInfo: bgInfo,
      recordingUrl: '',
      startDate,
      hostId,
    });

    /* setMicIconState(roleId === 1 ? (isMicLocked ? false : isMicOn) : isMicOn); */

    // if (roleId === 1 ? (isCameraLocked ? false : isCameraOn) : isCameraOn) {
    //   setVideoActivatedState(true);
    //   setCameraState(true);
    //   turnOnLocalCamera(streamId);
    //   sendNotificationEvent('CAM_TURNED_ON', streamId);
    // }

    // const publishToken =
    //   window?.xprops?.publishToken ||
    //   (route.query.publishToken as string) ||
    //   '';

    // const playToken =
    //   window?.xprops?.playToken || (route.query.playToken as string) || '';

    // const subscriberId = (route.query.subscriberId as string) || undefined;

    // const subscriberCode = (route.query.subscriberCode as string) || undefined;

    //const currentVolume = ref(0.5);

    const toggleDesktopCapture = () => {
      //si estoy compartiendo -> apago todo
      if (userMe.isScreenSharing) {
        if (!userMe.isCameraOn) {
          setVideoActivatedState(false);
          updateUserMe({ isVideoActivated: false });
        }
        updateUserMe({ isScreenSharing: false });
        turnOffLocalCamera(streamId);
        resetDesktop();
        if (
          !userMe.isCameraOn &&
          !userMe.isMicOn &&
          !userMe.isHost &&
          !userMe.isRecording
        ) {
          stopPublishing(streamId);
          updateUserMe({ isPublishing: 0 });
        }
        sendNotificationEvent('SCREEN_SHARING_OFF', streamId);
      } else {
        if (userMe.isPublishing == 1) {
          switchDesktopCapture(streamId);
        } else if (userMe.isPublishing == 0) {
          updateUserMe({ isPublishing: 2 });
          switchDesktopCapture(streamId);
          /* const interval = setInterval(() => {
            if (userMe.isPublishing == 1) {
              clearInterval(interval);
            }
          }, 1000); */
        }
      }
      // if (userMe.isCameraOn && !userMe.isScreenSharing) {
      //   turnOffLocalCamera(streamId);
      //   switchDesktopCaptureWithCamera(streamId);
      // } else if (!userMe.isCameraOn && !userMe.isScreenSharing) {
      //   setScreenShareIconState(true);
      //   switchDesktopCapture(streamId);
      //   setVideoActivatedState(true);
      //   sendNotificationEvent('SCREEN_SHARING_ON', streamId);
      // }

      // if (!userMe.isCameraOn && userMe.isScreenSharing) {
      //   turnOffLocalCamera(streamId);
      // } else {
      //   justTurnOnLocalCamera(streamId);
      // }
    };

    const toggleLocalCamera = () => {
      if (userMe.isCameraOn) {
        //si camara está on --> apago mi camara
        /* setCameraIconState(false); */
        turnOffLocalCamera(streamId);
        setVideoActivatedState(false);
        setCameraState(false);
        sendNotificationEvent('CAM_TURNED_OFF', streamId);
        if (
          !userMe.isHost &&
          !userMe.isMicOn &&
          !userMe.isScreenSharing &&
          !userMe.isRecording
        ) {
          updateUserMe({ isPublishing: 0 });
          stopPublishing(userMe.id);
        }
      } else {
        //si camara no está on y el usuario estaba compartiendo pantalla
        //-> apagar pantalla y abrir camara
        if (userMe.isScreenSharing) {
          if (userMe.isPublishing == 1) {
            setScreenState(false);
            setCameraState(true);
            turnOnLocalCamera(streamId);
            resetDesktop();
          } else {
          }
        } else {
          if (userMe.isPublishing == 1) {
            setVideoActivatedState(true);
            /* setCameraIconState(true); */
            setCameraState(true);
            turnOnLocalCamera(streamId);
            console.log(userMe.stream, '⭕⭕⭕');
            sendNotificationEvent('CAM_TURNED_ON', roomState.hostId);
          } else {
            setCameraState(true);
            updateUserMe({ isPublishing: 2 });
            console.log(userMe);
            publish(userMe.id, undefined, undefined, undefined, userMe.name);

            const interval = setInterval(() => {
              if (userMe.isPublishing == 1) {
                clearInterval(interval);
                setVideoActivatedState(true);
                /* setCameraIconState(true); */
                turnOnLocalCamera(streamId);
                sendNotificationEvent('CAM_TURNED_ON', roomState.hostId);
                console.log(userMe.stream, '⭕⭕⭕');
              }
            }, 1000);
          }
        }
      }
    };

    const toggleLocalMic = () => {
      if (!userMe.isMicOn) {
        if (userMe.isPublishing == 1) {
          /* setMicIconState(true); */
          unmuteLocalMic();
          sendNotificationEvent('MIC_UNMUTED', roomState.hostId);
        } else {
          updateUserMe({ isPublishing: 2 });
          publish(userMe.id, undefined, undefined, undefined, userMe.name);
          const interval = setInterval(() => {
            if (userMe.isPublishing == 1) {
              clearInterval(interval);
              /* setMicIconState(true); */
              unmuteLocalMic();
              sendNotificationEvent('MIC_UNMUTED', roomState.hostId);
            }
          }, 1000);
        }
      } else {
        /* setMicIconState(false); */
        muteLocalMic();
        sendNotificationEvent('MIC_MUTED', roomState.hostId);
        if (!userMe.isHost && !userMe.isVideoActivated && !userMe.isRecording) {
          updateUserMe({ isPublishing: 0 });
          stopPublishing(userMe.id);
        }
      }
    };
    onMounted(() => {
      if (roomId) {
        stablisConnection(roomId);
        setLoadingOrErrorMessage('Loading');
        // setIsLoadingOrError(false);
      } else {
        setLoadingOrErrorMessage('Please, provide a room id');
      }
    });

    //TODO: Dont dissapear loading until the host accept the user. Needed to implement logic for that (dont publish neither play streams)
    const fuCooperateMountedHandler = () => {
      if (userMe.isHost) {
        console.debug(
          'asistencia registrada (login) con el siguiente id: ',
          userMe.fractalUserId
        );
        window.xprops?.logJoined?.(userMe.fractalUserId);
      }
    };

    onUnmounted(() => {
      diconnectAll();
    });
    window.addEventListener('unload', () => {
      diconnectAll();
    });

    window.addEventListener('beforeunload', () => {
      diconnectAll();
    });

    const handleZoidLeaveCall = () =>
      window.xprops?.handleLeaveCall?.(REASON_TO_LEAVE_ROOM.JUST_LEAVE);

    return {
      fuCooperateMountedHandler,
      roomId,
      toggleLocalCamera,
      toggleLocalMic,
      toggleDesktopCapture,
      handleZoidLeaveCall,
      ...toRefs(authState),
      ...toRefs(userMe),
      roomState,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
