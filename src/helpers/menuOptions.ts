import { INTERACTION_TYPE_MENU_OPTIONS } from '@/utils/enums';

export interface Options {
  id: string;
  iconName: string;
  description: string;
  secondDescription?: string;
  important: boolean;
  interaction?: string;
  active?: boolean;
  admin?: boolean;
}

export interface MenuOptions {
  firstSection: Options[];
  secondSection: Options[];
  thirdSection: Options[];
  fourthSection: Options[];
}

export const menuOptions = {
  firstSection: [
    {
      id: '1',
      iconName: 'fas fa-cog',
      description: 'Panel de administrador',
      important: false,
      admin: true,
      interaction: INTERACTION_TYPE_MENU_OPTIONS.ADMIN_PANEL,
    },
    /*
     */
    // {
    //   id: '2',
    //   iconName: 'settings',
    //   description: 'Configuración de dispositivos',
    //   important: false,
    //   interaction: INTERACTION_TYPE_MENU_OPTIONS.DEVICECONFIGURATION,
    // },
  ],
  secondSection: [
    {
      id: '4',
      iconName: 'edit',
      description: 'Mostrar pizarra',
      secondDescription: 'Ocultar pizarra',
      important: false,
      interaction: INTERACTION_TYPE_MENU_OPTIONS.BOARD,
    },
  ],
  thirdSection: [
    {
      id: '5',
      iconName: 'grid_view',
      description: 'Vista 1',
      important: false,
      interaction: INTERACTION_TYPE_MENU_OPTIONS.DEFAULT_LAYOUT,
    },
    {
      id: '6',
      iconName: 'more_horiz',
      description: 'Vista 2',
      important: false,
      interaction: INTERACTION_TYPE_MENU_OPTIONS.PRESENTATION_LAYOUT,
    },
    /* 
    {
      id: '7',
      iconName: 'call_to_action',
      description: 'Vista 3',
      important: false,
    },
    {
      id: '8',
      iconName: 'call_to_action',
      description: 'Vista 4',
      important: false,
    }, */
  ],
  fourthSection: [
    {
      id: '9',
      iconName: 'call_end',
      description: 'Finalizar reunión',
      important: true,
      interaction: INTERACTION_TYPE_MENU_OPTIONS.END,
      admin: true,
    },
    {
      id: '10',
      iconName: 'logout',
      description: 'Abandonar la reunión',
      important: true,
      interaction: INTERACTION_TYPE_MENU_OPTIONS.LEAVE,
      admin: false,
    },
  ],
};

export const chatMenuIcon = [
  // {
  //   id: '1',
  //   iconName: 'save',
  //   description: 'Guardar chat',
  //   important: false,
  //   interaction: interactionType.SAVECHAT,
  // },
  // {
  //   id: '2',
  //   iconName: 'content_copy',
  //   description: 'Copiar chat',
  //   important: false,
  //   interaction: interactionType.COPYCHAT,
  // },
  {
    id: '3',
    iconName: 'delete',
    description: 'Borrar todos los mensajes solo para mí',
    important: false,
    interaction: INTERACTION_TYPE_MENU_OPTIONS.CLEARCHAT,
  },
];

export const adminPanelOptions = [
  {
    id: '1',
    description: 'General',
    iconName: 'fas fa-cog',
    important: false,
  },
  {
    id: '2',
    description: 'Administrador',
    iconName: 'toggle_on',
    important: false,
  },
  // {
  //   id: '3',
  //   description: 'Retransmisión',
  //   iconName: 'live_tv',
  //   important: false,
  // },
  // {
  //   id: '4',
  //   description: 'Pizarra',
  //   iconName: 'note_alt',
  //   important: false,
  // },
];

export const componentList = [
  {
    id: '1',
    name: 'fu-general-panel',
    respondToOption: 'General',
  },
  {
    id: '2',
    name: 'fu-participant-periferic-panel',
    respondToOption: 'Administrador',
  },
  {
    id: '3',
    name: 'fu-retransmission-panel',
    respondToOption: 'Retransmisión',
  },
  {
    id: '4',
    name: 'fu-board-panel',
    respondToOption: 'Pizarra',
  },
];
