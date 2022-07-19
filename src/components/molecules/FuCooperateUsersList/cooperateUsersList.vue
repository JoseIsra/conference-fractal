<template>
  <section class="m-list">
    <header class="m-list__title">
      <label class="m-list__title__text">Lista de Usuarios</label>
      <small>En línea ({{ admittedParticipants.length + 1 }})</small>
      <q-btn
        v-show="userMe.roleId === 0 && roomState.roomRestriction != 0"
        :label="
          waitingParticipants.length > 0
            ? `En espera (${waitingParticipants.length})`
            : 'Sin solicitudes'
        "
        :color="waitingParticipants.length > 0 ? 'green' : 'grey'"
        text-color="white"
        icon="fa fa-clock"
        style="margin: 16px 0; text-transform: capitalize"
        @click="toggleParticipantPanel"
      ></q-btn>
      <q-btn
        v-show="$q.screen.lt.sm"
        flat
        round
        icon="close"
        size="15px"
        dense
        class="m-list__title__btn --close"
        @click="closeUserListPanel"
      />
    </header>
    <main class="m-list__content">
      <div class="m-list__content__userBox">
        <aside class="m-list__content__userBox__avatar">
          <q-icon
            v-if="notificateHandUp(userMe.id)"
            name="front_hand"
            class="m-list__content__userBox__avatar__handIcon"
            size="20px"
          />
          <q-img
            v-else
            class="m-list__content__userBox__avatar__image"
            :src="userMe.avatar"
            alt="avatar-logo"
          />

          <!-- HOST - ADMIN  -->

          <q-avatar
            v-show="userMe.roleId === 0"
            class="m-list__content__userBox__avatar__token"
            color="blue-8"
            text-color="white"
            :icon="userMe.isHost ? 'fas fa-crown' : 'fas fa-user-shield'"
            size="18px"
          />
        </aside>

        <div class="m-list__content__userBox__name">{{ userMe.name }} (Tú)</div>
        <!-- <div class="m-list__content__userBox__actions">
          <q-list v-if="isAdmin">
            <div class="m-list__content__userBox__extra">
              <q-btn
                :icon="
                  mainViewState.pinnedUsers.includes(userMe.id)
                    ? 'location_disabled'
                    : 'gps_fixed'
                "
                @click="
                  mainViewState.pinnedUsers.includes(userMe.id)
                    ? unpinUserFromTheRoom(userMe.id)
                    : pinUserToTheRoom(userMe.id)
                "
                color="primary"
                text-color="white"
                :disable="
                  mainViewState.locked === MAIN_VIEW_LOCKED_TYPE.ANYONE ||
                  (mainViewState.pinnedUsers.length >= 4 &&
                    !mainViewState.pinnedUsers.includes(userMe.id))
                "
              >
                <q-tooltip
                  class="bg-grey-10"
                  anchor="bottom middle"
                  self="top middle"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <label v-if="mainViewState.pinnedUsers.includes(userMe.id)">
                    Desfijarme</label
                  >
                  <label v-else> Fijar para todos</label>
                </q-tooltip>
              </q-btn>

              <q-btn
                :icon="
                  mainViewState.pinnedUsers.includes(userMe.id)
                    ? 'location_disabled'
                    : 'gps_fixed'
                "
                @click="
                  mainViewState.pinnedUsers.includes(userMe.id)
                    ? removePinnedUser(userMe.id)
                    : addPinnedUser(userMe.id)
                "
                :disable="
                  (mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
                    mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET) ||
                  (mainViewState.pinnedUsers.length >= 4 &&
                    !mainViewState.pinnedUsers.includes(userMe.id))
                "
              >
                <q-tooltip class="bg-grey-10">
                  <label v-if="mainViewState.pinnedUsers.includes(userMe.id)"
                    >Desfijarme
                  </label>
                  <label v-else>Fijar a mi mismo</label>
                </q-tooltip>
              </q-btn>
            </div>
          </q-list>
        </div> -->
      </div>
      <div
        class="m-list__content__userBox"
        v-for="participant in admittedParticipants"
        :key="participant.id"
      >
        <aside class="m-list__content__userBox__avatar">
          <q-btn
            v-if="notificateHandUp(participant.id)"
            class="m-list__content__userBox__avatar__iconBox"
            round
            push
            :ripple="false"
            v-on="
              userMe.roleId == 0
                ? { click: () => removeHandUp(participant.id) }
                : {}
            "
          >
            <q-icon
              name="front_hand"
              size="20px"
              class="m-list__content__userBox__avatar__handIcon"
            />
            <q-tooltip class="bg-grey-10" v-if="userMe.roleId == 0">
              Bajar mano</q-tooltip
            >
          </q-btn>
          <q-img
            v-else
            class="m-list__content__userBox__avatar__image"
            :src="participant.avatar"
            alt="avatar-logo"
          />

          <q-avatar
            v-show="participant.roleId !== 1"
            class="m-list__content__userBox__avatar__token"
            color="blue-8"
            text-color="white"
            :icon="participant.isHost ? 'fas fa-crown' : 'fas fa-user-shield'"
            size="18px"
          />
        </aside>
        <div class="m-list__content__userBox__name">{{ participant.name }}</div>

        <div
          class="m-list__content__userBox__actions"
          v-if="userMe.roleId === 0"
        >
          <q-btn
            :icon="participant.isMicOn ? 'mic' : 'mic_off'"
            :color="
              participant.isMicOn
                ? 'blue'
                : participant.isMicBlocked
                ? 'red'
                : ''
            "
            @click="lockParticipantActions(participant, LOCK_ACTION_TYPE.Mic)"
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label>{{ participantActionsToolTip(1, participant) }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="participant.isCameraOn ? 'videocam' : 'videocam_off'"
            :color="
              participant.isCameraOn
                ? 'blue'
                : participant.isCameraBlocked
                ? 'red'
                : ''
            "
            @click="
              lockParticipantActions(participant, LOCK_ACTION_TYPE.Camera)
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label>{{ participantActionsToolTip(2, participant) }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="
              participant.isScreenSharing
                ? 'desktop_windows'
                : 'desktop_access_disabled'
            "
            :color="
              participant.isScreenSharing
                ? 'blue'
                : participant.isScreenShareBlocked
                ? 'red'
                : ''
            "
            @click="
              lockParticipantActions(participant, LOCK_ACTION_TYPE.Screen)
            "
          >
            <!-- :disable="lockParticipantsScreen(participant)" -->
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label>{{ participantActionsToolTip(3, participant) }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn icon="fas fa-ellipsis-h" v-if="userMe.roleId === 0">
            <q-menu :offset="[60, 12]">
              <q-list>
                <div class="m-list__content__userBox__extra">
                  <q-btn
                    :icon="
                      mainViewState.pinnedUsers.includes(participant.id)
                        ? 'location_disabled'
                        : 'gps_fixed'
                    "
                    @click="
                      mainViewState.pinnedUsers.includes(participant.id)
                        ? unpinUserFromTheRoom(participant.id)
                        : pinUserToTheRoom(participant.id)
                    "
                    color="primary"
                    text-color="white"
                    :disable="
                      mainViewState.locked === MAIN_VIEW_LOCKED_TYPE.ANYONE ||
                      (mainViewState.pinnedUsers.length >= 4 &&
                        !mainViewState.pinnedUsers.includes(participant.id))
                    "
                  >
                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label
                        v-if="
                          mainViewState.pinnedUsers.includes(participant.id)
                        "
                      >
                        Desfijar para todos</label
                      >
                      <label v-else> Fijar para todos</label>
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    :icon="
                      mainViewState.pinnedUsers.includes(participant.id)
                        ? 'location_disabled'
                        : 'gps_fixed'
                    "
                    @click="
                      mainViewState.pinnedUsers.includes(participant.id)
                        ? removePinnedUser(participant.id)
                        : addPinnedUser(participant.id)
                    "
                    :disable="
                      (mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
                        mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET) ||
                      (mainViewState.pinnedUsers.length >= 4 &&
                        !mainViewState.pinnedUsers.includes(participant.id))
                    "
                  >
                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label
                        v-if="
                          mainViewState.pinnedUsers.includes(participant.id)
                        "
                      >
                        Desfijar para mi</label
                      >
                      <label v-else>Fijar para mi</label>
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="participant.roleId === 1"
                    v-show="mainViewState.mode === MAIN_VIEW_MODE.BOARD"
                    icon="draw"
                    :color="participant.canDraw ? 'blue' : 'red'"
                    text-color="white"
                    @click="toggleDrawMode(participant)"
                  >
                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label v-if="participant.canDraw"
                        >Dibujar habilitado</label
                      >
                      <label v-else>Dibujar deshabilitado</label>
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    icon="fas fa-sign-out-alt"
                    @click="handleKickParticipant(participant)"
                    color="red"
                    text-color="white"
                  >
                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label>Echar de la sala</label>
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-list>
            </q-menu>

            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label>Opciones</label>
            </q-tooltip>
          </q-btn>
        </div>

        <div v-else class="m-list__content__userBox__actions">
          <q-btn
            :class="[
              'm-list__content__userBox__actions__button',
              { '--noActionable': temporalRoleConditional },
            ]"
            :icon="participant.isMicOn ? 'mic' : 'mic_off'"
            :color="
              participant.isMicOn
                ? 'blue'
                : participant.isMicBlocked
                ? 'red'
                : ''
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label>{{
                participant.isMicOn
                  ? 'Micrófono encendido'
                  : 'Micrófono apagado'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :class="[
              'm-list__content__userBox__actions__button',
              { '--noActionable': temporalRoleConditional },
            ]"
            :icon="participant.isCameraOn ? 'videocam' : 'videocam_off'"
            :color="
              participant.isCameraOn
                ? 'blue'
                : participant.isCameraBlocked
                ? 'red'
                : ''
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="">{{
                participant.isCameraOn ? 'Cámara encendida' : 'Cámara apagada'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :class="[
              'm-list__content__userBox__actions__button',
              { '--noActionable': temporalRoleConditional },
            ]"
            :icon="
              participant.isScreenSharing
                ? 'desktop_windows'
                : 'desktop_access_disabled'
            "
            :color="
              participant.isScreenSharing
                ? 'blue'
                : participant.isScreenShareBlocked
                ? 'red'
                : ''
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="">{{
                participant.isScreenSharing
                  ? 'Compartir pantalla activo'
                  : 'Compartir pantalla inactivo'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="
              mainViewState.pinnedUsers.includes(participant.id)
                ? 'location_disabled'
                : 'gps_fixed'
            "
            @click="
              mainViewState.pinnedUsers.includes(participant.id)
                ? removePinnedUser(participant.id)
                : addPinnedUser(participant.id)
            "
            :disable="
              (mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
                mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET) ||
              (mainViewState.pinnedUsers.length >= 4 &&
                !mainViewState.pinnedUsers.includes(participant.id))
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label v-if="mainViewState.pinnedUsers.includes(participant.id)">
                Desfijar para mi</label
              >
              <label v-else>Fijar para mi</label>
            </q-tooltip>
          </q-btn>
        </div>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import {
  useHandleParticipants,
  useUserMe,
  useSidebarToogle,
  useToogleFunctions,
  useRoom,
  useInitWebRTC,
  useMainView,
} from '@/composables';
import { useLockParticipantActions } from '@/composables/lockActions';
import { useJitsi } from '@/composables/jitsi';
import { User } from '@/types';
import {
  MAIN_VIEW_LOCKED_TYPE,
  MAIN_VIEW_MODE,
  LOCK_ACTION_TYPE,
  USER_ROLE,
  BOARD_EVENTS,
} from '@/utils/enums';

export default defineComponent({
  name: 'FuCooperateUsersList',
  setup() {
    const {
      mainViewState,
      addPinnedUser,
      removePinnedUser,
      addPinnedUserForAll,
      removePinnedUserForAll,
    } = useMainView();
    const { waitingParticipants, admittedParticipants, updateParticipantById } =
      useHandleParticipants();

    const { toggleParticipantPanel, setSidebarState } = useSidebarToogle();

    const { userMe } = useUserMe();

    const { sendData } = useInitWebRTC();

    const { roomState } = useRoom();
    const { lockActionsAllowed } = useLockParticipantActions();

    const { functionsOnMenuBar } = useToogleFunctions();
    const { sendNotification } = useJitsi();

    const isEveryoneMicBlocked = computed(() => roomState.isMicBlocked);

    const isEveryoneVideoBlocked = computed(() => roomState.isCameraBlocked);
    const temporalRoleConditional = computed(
      () => userMe.roleId == 0 || userMe.roleId == 1
    );
    const isEveryoneScreenShareBlocked = computed(
      () => roomState.isScreenShareBlocked
    );

    const isEveryoneActionsBlocked = computed(
      () =>
        isEveryoneMicBlocked.value &&
        isEveryoneVideoBlocked.value &&
        isEveryoneScreenShareBlocked.value
    );

    const isAdmin = computed(() => {
      return userMe.roleId === USER_ROLE.ADMINISTRATOR;
    });

    const isMicBlocked = (participant: Partial<User>) =>
      admittedParticipants.value.find((part) => part.id === participant.id)
        ?.isMicBlocked === true;

    const isCameraBlocked = (participant: Partial<User>) =>
      admittedParticipants.value.find((part) => part.id === participant.id)
        ?.isCameraBlocked === true;

    const isScreenShareBlocked = (participant: Partial<User>) =>
      admittedParticipants.value.find((part) => part.id === participant.id)
        ?.isScreenShareBlocked === true;

    const lockParticipantActions = (participant: User, action: number) => {
      if (participant.roleId === USER_ROLE.ADMINISTRATOR) {
        return;
      }

      const lockData = {
        streamId: userMe.id,
        participantId: participant.id,
        action: action,
      };
      const lockAction = lockActionsAllowed.get(action);
      lockAction && lockAction(participant, action, lockData);
    };

    const participantActionsToolTip = (
      action: number,
      participant: Partial<User>
    ) => {
      if (participant.roleId === USER_ROLE.REGULAR_PARTICIPANT) {
        switch (action) {
          case 1:
            return participant.isMicOn
              ? 'Microfono Encendido'
              : participant.isMicBlocked
              ? 'Desbloquear Microfono'
              : 'Bloquear Microfono';
            break;
          case 2:
            return participant.isCameraOn
              ? 'Camara encendida'
              : participant.isCameraBlocked
              ? 'Desbloquear Camara'
              : 'Bloquear Camara';
            break;
          case 3:
            return participant.isScreenSharing
              ? 'Compartiendo Pantalla'
              : participant.isScreenShareBlocked
              ? 'Desbloquear Compartir Pantalla'
              : 'Bloquear Compartir Pantalla';
            break;
          default:
            return 'Error';
            break;
        }
      } else {
        switch (action) {
          case 1:
            return participant.isMicOn
              ? 'Microfono Encendido'
              : 'Microfono Apagado';
            break;
          case 2:
            return participant.isCameraOn
              ? 'Camara Encendida'
              : 'Camara Apagada';
            break;
          case 3:
            return participant.isScreenSharing
              ? 'Compartiendo Pantalla'
              : 'Compartir Pantalla Apagada';
            break;
          default:
            return 'Error';
            break;
        }
      }
    };

    const handleKickParticipant = (participant: User) => {
      sendNotification('KICK_PARTICIPANT', { value: participant.id });
    };

    const closeUserListPanel = () => {
      setSidebarState(false);
    };

    const notificateHandUp = (userId: string) => {
      return functionsOnMenuBar.handNotificationInfo.some(
        (notific) => notific.from == userId
      );
    };

    const removeHandUp = (userId: string) => {
      const handInput = {
        value: JSON.stringify({ from: userId }),
      };

      sendNotification('HAND_DOWN', handInput);
    };

    const toggleDrawMode = (arg: User) => {
      updateParticipantById(arg.id, { canDraw: !arg.canDraw });

      sendData(roomState.hostId, {
        eventType: 'BOARD_EVENT',
        from: userMe.id,
        to: arg.id,
        event: BOARD_EVENTS.TOGGLE_DRAW_MODE,
      });
    };

    const pinUserToTheRoom = (userId: string) => {
      addPinnedUserForAll(userId);
      sendNotification('PIN_USER_FOR_ALL_PARTICIPANTS', {
        value: JSON.stringify(mainViewState),
      });
    };

    const unpinUserFromTheRoom = (userId: string) => {
      removePinnedUserForAll(userId);
      sendNotification('PIN_USER_FOR_ALL_PARTICIPANTS', {
        value: JSON.stringify(mainViewState),
      });
    };

    // const lockParticipantsScreen = (user: User) => {
    //   return admittedParticipants.value.some(
    //     (p) => !p.isScreenShareBlocked && p.id !== user.id
    //   );
    // };

    return {
      waitingParticipants,
      admittedParticipants,
      toggleParticipantPanel,
      userMe,
      isEveryoneMicBlocked,
      isEveryoneVideoBlocked,
      isEveryoneScreenShareBlocked,
      isEveryoneActionsBlocked,
      isMicBlocked,
      isCameraBlocked,
      isScreenShareBlocked,
      lockParticipantActions,
      LOCK_ACTION_TYPE,
      handleKickParticipant,
      roomState,
      closeUserListPanel,
      participantActionsToolTip,
      notificateHandUp,
      removeHandUp,
      toggleDrawMode,
      mainViewState,
      addPinnedUser,
      pinUserToTheRoom,
      removePinnedUser,
      unpinUserFromTheRoom,
      MAIN_VIEW_LOCKED_TYPE,
      MAIN_VIEW_MODE,
      temporalRoleConditional,
      isAdmin,
      // lockParticipantsScreen,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUsersList.scss';
</style>
