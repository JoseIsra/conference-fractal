import { lockAction } from './index';

interface B2Info {
  uploadUrl: string;
  authorizationToken: string;
}

export interface BgInfo {
  url: string;
  maximized: boolean;
  allowResetBg: boolean;
}

// export interface boardInfo{
//   board: string;
//   syncData: number;
// }

export interface ZoidProps {
  streamId?: string;
  roomId: string;
  streamName?: string;
  isCameraOn?: boolean;
  publishToken?: string;
  playToken?: string;
  photoURL?: string;
  roleId?: number;
  sharedLink?: string;
  isMicLocked?: boolean;
  isCameraLocked?: boolean;
  isScreenShareLocked?: boolean;
  classroomId?: string;
  isMicOn?: boolean;
  bgInfo?: BgInfo;
  roomRestriction?: number;
  isHost?: boolean;
  hostId?: string;
  setHostId?: (userId: string) => void;
  startDate?: string;
  cameraId?: string;
  micId?: string;
  speakerId: string;
  handleLeaveCall?: (
    arg: number,
    remainingParticipantsFractalUserIds?: string[]
  ) => void;
  handleStopRecording?: (urlOfRecording: string) => void;
  toggleMinimize?: (isMinimize: boolean) => void;
  toggleLockAction?: (states: lockAction) => void;
  fractalUserId?: string;
  logJoined?: (fractalUserId: string) => void;
  handleStartRecording?: () => void;
  getB2Info?: () => Promise<B2Info>;
  setBackgroundInfo?: (url: string, maximized: boolean) => void;
  addUserLogToState?: (fractalUserId: string, logType: number) => void;
  setPinnedUser?: (userId: string) => void;
  pinnedUser?: string;
  logUserExits?: (fractalUserIds: string[]) => void;
  isVisitor?: boolean;
  handleParticipantLeave(): void;
  prejoinView?: boolean;
  miniMode?: boolean;
  onProps?: (cb: (arg: ZoidProps) => void) => void;
  multichat?: boolean;
}
