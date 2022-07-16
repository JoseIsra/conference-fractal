import { reactive, ref, nextTick } from 'vue';
import JitsiMeetJS from '@solyd/lib-jitsi-meet';
import options from '@/config/jitsiOptions';
import JitsiLocalTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack';
import { JitsiConferenceErrors } from '@solyd/lib-jitsi-meet/dist/esm/JitsiConferenceErrors';
import JitsiParticipant from '@solyd/lib-jitsi-meet/dist/esm/JitsiParticipant';
import JitsiRemoteTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiRemoteTrack';
import JitsiTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiTrack';
import {
  Command,
  JitsiConferenceRemake,
  JitsiConnectionRemake,
  HandNotification,
  User,
  Message,
  ObjBlockParticipantAction,
  ExternalVideoObject,
  MainViewState,
  backgroundInfo,
  backgroundSize,
  BaseData,
  ExternalVideoRequest,
  RecordConference,
  EndCallAttrs,
} from '@/types';

// composables
import {
  useUserMe,
  useHandleParticipants,
  useToogleFunctions,
  useHandleMessage,
  useAuthState,
  useExternalVideo,
  useRoom,
} from '@/composables';
import { useJitsiError } from '@/composables/jitsiError';
import { useUserColor } from '@/composables/userColor';
import { useMainView } from '@/composables/mainView';

import {
  REASON_TO_LEAVE_ROOM,
  MediaType,
  MAIN_VIEW_MODE,
  MAIN_VIEW_LOCKED_TYPE,
  ERRORS,
} from '@/utils/enums';
import videojs from 'video.js';
import { successMessage } from '@/utils/notify';

const roomNameTemporal = ref('');
let connection = reactive<JitsiConnectionRemake>({} as JitsiConnectionRemake);
let room = reactive<JitsiConferenceRemake>({} as JitsiConferenceRemake);
const joined = ref(false);
const {
  setLocalTracks,
  localTracks,
  updateUserMe,
  userMe,
  setLocalMicLocked,
  setMicState,
  setLocalCameraLocked,
  setCameraState,
  setLocalScreenSharingLocked,
  setScreenState,
  setVideoActivatedState,
  localVideoTrack,
} = useUserMe();

const {
  participantAudioTracks,
  participantVideoTracks,
  addParticipant,
  deleteParticipantById,
  findParticipantById,
  setParticipantActions,
} = useHandleParticipants();

const {
  addHandNotificationInfo,
  removeHandNotification,
  updateHandNotification,
} = useToogleFunctions();

const { setUserMessage, amountOfNewMessages, acumulateMessages } =
  useHandleMessage();

const { externalVideo, updateExternalVideoState } = useExternalVideo();

const { errorsCallback } = useJitsiError();
const { setIsLoadingOrError, setErrorType } = useAuthState();
const { mainViewState, updateMainViewState } = useMainView();
const { setUserBackgroundColor } = useUserColor();
const {
  updateBgUrl,
  updateBgSize,
  setRecordSessionId,
  recordSessionID,
  updateRoom,
} = useRoom();

const handNotificationSound = new Audio(
  'https://freesound.org/data/previews/411/411642_5121236-lq.mp3'
);
const remotePlayer = ref<videojs.Player>({} as videojs.Player);

