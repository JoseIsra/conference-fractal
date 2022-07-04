import {
  INTERACTION_TYPE_MENU_BAR,
  BEHAVIOUR_TYPE_MENU_BAR,
} from '@/utils/enums';

export const iconsPeriferics = {
  mic: {
    id: '1',
    onState: 'mic',
    offState: 'mic_off',
    loadingState: 'fas fa-spinner',
    toolTipMessage: 'Encender micrófono',
    toolTipSecondMessage: 'Silenciar micrófono',
    interaction: INTERACTION_TYPE_MENU_BAR.MIC,
  },
  camera: {
    id: '2',
    onState: 'videocam',
    offState: 'videocam_off',
    loadingState: 'fas fa-spinner',
    toolTipMessage: 'Habilitar webcam',
    toolTipSecondMessage: 'Deshabilitar webcam',
    interaction: INTERACTION_TYPE_MENU_BAR.WEBCAM,
  },
};

export const iconsFunctions = {
  screenShare: {
    id: '1',
    onState: 'monitor',
    offState: 'desktop_access_disabled',
    loadingState: 'fas fa-spinner',
    toolTipMessage: 'Compartir pantalla',
    toolTipSecondMessage: 'Dejar de compartir pantalla',
    interaction: INTERACTION_TYPE_MENU_BAR.SHARESCREEN,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.NORMAL,
  },
  hand: {
    id: '2',
    onState: 'pan_tool',
    offState: 'pan_tool',
    toolTipMessage: 'Levantar la mano',
    toolTipSecondMessage: 'Bajar la mano',
    interaction: INTERACTION_TYPE_MENU_BAR.HANDUP,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.ESPECIAL,
  },
  users: {
    id: '3',
    onState: 'person',
    offState: 'person',
    toolTipMessage: 'Lista de usuarios',
    toolTipSecondMessage: 'Ocultar lista de usuarios',
    interaction: INTERACTION_TYPE_MENU_BAR.USERLIST,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.NORMAL,
  },
  chat: {
    id: '4',
    onState: 'far fa-comments',
    offState: 'far fa-comments',
    toolTipMessage: 'Chat',
    toolTipSecondMessage: 'Ocultar chat',
    interaction: INTERACTION_TYPE_MENU_BAR.CHAT,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.NORMAL,
  },
  minimize: {
    id: '5',
    onState: 'branding_watermark',
    offState: 'branding_watermark',
    toolTipMessage: 'Minimizar',
    toolTipSecondMessage: 'Minimizar',
    interaction: INTERACTION_TYPE_MENU_BAR.MINIMIZE,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.ESPECIAL,
  },
  /* {
    id: '5',
    onState: 'description',
    offState: 'description',
    active: false,
    toolTipMessage: 'Notas compartidas',
    toolTipSecondMessage: 'Notas compartidas',
    interaction: interactionType.SHARENOTES,
    behaviour: typeOfBehaviour.NORMAL
  }, */
  /* {
    id: '6',
    onState: 'signal_cellular_alt',
    offState: 'signal_cellular_alt',
    active: false,
    toolTipMessage: 'Estado de la conexión',
    toolTipSecondMessage: 'Estado de la conexión',
    interaction: interactionType.CONNECTION,
    behaviour: typeOfBehaviour.NORMAL
  }, */
};

export const iconsOptions = [
  // {
  //   id: '1',
  //   onState: 'fas fa-cog',
  //   offState: 'fas fa-cog',
  //   active: false,
  //   toolTipMessage: 'Acciones',
  //   ubication: 'actions',
  // },
  {
    id: '2',
    onState: 'more_vert',
    offState: 'more_vert',
    active: false,
    toolTipMessage: 'Opciones',
    ubication: 'options',
  },
];
