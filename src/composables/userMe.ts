import { reactive, computed, ref } from 'vue';
import { JitsiLocalTrackImprove } from '@/types';
import { User } from '@/types/user';
import { ValueOf } from '@/types';
import _ from 'lodash';

// blocked: some functionalities blocked (mic, screen, camera)
// Role id: 'Admin|0' ; 'participant|1';

const userState = {} as User;

const userMe = reactive<User>(userState);
const localTracks = ref<JitsiLocalTrackImprove[]>([]);
const localAudioTrack = ref({} as HTMLElement);
const localVideoTrack = ref({} as HTMLElement);

userMe.cameraPublishedState = computed(() =>
  userMe.isCameraOn && userMe.isPublishing == 1
    ? 1
    : userMe.isPublishing == 2 && userMe.isCameraOn
    ? 2
    : 0
);

userMe.micPublishedState = computed(() =>
  userMe.isMicOn && userMe.isPublishing == 1
    ? 1
    : userMe.isPublishing == 2 && userMe.isMicOn
    ? 2
    : 0
);

userMe.screenSharingPublishedState = computed(() =>
  userMe.isScreenSharing && userMe.isPublishing == 1
    ? 1
    : userMe.isPublishing == 2 && userMe.isScreenSharing
    ? 2
    : 0
);

export function useUserMe() {
  const setUserMe = (value: User) => {
    _.merge(userState, value);
  };

  const updateUserMe = (value: Partial<User>) => {
    const updatedUser = _.cloneDeep(userMe);
    Object.keys(value).forEach((key: string) => {
      if (
        key != 'cameraPublishedState' &&
        key != 'micPublishedState' &&
        key != 'screenSharingPublishedState'
      ) {
        Object.defineProperty(updatedUser, key, {
          value: value[key as keyof User] as ValueOf<User>,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    });
    _.merge(userMe, updatedUser);
  };

  const setMicState = (value: boolean) => {
    userMe.isMicOn = value;
  };

  const setCameraState = (value: boolean) => {
    userMe.isCameraOn = value;
  };

  const setScreenState = (value: boolean) => {
    userMe.isScreenSharing = value;
  };

  const setLocalMicLocked = (value: boolean) => {
    userMe.isMicBlocked = value;
  };

  const setLocalCameraLocked = (value: boolean) => {
    userMe.isCameraBlocked = value;
  };

  const setLocalScreenSharingLocked = (value: boolean) => {
    userMe.isScreenShareBlocked = value;
  };

  const toggleDrawState = () => {
    userMe.canDraw = !userMe.canDraw;
  };

  // const setCameraDevice = (value: string) => {
  //   userMe.cameraId = value;
  // };

  const setVideoActivatedState = (value: boolean) => {
    userMe.isVideoActivated = value;
  };

  const setDenied = (state: number) => (userMe.denied = state);

  const setLocalTracks = (tracks: JitsiLocalTrackImprove[]) => {
    localTracks.value = tracks;
  };

  const userIsAdmin = () => userMe.roleId == 0;

  return {
    userMe,
    setUserMe,
    setMicState,
    setCameraState,
    setScreenState,
    setVideoActivatedState,
    updateUserMe,
    setLocalMicLocked,
    setLocalCameraLocked,
    setLocalScreenSharingLocked,
    setDenied,
    toggleDrawState,
    localTracks,
    setLocalTracks,
    localAudioTrack,
    localVideoTrack,
    userIsAdmin,
  };
}