export function useJitsi() {
  JitsiMeetJS.init({
    disableAudioLevels: false,
    enableAnalyticsLogging: true,
    enableWindowOnErrorHandler: true,
  });
  JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

  const commandsList = [
    {
      name: 'HAND_UP',
      listener: riseHand,
    },
    {
      name: 'HAND_DOWN',
      listener: downHand,
    },
    {
      name: 'TURN_OFF_CAMERA',
      listener: turnOffRemoteCamera,
    },
    {
      name: 'TURN_ON_CAMERA',
      listener: turnOnRemoteCamera,
    },
    {
      name: 'TURN_ON_MIC',
      listener: turnOnRemoteMic,
    },
    {
      name: 'TURN_OFF_MIC',
      listener: turnOffRemoteMic,
    },
    {
      name: 'INIT_SCREEN_SHARING',
      listener: initScreenSharing,
    },
    {
      name: 'FINISH_SCREEN_SHARING',
      listener: finishScreenSharing,
    },
    {
      name: 'KICK_PARTICIPANT',
      listener: kickParticipantFromRoom,
    },
    {
      name: 'LOCK_PARTICIPANT_MIC',
      listener: lockParticipantMic,
    },
    {
      name: 'LOCK_PARTICIPANT_CAMERA',
      listener: lockParticipantCamera,
    },
    {
      name: 'LOCK_PARTICIPANT_SCREEN_SHARING',
      listener: lockParticipantScreenSharing,
    },
    {
      name: 'INIT_EXTERNAL_VIDEO',
      listener: initExternalVideo,
    },
    {
      name: 'PAUSE_EXTERNAL_VIDEO',
      listener: pauseExternalVideo,
    },
    {
      name: 'REMOVE_EXTERNAL_VIDEO',
      listener: removeExternalVideo,
    },
    {
      name: 'UPDATE_EXTERNAL_VIDEO_CURRENT_TIME',
      listener: updateExternalVideoCurrentTime,
    },
    {
      name: 'PLAY_EXTERNAL_VIDEO',
      listener: playExternalVideo,
    },
    {
      name: 'REQUEST_VIDEO_CURRENT_TIME',
      listener: requestVideoCurrentTime,
    },
    {
      name: 'UPDATE_REQUEST_VIDEO_TIME',
      listener: updateRequestVideoTime,
    },
    {
      name: 'REQUEST_ROOM_STATE',
      listener: requestRoomState,
    },
    {
      name: 'SEND_ROOM_INFO',
      listener: receiveRoomInfo,
    },
    {
      name: 'PIN_USER_FOR_ALL_PARTICIPANTS',
      listener: pinUserForAllParticipants,
    },
    {
      name: 'UPDATE_BACKGROUND_IMAGE_OF_COOPERATE',
      listener: updateBackgroundImageOfCooperate,
    },
    {
      name: 'UPDATE_BG_IMAGE_SIZE_OF_COOPERATE',
      listener: updateBgImageSizeOfCooperate,
    },
    {
      name: 'MODERATOR_ENDS_CALL',
      listener: moderatorEndsCall,
    },
    {
      name: 'INIT_RECORDING',
      listener: adminInitRecording,
    },
    {
      name: 'END_RECORDING',
      listener: adminEndRecording,
    },
  ];

  function handleRemoteTracks(track: JitsiRemoteTrack) {
    const participantID = track.getParticipantId();
    console.log('HANDLE TRACKS REMOTOS: ID-TYPE', {
      participantID,
      type: track.getType(),
    });
    if (track.getType() == 'audio') {
      void nextTick(() => {
        track.attach(participantAudioTracks[`audio-${participantID}`]);
      });
    } else {
      void nextTick(() => {
        track.attach(participantVideoTracks[`video-${participantID}`]);
      });
    }
  }

  const getLocalTrackByType = (type: string) => {
    return localTracks.value.find((track) => track.getType() == type);
  };

  const turnOnLocalMic = () => {
    const audioTrack = getLocalTrackByType('audio');
    audioTrack?.unmute();
  };

  const turnOffLocalMic = () => {
    const audioTrack = getLocalTrackByType('audio');
    audioTrack?.mute();
  };

  const turnOnLocalCamera = () => {
    const videoTrack = getLocalTrackByType('video');
    videoTrack
      ?.unmute()
      .then(() => {
        updateUserMe({ isPublishing: 1 });
      })
      .catch((error) => console.error(error));
  };

  const turnOffLocalCamera = () => {
    const videoTrack = getLocalTrackByType('video');
    videoTrack?.mute();
  };
  const resetDesktop = async () => {
    if (localTracks.value[1]) {
      if (userMe.isCameraOn) {
        setCameraState(false);
      }
      localTracks.value[1].dispose();
      void localTracks.value.pop();
    }
    const cameraTrack = (await JitsiMeetJS.createLocalTracks({
      devices: ['video'],
    })) as JitsiLocalTrack[];
    localTracks.value.push(cameraTrack[0]);
    void nextTick(() => {
      localTracks.value[1].attach(localVideoTrack.value);
    });

    void room.addTrack(localTracks.value[1]);
    void localTracks.value[1].mute();
  };

  const roomAddTrack = (
    track: JitsiLocalTrack,
    callback: (() => void) | null
  ) => {
    // void room.replaceTrack(track, thenew);
    void room.addTrack(track);
    setTimeout(() => {
      callback && callback();
    }, 1200);
  };

  const testReplaceAudio = (
    oldaudio: JitsiLocalTrack & { stream?: MediaStream },
    newAudio: JitsiLocalTrack & { stream?: MediaStream },
    flag?: boolean
  ) => {
    const damn = JitsiMeetJS.createAudioMixer();
    damn.addMediaStream(newAudio.stream as MediaStream);
    damn.addMediaStream(oldaudio.stream as MediaStream);
    const started = damn.start();
    console.debug(started);
    // ADDTRACK NO FUNCIONA CON AUDIO
    if (flag) {
      void room.replaceTrack(room.getLocalTracks(MediaType.AUDIO)[0], oldaudio);
    } else {
      // await oldaudio.setEffect(started);
      // REPLACE TRACK FUNCIONA A MEDIAS
      void room.replaceTrack(oldaudio, newAudio);
    }
  };

  const getMediaTrack = (mediaType: MediaType) => {
    return room.getLocalTracks(mediaType)[0];
  };

  const replaceLocalTrack = (
    theTrach: JitsiLocalTrack,
    mediaType: MediaType
  ) => {
    const track = getMediaTrack(mediaType); // audio o video
    void room.replaceTrack(track, theTrach);
    console.log('LOCAL TRACKS DE VIDEO', room.getLocalTracks(MediaType.VIDEO));
  };

  function handleLocalTracks(
    tracks: JitsiLocalTrack[] | JitsiConferenceErrors
  ) {
    // show conference
    //setIsLoadingOrError(false);

    if (!tracks.length) return;

    setLocalTracks(tracks as JitsiLocalTrack[]);
    console.log('PARTICIPANTE UNIDO-TRACKS ENABLE 🚀', joined.value);

    if (joined.value) {
      localTracks.value.forEach((track) => {
        room
          .addTrack(track)
          .then(() => {
            void track.mute();
          })
          .catch((error) => console.error(error));
      });
    }
  }

  function getLocalTracks(constraints = ['video', 'audio']) {
    JitsiMeetJS.createLocalTracks({
      devices: constraints,
    })
      .then(handleLocalTracks)
      .catch((error: Error) => {
        errorsCallback(error.name, error.message);
      });
  }

  function requestInformationOnRoom() {
    if (!userMe.isHost) {
      sendNotification('REQUEST_ROOM_STATE', { value: JSON.stringify(userMe) });
    }
  }

  function onConferenceJoined() {
    console.log(
      ' 🚀UNIÉNDOSE A LA CONFERENCIA,tracks locales',
      localTracks.value
    );
    joined.value = true;
    setIsLoadingOrError(false);
    localTracks.value.forEach((track) => {
      room
        .addTrack(track)
        .then(() => {
          console.log(
            'TRACK UNIDO A LA SALA EN conferenceJoined-joined?',
            joined.value
          );
          void track.mute();
        })
        .catch((error) => console.error(error));
    });
    setErrorType(-1);
    setIsLoadingOrError(false);
    requestInformationOnRoom();
  }

  function onUserJoined(
    _arg: string,
    user: JitsiParticipant & { _tracks: JitsiTrack[] }
  ) {
    console.log('Nuevo user en sala 🤔, EVENTO: USER JOINED', {
      id: _arg,
      user,
      date: Date.now(),
      tracks: user._tracks,
    });
    if (!user.getDisplayName()) return;
    const dataUser = JSON.parse(user.getDisplayName()) as User;
    addParticipant({
      id: dataUser.id,
      name: dataUser.name,
      avatar:
        'https://encrypted.fractalup.com/file/FractalUp/Logos/logo_azul.svg',
      isCameraOn: dataUser.isCameraOn,
      isMicOn: dataUser.isMicOn,
      isScreenSharing: dataUser.isScreenSharing,
      isVideoActivated: dataUser.isVideoActivated,
      isMicBlocked: false,
      isCameraBlocked: false,
      isScreenShareBlocked: false,
      fractalUserId: dataUser.fractalUserId,
      denied: 1,
      isRecording: false,
      roleId: dataUser.roleId,
      isHost: dataUser.isHost,
      isPublishing: 0, // 0 -> off / 1 -> on / 2 -> loading . For my own user
      hasLogJoin: false, // Specially for others users because mine just log one time
      speakerId: '',
      cameraId: '',
      micId: '',
      canDraw: false,
      hasWebcam: dataUser.hasWebcam,
      hasMic: dataUser.hasMic,
      isVideoOwner: false,
      tracks: user._tracks,
    });
    setUserBackgroundColor(dataUser.id);
    console.debug(dataUser);
  }

  function onUserLeft(arg: string, participant: JitsiParticipant) {
    console.log('USER LEAVING', {
      date: Date.now(),
      id: arg,
      who: participant,
    });
    deleteParticipantById(arg);
  }

  function turnOffRemoteCamera(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isCameraOn = false;
      participant.isVideoActivated = false;
    }
  }
  function turnOnRemoteCamera(arg: Command) {
    const participant = findParticipantById(arg.value);
    // test feature
    if (participant) {
      participant.isCameraOn = true;
      participant.isVideoActivated = true;
    }
  }
  function turnOnRemoteMic(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isMicOn = true;
    }
  }
  function turnOffRemoteMic(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isMicOn = false;
    }
  }

  function initScreenSharing(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isVideoActivated = true;
    }
  }
  function finishScreenSharing(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isVideoActivated = false;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function adminInitRecording(arg: Command) {
    updateRoom({ isBeingRecorded: true });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function adminEndRecording(arg: Command) {
    updateRoom({ isBeingRecorded: false });
  }

  function riseHand(arg: Command) {
    handNotificationSound.currentTime = 0;
    void handNotificationSound.play();
    const dataParsed = JSON.parse(arg.value) as HandNotification;
    addHandNotificationInfo(dataParsed);
  }

  function downHand(arg: Command) {
    const dataParsed = JSON.parse(arg.value) as HandNotification;
    if (userMe.id == dataParsed.from) {
      updateHandNotification(false);
    }
    removeHandNotification(dataParsed.from);
  }

  function updateRoomJitsi(arg: User) {
    room.setDisplayName(JSON.stringify(arg));
  }

  const updateJitsiParticipant = () => {
    room.setLocalParticipantProperty('externalvideo', 'ontheroom');
  };

  function handleMessageReceived(_id: string, chatMessage: string) {
    const chatMessageParsed = JSON.parse(chatMessage) as Message;
    const { typeMessage } = chatMessageParsed;
    if (typeMessage == 'image' || typeMessage == 'file') {
      setUserMessage(chatMessageParsed);
      amountOfNewMessages.value++;
      acumulateMessages(amountOfNewMessages.value);
    } else {
      amountOfNewMessages.value++;
      acumulateMessages(amountOfNewMessages.value);
      setUserMessage(chatMessageParsed);
    }
  }

  function sendNotification(notification: string, arg: Command) {
    room.sendCommandOnce(notification, arg);
  }

  function sendChatMessage(userData: string) {
    room.sendMessage(userData);
  }

  function kickParticipantFromRoom(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      deleteParticipantById(participant.id);
    }
    if (userMe.id == arg.value) {
      window.xprops?.handleLeaveCall?.(
        REASON_TO_LEAVE_ROOM.KICKED_BY_MODERATOR
      );
    }
  }

  function lockParticipantMic(arg: Command) {
    const { participantId, action, locked } = JSON.parse(
      arg.value
    ) as ObjBlockParticipantAction;

    if (participantId !== userMe.id) {
      setParticipantActions(participantId, action, locked);
      return;
    }
    setLocalMicLocked(locked);

    if (locked) {
      setMicState(!locked);
      turnOffLocalMic();
      sendNotification('TURN_OFF_MIC', { value: userMe.id });
    }
  }

  function lockParticipantCamera(arg: Command) {
    const { participantId, action, locked } = JSON.parse(
      arg.value
    ) as ObjBlockParticipantAction;
    if (participantId !== userMe.id) {
      setParticipantActions(participantId, action, locked);
      return;
    }
    setLocalCameraLocked(locked);
    if (locked) {
      setCameraState(!locked);
      setVideoActivatedState(!locked);
      turnOffLocalCamera();
      sendNotification('TURN_OFF_CAMERA', { value: userMe.id });
    }
  }

  function lockParticipantScreenSharing(arg: Command) {
    const { participantId, action, locked } = JSON.parse(
      arg.value
    ) as ObjBlockParticipantAction;

    if (participantId !== userMe.id) {
      setParticipantActions(participantId, action, locked);
      if (mainViewState.mode == MAIN_VIEW_MODE.USER) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.NONE,
          pinnedUsers: [],
          locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
        });
      }
      return;
    }

    setLocalScreenSharingLocked(locked);

    if (locked) {
      setScreenState(!locked);
      if (userMe.isVideoActivated) {
        void resetDesktop();
      }
      setVideoActivatedState(!locked);
      sendNotification('FINISH_SCREEN_SHARING', { value: userMe.id });
    }
  }

  function initExternalVideo(arg: Command) {
    // init process to share and sync the video
    const { urlVideo, videoOwnerId } = JSON.parse(
      arg.value
    ) as ExternalVideoObject;

    updateExternalVideoState({
      ...externalVideo,
      isVideoPlaying: false,
      videoOwnerId,
      urlVideo,
      videoOnRoom: true,
    });
    updateMainViewState({
      mode: MAIN_VIEW_MODE.VIDEO,
      locked: MAIN_VIEW_LOCKED_TYPE.ALL_USERS,
    });
  }

  function pauseExternalVideo(arg: Command) {
    const { remoteInstanceId, videoCurrentTime } = JSON.parse(
      arg.value
    ) as ExternalVideoObject;
    remotePlayer.value = videojs(remoteInstanceId as string);
    if (!userMe.isVideoOwner) {
      void remotePlayer.value.currentTime(videoCurrentTime as number);
      void remotePlayer.value.pause();
    }
  }

  function removeExternalVideo(arg: Command) {
    const { remoteInstanceId } = JSON.parse(arg.value) as ExternalVideoObject;
    remotePlayer.value = {} as videojs.Player;
    videojs(remoteInstanceId as string).dispose();
    updateMainViewState({
      mode: MAIN_VIEW_MODE.NONE,
      locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
    });
    updateExternalVideoState({
      ...externalVideo,
      videoOnRoom: false,
      urlVideo: '',
      isVideoPlaying: false,
      videoCurrentTime: 0,
      remoteInstanceId: '',
    });
    successMessage('Video externo removido');
  }

  function updateExternalVideoCurrentTime(arg: Command) {
    const { remoteInstanceId, videoCurrentTime } = JSON.parse(
      arg.value
    ) as ExternalVideoObject;
    if (remoteInstanceId) {
      if (!userMe.isVideoOwner) {
        remotePlayer.value = videojs(remoteInstanceId);
        remotePlayer.value.currentTime(videoCurrentTime as number);
      }
    }
  }

  function playExternalVideo(arg: Command) {
    const { remoteInstanceId, videoCurrentTime } = JSON.parse(
      arg.value
    ) as ExternalVideoObject;
    remotePlayer.value = videojs(remoteInstanceId as string);
    if (!userMe.isVideoOwner) {
      void remotePlayer.value.currentTime(videoCurrentTime as number);
      void remotePlayer.value.play();
    }
  }

  function requestVideoCurrentTime(arg: Command) {
    const { from, to: videoOwner } = JSON.parse(arg.value) as BaseData;
    if (userMe.id == videoOwner) {
      // como owner, reenvio mi externalvideo Object al from
      sendNotification('UPDATE_REQUEST_VIDEO_TIME', {
        value: JSON.stringify({
          from: userMe.id,
          to: from,
          externalVideoID: externalVideo.remoteInstanceId,
          currentTime: externalVideo.videoCurrentTime,
          isPlaying: externalVideo.isVideoPlaying,
        }),
      });
    }
  }

  function updateRequestVideoTime(arg: Command) {
    const {
      to: requester,
      externalVideoID,
      currentTime,
      isPlaying,
    } = JSON.parse(arg.value) as ExternalVideoRequest;
    if (userMe.id == requester) {
      remotePlayer.value = videojs(externalVideoID);
      if (!isPlaying) {
        void remotePlayer.value.pause();
      }
      remotePlayer.value.currentTime(currentTime);
    }
  }

  function pinUserForAllParticipants(arg: Command) {
    const { startedBy, pinnedUsers, mode, locked } = JSON.parse(
      arg.value
    ) as MainViewState;
    if (userMe.id !== startedBy) {
      const pinnedUsersNew = pinnedUsers.filter((id) => id !== userMe.id);
      updateMainViewState({
        mode,
        locked,
        pinnedUsers: pinnedUsersNew,
        startedBy,
      });
    }
  }

  function updateBackgroundImageOfCooperate(arg: Command) {
    const { url } = JSON.parse(arg.value) as backgroundInfo;
    updateBgUrl(url);
  }

  function updateBgImageSizeOfCooperate(arg: Command) {
    const { maximized } = JSON.parse(arg.value) as backgroundSize;
    updateBgSize(maximized);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function requestRoomState(_arg: Command) {
    if (userMe.isHost) {
      if (externalVideo.videoOnRoom) {
        sendNotification('SEND_ROOM_INFO', {
          value: JSON.stringify(externalVideo),
          attributes: { type: 'video' },
        });
      }
    }
  }

  function receiveRoomInfo(arg: Command) {
    const {
      urlVideo,
      videoOwnerId,
      remoteInstanceId,
      videoCurrentTime,
      isVideoPlaying,
    } = JSON.parse(arg.value) as ExternalVideoObject;
    const infoType = arg.attributes?.type;
    if (infoType == 'video') {
      initExternalVideo({
        value: JSON.stringify({
          urlVideo,
          videoOwnerId,
        }),
      });
      setTimeout(() => {
        void videojs(remoteInstanceId as string).currentTime(
          videoCurrentTime as number
        );
        if (!isVideoPlaying) {
          void videojs(remoteInstanceId as string).pause();
        }
      }, 700);
    }
  }

  function moderatorEndsCall(arg: Command) {
    const { moderatorID } = JSON.parse(arg.value) as EndCallAttrs;
    if (userMe.id !== moderatorID) {
      window.xprops?.handleLeaveCall?.(
        REASON_TO_LEAVE_ROOM.KICKED_BY_MODERATOR_CLOSE_ROOM
      );
    }
  }

  function initRecord() {
    room
      .startRecording({
        openBridgeChannel: true,
        mode: 'file',
        appData: null,
      })
      .then((info) => {
        const parseInfo = info as RecordConference;
        console.log('INfo de grbación', info);
        console.log('SESSIONID', parseInfo._sessionID);
        setRecordSessionId(parseInfo._sessionID);
      })
      .catch((error) => console.error(error));
  }
  function finishRecord() {
    room
      .stopRecording(recordSessionID.value)
      .then((info) => {
        console.log('END RECORDING', info);
        window.xprops.handleCooperateKv();
      })
      .catch((error) => console.error(error));
  }

  function onSuccessConnection() {
    console.log('Connected succesfull');
    // init room
    room = connection.initJitsiConference(roomNameTemporal.value, {
      p2p: {
        enabled: false,
      },
    });
    room.on(
      JitsiMeetJS.events.conference.TRACK_ADDED,
      (track: JitsiRemoteTrack) => {
        !track.isLocal() && handleRemoteTracks(track);
      }
    );
    room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, (track) => {
      console.log('REMOVED TRACK', track);
    });
    room.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      onConferenceJoined
    );
    room.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
    room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
    room.on(
      JitsiMeetJS.events.conference.MESSAGE_RECEIVED,
      handleMessageReceived
    );
    room.on(
      JitsiMeetJS.events.conference.KICKED,
      (actor: unknown, reason: string) => {
        console.table({ actor, reason });
      }
    );
    commandsList.forEach((command) => {
      room.addCommandListener(command.name, command.listener);
    });
    updateUserMe({ id: room.myUserId() });
    setUserBackgroundColor(userMe.id);
    room.setDisplayName(JSON.stringify(userMe));
    room.join('');
    void room.setSenderVideoConstraint(720); // Send at most 720p
    void room.setReceiverVideoConstraint(360); // Receive at most 360p for each participant
  }

  function diconnectAll() {
    // apaga room y tracks
    console.log('DESCONEXIÓN DISCONECTALL');
    localTracks.value.forEach((track) => {
      track.dispose();
    });
    if (room) void room.leave();

    if (connection) void connection.disconnect();
  }

  const stablisConnection = (roomName: string) => {
    roomNameTemporal.value = roomName;
    const jitsiOptions = { ...options };
    jitsiOptions.serviceUrl = `${jitsiOptions.serviceUrl}?room=${roomName}`;
    // jitsiOptions.websocketKeepAliveUrl = `${jitsiOptions.websocketKeepAliveUrl}?room=${roomName}`;
    connection = new JitsiMeetJS.JitsiConnection(
      '',
      null,
      jitsiOptions
    ) as JitsiConnectionRemake;
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      onSuccessConnection
    );
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      () => {
        console.log('The connection failed.');
        setErrorType(ERRORS.RELOAD);
      }
    );
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      diconnectAll
    );

    connection.connect({});
    getLocalTracks();
  };

  return {
    stablisConnection,
    diconnectAll,
    turnOnLocalMic,
    turnOffLocalMic,
    turnOnLocalCamera,
    turnOffLocalCamera,
    sendNotification,
    roomAddTrack,
    updateRoomJitsi,
    sendChatMessage,
    getLocalTracks,
    testReplaceAudio,
    kickParticipantFromRoom,
    replaceLocalTrack,
    updateJitsiParticipant,
    initRecord,
    finishRecord,
  };
}
