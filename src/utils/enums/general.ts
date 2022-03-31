export enum REASON_TO_LEAVE_ROOM {
  BY_MYSELF,
  KICKED_BY_MODERATOR_CLOSE_ROOM,
  I_CLOSE_ROOM,
  JUST_LEAVE,
  KICKED_BY_MODERATOR,
  BY_HOST_LEFT,
}

export enum USER_ROLE {
  ADMINISTRATOR,
  REGULAR_PARTICIPANT,
}

export enum LOCK_ACTION_TYPE {
  'All',
  'Mic',
  'Camera',
  'Screen',
}

export enum ROOM_PRIVACY {
  'PUBLIC',
  'PRIVATE',
}

export enum PERMISSION_STATUS {
  'asked',
  'admitted',
  'denied',
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
  DEVICECONFIGURATION = 'DEVICECONFIGURATION',
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

export enum BOARD_EVENTS {
  'TURN_ON',
  'TURN_OFF',
  'OBJECT_ADD',
  'OBJECT_UPDATE',
  'OBJECT_REMOVE',
  'CLEAR',
  'TOGGLE_DRAW_MODE',
  'CHANGE_BG_COLOR',
}

export enum MediaType {
  /**
   * The audio type.
   */
  AUDIO = 'audio',
  /**
   * The presenter type.
   */
  PRESENTER = 'presenter',
  /**
   * The video type.
   */
  VIDEO = 'video',
}
