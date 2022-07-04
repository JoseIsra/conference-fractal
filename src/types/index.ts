import { User } from '@/types';

export * from './antmediaApi';
export * from './datachannelMessages';
export * from './mainView';
export * from './room';
export * from './user';
export * from './zoid';
export * from './toggleFunctions';
export * from './periferics';
export * from './jitsi';
export * from './locks';

interface SoundGainType {
  gain: {
    value: number;
  };
}

export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `Date` scalar type represents a date. The Date appears in a JSON
   * response as an ISO8601 formatted string, without a time component.
   */
  Date: Date;
};

export type ValueOf<T> = T[keyof T];

export type Maybe<T> = T | null;

export type B2 = {
  __typename?: 'B2';
  authorizationToken?: Maybe<Scalars['String']>;
  uploadUrl?: Maybe<Scalars['String']>;
};

export interface objWebRTC {
  ATTR_ROOM_NAME: string;
  command: string;
  definition: string;
  room: string;
  streamId: string;
  streams: string[];
  stream: MediaStream;
  event: Record<string, string>;
  data: string;
  user?: User;
}

export interface Icons {
  id: string;
  onState: string;
  offState: string;
  loadingState?: string;
  active: boolean;
  toolTipMessage: string;
  toolTipSecondMessage?: string;
  ubication?: string;
  interaction?: string;
  behaviour?: string;
}

export const regexp = /^(?!\s*$).+/;

export interface WebRTCAdaptorType {
  metodoDePrueba?: () => MediaStream;
  joinRoom?: (roomName: string, streamId: string, mode: string) => void;
  leaveFromRoom?: (roomName: string) => void;
  getRoomInfo?: (roomName: string, publishStreamId: string) => void;
  publish?: (
    streamId: string,
    token?: string,
    subscriberId?: string,
    subscriberCode?: string,
    streamName?: string
  ) => void;
  play?: (
    streamId: string,
    token: string,
    roomId: string,
    subscriberId?: string,
    susbscriberCode?: string
  ) => void;
  stop?: (streamId: string) => void;
  turnOffLocalCamera?: (streamId: string) => void;
  justTurnOnLocalCamera?: (streamId: string) => void;
  turnOnLocalCamera?: (streamId: string) => void;
  sendData?: (publishStreamId: string, notEvent: string) => void;
  switchDesktopCapture?: (publishStreamId: string) => void;
  switchVideoCameraCapture?: (
    publishStreamId: string,
    deviceId: string
  ) => void;
  switchDesktopCaptureWithCamera?: (publishStreamId: string) => void;
  muteLocalMic?: () => void;
  unmuteLocalMic?: () => void;
  currentVolume?: number;
  soundOriginGainNode?: SoundGainType;
  secondStreamGainNode?: SoundGainType;
  switchVideoSource?: (
    streamId: string,
    mediaConstraints: Record<string, string>,
    onEndedCallback: () => void
  ) => void;
  resetDesktop?: () => void;
  gotStream?: (stream: MediaStream) => void;
  getLocalStream?: () => MediaStream;
}

export interface dataType {
  streamId: string;
  message?: string;
  type: string;
}

export interface Periferics {
  WEBCAM: () => void;
  MIC: () => void;
}

export interface Functionalities {
  CHAT: () => void;
  HANDUP?: () => void;
  SHARESCREEN: () => void;
  SHARENOTES?: () => void;
  USERLIST?: () => void;
  CONNECTION?: () => void;
  MINIMIZE?: () => void;
  MIC?: () => void;
  WEBCAM?: () => void;
}

export interface lockAction {
  mic: number;
  camera: number;
  screenshare: number;
}

export interface SocialMedia {
  facebook: string;
  youtube: string;
  rtmp: string;
}

export interface SocialMediaMethod {
  facebook: () => void;
  youtube: () => void;
  rtmp: () => void;
}

export interface IStreamServiceObject extends SocialMedia {
  labelBtn?: SocialMedia;
  iconBtn?: SocialMedia;
  closeTransmissionLabelBtn?: SocialMedia;
  stopStreamingIconBtn?: SocialMedia;
  transmissionMethods?: SocialMediaMethod;
}
