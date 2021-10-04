import { reactive } from 'vue';

export interface Room {
  id: string;
  isBeingRecorded?: boolean;
  sharingLink?: string;
  classroomId: string;
  isMicBlocked: boolean;
  isCameraBlocked: boolean;
  isScreenShareBlocked: boolean;
  privacy: boolean;
  waitList: Array<participantOnWait>;
}

export interface participantOnWait {
  id: string;
  name: string;
}

const roomState = reactive<Room>({} as Room);

export function useRoom() {
  const setRoom = (room: Room) => {
    Object.assign(roomState, room);
  };
  const setRecorded = (state: boolean) => {
    Object.assign(roomState, { ...roomState, isBeingRecorded: state });
  };

  const setPrivacy = (state: boolean) => (roomState.privacy = state);

  const newParticipantOnWait = (participant: participantOnWait) =>
    roomState.waitList.push(participant);

  const removeParticipantOnWait = (participant: participantOnWait) =>
    (roomState.waitList = roomState.waitList.filter(
      (p) => p.id !== participant.id
    ));
  const setRoomMicState = (state: boolean) => (roomState.isMicBlocked = state);

  const setRoomCameraState = (state: boolean) =>
    (roomState.isCameraBlocked = state);

  const setRoomScreenShareState = (state: boolean) =>
    (roomState.isScreenShareBlocked = state);

  return {
    roomState,
    setRoom,
    setRecorded,
    setPrivacy,
    newParticipantOnWait,
    removeParticipantOnWait,
    setRoomMicState,
    setRoomCameraState,
    setRoomScreenShareState,
  };
}
