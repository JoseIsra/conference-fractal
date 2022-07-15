import { reactive } from 'vue';
import { MainViewState } from '@/types';
import { useInitWebRTC } from './antMedia';
import _ from 'lodash';
import { MAIN_VIEW_LOCKED_TYPE, MAIN_VIEW_MODE, LAYOUT } from '@/utils/enums';
import { useUserMe } from '@/composables/userMe';
import { useRoom } from '@/composables/room';
import { useLayout } from './layout';

import { Screen } from 'quasar';
const { sendData } = useInitWebRTC();
const { roomState } = useRoom();
const { userMe } = useUserMe();
const { setNewLayout } = useLayout();

let mainViewState = reactive<MainViewState>({
  mode: MAIN_VIEW_MODE.NONE,
  pinnedUsers: [],
  locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
  startedBy: '',
});
export function useMainView() {
  const setMainViewState = (fields: MainViewState) => {
    mainViewState = { ...fields };
  };

  const updateMainViewState = (fields: Partial<MainViewState>) => {
    let clonedMainView = _.clone(mainViewState);
    clonedMainView = { ...clonedMainView, ...fields } as MainViewState;
    Object.assign(mainViewState, clonedMainView);
  };

  const cleanMainViewState = () => {
    mainViewState = {
      mode: MAIN_VIEW_MODE.NONE,
      pinnedUsers: [],
      locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
      startedBy: '',
    };
  };

  const updateMainViewStateForAll = (fields: Partial<MainViewState>) => {
    let clonedMainView = _.clone(mainViewState);
    clonedMainView = { ...clonedMainView, ...fields } as MainViewState;
    Object.assign(mainViewState, clonedMainView);
    /*  */
    sendData(roomState.hostId, {
      eventType: 'SET_FULL_SCREEN',
      mainViewState,
    });
  };

  const cleanMainViewStateForAll = () => {
    mainViewState = {
      mode: MAIN_VIEW_MODE.NONE,
      pinnedUsers: [],
      locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
      startedBy: '',
    };
    /*  */
    sendData(roomState.hostId, {
      eventType: 'SET_FULL_SCREEN',
      mainViewState,
    });
  };

  const addPinnedUser = (userId: string) => {
    const currentPinnedUsers = _.clone(mainViewState?.pinnedUsers);
    currentPinnedUsers?.push(userId);
    if (mainViewState?.mode === MAIN_VIEW_MODE.USER) {
      updateMainViewState({ pinnedUsers: currentPinnedUsers });
    } else {
      updateMainViewState({
        mode: MAIN_VIEW_MODE.USER,
        pinnedUsers: [userId],
        locked: MAIN_VIEW_LOCKED_TYPE.ANYONE,
        startedBy: userMe.id,
      });
    }
    if (Screen.lt.md) {
      setNewLayout(LAYOUT.ROW_LAYOUT);
    }
  };

  const removePinnedUser = (userId: string) => {
    const currentPinnedUsers = _.clone(mainViewState?.pinnedUsers);
    const index = currentPinnedUsers?.indexOf(userId);
    if (index > -1) {
      currentPinnedUsers?.splice(index, 1);
      if (currentPinnedUsers?.length === 0) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.NONE,
          locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
          pinnedUsers: currentPinnedUsers,
          startedBy: '',
        });
      } else {
        updateMainViewState({ pinnedUsers: currentPinnedUsers });
      }
    }
  };

  const addPinnedUserForAll = (userId: string) => {
    const currentPinnedUsers = _.clone(mainViewState?.pinnedUsers);
    currentPinnedUsers?.push(userId);
    if (mainViewState?.mode === MAIN_VIEW_MODE.USER) {
      updateMainViewState({ pinnedUsers: currentPinnedUsers });
    } else {
      updateMainViewState({
        mode: MAIN_VIEW_MODE.USER,
        pinnedUsers: [userId],
        locked: MAIN_VIEW_LOCKED_TYPE.NORMAL_USERS,
        startedBy: userMe.id,
      });
    }
  };

  const removePinnedUserForAll = (userId: string) => {
    const currentPinnedUsers = _.clone(mainViewState?.pinnedUsers);
    const index = currentPinnedUsers?.indexOf(userId);
    if (index > -1) {
      currentPinnedUsers?.splice(index, 1);

      if (currentPinnedUsers?.length === 0) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.NONE,
          locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
          startedBy: '',
          pinnedUsers: currentPinnedUsers,
        });
      } else {
        updateMainViewState({ pinnedUsers: currentPinnedUsers });
      }
    }
    /*  */
    sendData(roomState.hostId, {
      eventType: 'SET_FULL_SCREEN',
      mainViewState,
    });
  };

  const setBoardState = (state: boolean) => {
    if (state) {
      updateMainViewState({
        mode: MAIN_VIEW_MODE.BOARD,
        locked: MAIN_VIEW_LOCKED_TYPE.ALL_USERS,
      });
    } else {
      if (Number(mainViewState?.pinnedUsers.length) > 0) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.USER,
          locked: MAIN_VIEW_LOCKED_TYPE.ANYONE,
        });

        return;
      }

      updateMainViewState({
        mode: MAIN_VIEW_MODE.NONE,
        locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
      });
    }
  };
  return {
    mainViewState,
    setMainViewState,
    updateMainViewState,
    cleanMainViewState,
    addPinnedUser,
    removePinnedUser,
    updateMainViewStateForAll,
    addPinnedUserForAll,
    removePinnedUserForAll,
    cleanMainViewStateForAll,
    setBoardState,
  };
}
