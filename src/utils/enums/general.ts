export enum REASON_TO_LEAVE_ROOM {
  BY_MYSELF,
  KICKED_BY_MODERATOR_CLOSE_ROOM,
  I_CLOSE_ROOM,
  JUST_LEAVE,
}

export enum LOCK_ACTION_TYPE {
  'All',
  'Mic',
  'Camera',
  'Screen',
}

export enum INTERACTION_TYPE_MENU_OPTIONS {
  LEAVE = 'LEAVE',
  END = 'END',
  RETRANSMISSION = 'RETRANSMISSION',
  SAVECHAT = 'SAVECHAT',
  CLEARCHAT = 'CLEARCHAT',
  COPYCHAT = 'COPYCHAT',
  ROOMDETAILS = 'ROOMDETAILS',
  EXTERNALVIDEO = 'EXTERNALVIDEO',
}

export enum INTERACTION_TYPE_MENU_BAR {
  CHAT = 'CHAT',
  HANDUP = 'HANDUP',
  SHARESCREEN = 'SHARESCREEN',
  SHARENOTES = 'SHARENOTES',
  USERLIST = 'USERLIST',
  CONNECTION = 'CONNECTION',
  WEBCAM = 'WEBCAM',
  MIC = 'MIC',
  MINIMIZE = 'MINIMIZE',
}
export enum BEHAVIOUR_TYPE_MENU_BAR {
  NORMAL = 'NORMAL',
  ESPECIAL = 'ESPECIAL',
}
