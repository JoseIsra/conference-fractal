import JitsiLocalTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack';
import JitsiConference from '@solyd/lib-jitsi-meet/dist/esm/JitsiConference';
import JitsiConnection from '@solyd/lib-jitsi-meet/dist/esm/JitsiConnection';

export type JitsiLocalTrackImprove = JitsiLocalTrack & { stream?: MediaStream };

export type Track = Record<string, HTMLElement>;
interface CommandAttributes {
  type: string;
}
export interface Command {
  value: string;
  attributes?: CommandAttributes;
  children?: Command[];
}

export type JitsiConferenceRemake = Omit<
  JitsiConference,
  'addCommandListener'
> & {
  addCommandListener: (
    command: string,
    handler: (arg: Command) => void
  ) => void;
};

type JitsiConferenceOptions = {
  // TODO:
};

export type JitsiConnectionRemake = Omit<
  JitsiConnection,
  'initJitsiConference'
> & {
  initJitsiConference: (
    name: string,
    options: JitsiConferenceOptions
  ) => JitsiConferenceRemake;
};

export interface RecordConference {
  _sessionID: string;
}
