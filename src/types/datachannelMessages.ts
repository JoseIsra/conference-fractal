import { Room, User, MainViewState } from '@/types';
export interface BaseMessage {
  streamId: string;
  data: string;
}

export interface BaseData {
  from: string;
  to: string;
  eventType: string;
}

export interface Message extends BaseData {
  id: string;
  streamId: string;
  date: string;
  streamName: string;
  eventType: string;
  content: string | Blob;
  avatar: string;
  typeMessage: string;
  fileType?: string;
  fileName?: string;
}

export interface Notification extends BaseData {
  streamId: string;
  notificationType: string;
}

export interface HandNotification extends BaseData {
  id: string;
  streamName: string;
}

export interface stopPlayingStream extends BaseData {
  streamToPause: string;
}

/*  */
interface ObjInfoRequested {
  to: string;
  from: string;
}

export interface ObjRemoteUserInfo extends ObjInfoRequested {
  eventType: string;
  userInfo: User;
  participantsInRoom: User[];
  externalVideoInfo?: ExternalVideoObject;
  boardInfo?: string;
  roomInfo: Room;
  mainViewState: MainViewState;
}

export interface ObjKickedEvent {
  eventType: string;
  to: string;
}

export interface VideoID {
  playerId: string;
}

export interface ExternalVideoObject {
  eventType?: string;
  urlVideo?: string;
  remoteInstanceId?: string;
  videoCurrentTime?: number;
  fullScreenMode?: boolean;
  videoOnRoom?: boolean;
  isVideoPlaying?: boolean;
  videoOwnerId?: string;
}

export interface ObjBlockParticipantAction {
  streamId: string;
  participantId: string;
  eventType: string;
  action: number;
  locked: boolean;
}

export interface ObjBlockEveryoneAction {
  id: string;
  streamId: string;
  eventType: string;
  action: number;
  value: boolean;
}

export interface ObjAnswerPermission {
  id: string;
  participantId: string;
  eventType: string;
  value: boolean;
}

export interface ObjSetFullScreen {
  id: string;
  eventType: string;
  mode: string;
  participant: User;
}

export interface backgroundInfo {
  id: string;
  url: string;
}

export interface backgroundSize {
  maximized: boolean;
}

export interface ObjUserLeavingMessageParsed {
  id: string;
  fractalUserId: string;
  userId: string;
}

export interface ObjRecordingStopParsed {
  state: Record<string, string>;
}

export interface ObjBoardEvent {
  event: number;
  objects?: string;
  color?: string;
}

export interface ExternalVideoRequest extends BaseData {
  externalVideoID: string;
  currentTime: number;
  isPlaying: boolean;
}

export type LockActionsObject = Pick<
  ObjBlockParticipantAction,
  'streamId' | 'participantId' | 'action'
>;
export type LockActionsData = Pick<
  ObjBlockParticipantAction,
  'streamId' | 'action'
>;

export interface EndCallAttrs {
  moderatorID: string;
}
