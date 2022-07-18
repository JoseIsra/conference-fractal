<template>
  <section
    class="m-fuser"
    :class="{ '--avatar': !userPinned?.isVideoActivated }"
  >
    <template v-if="showPinnedUser">
      <div v-show="!userPinned?.isVideoActivated" class="m-fuser__avatar">
        <figure class="m-fuser__avatar__imageBox">
          <img
            class="m-fuser__avatar__imageBox__image"
            :src="userPinned?.avatar"
          />
        </figure>
        <div class="m-fuser__info">
          <label class="m-fuser__info__userName"
            >{{ userPinned?.name }}
            {{ userPinned?.id === userMe.id ? '(Tú)' : '' }}</label
          >
        </div>
        <div class="m-fuser__actions">
          <q-btn
            v-if="
              mainViewState.locked === MAIN_VIEW_LOCKED_TYPE.ANYONE ||
              mainViewState.locked === MAIN_VIEW_LOCKED_TYPE.UNSET ||
              userMe.roleId === 0
            "
            @click="
              mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
              mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET
                ? removePinnedUserForAll(userPinned?.id)
                : removePinnedUser(userPinned?.id)
            "
            round
            flat
            icon="fullscreen_exit"
            color="white"
          >
            <q-tooltip
              class="bg-grey-10"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="m-fuser__actions__message"> Desfijar </label>
            </q-tooltip>
          </q-btn>
        </div>
      </div>
      <video
        :id="'video-' + userId"
        v-show="userPinned?.isVideoActivated"
        :class="[
          'm-fuser__stream',
          orientationClass,
          { '--coverMode': userPinned?.isCameraOn && $q.platform.is.desktop },
          {
            '--fillMode': userPinned?.isScreenSharing && $q.platform.is.desktop,
          },
          {
            '--containMode':
              userPinned?.isScreenSharing && $q.platform.is.mobile,
          },
        ]"
        @mousemove="toggleMinimizeMessage"
        playsinline
        :ref="
          ($el) => {
            videoPinned[userPinned.id] = $el;
          }
        "
        autoplay
      ></video>
      <audio
        :id="'audio-' + userId"
        :ref="
          ($el) => {
            audioPinned[userPinned.id] = $el;
          }
        "
        style="display: none"
        autoplay
      ></audio>
      <!-- <q-btn
        flat
        :label="buttonMinimizeSpecialStyle ? '' : 'Minimizar pantalla'"
        class="m-fuser__quitBtn"
        :class="{ '--cornerButton': buttonMinimizeSpecialStyle }"
        icon="fullscreen_exit"
        @click="exitFullScreen"
        v-show="
          showMinimizeMessage &&
          userPinned?.isVideoActivated &&
          !screenMinimized &&
          minimizeOnGlobalFocusedUser
        "
      /> -->
    </template>

    <!-- <div class="m-fuser__loading" v-else>
      <q-spinner color="primary" size="10em" />
      <q-btn
        class="m-fuser__loading__exit"
        @click="
          mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
          mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET
            ? removePinnedUserForAll(userPinned?.id)
            : removePinnedUser(userPinned?.id)
        "
        round
        flat
        icon="fullscreen_exit"
        color="white"
      >
        <q-tooltip
          class="bg-grey-10"
          transition-show="scale"
          transition-hide="scale"
        >
          <label class="m-fuser__actions__message"> Desfijar </label>
        </q-tooltip>
      </q-btn>

      <span> Cargando... </span>
    </div> -->
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  nextTick,
  onMounted,
  reactive,
  onBeforeUnmount,
} from 'vue';
import { useHandleParticipants, useUserMe, useScreen } from '@/composables';
import { useJitsi } from '@/composables/jitsi';
import { useMainView } from '@/composables/mainView';
import _ from 'lodash';
import { MAIN_VIEW_LOCKED_TYPE } from '@/utils/enums';
import { User } from '@/types';

export default defineComponent({
  name: 'FuFullScreenUser',
  props: {
    userId: String,
  },
  setup(props) {
    const { mainViewState, removePinnedUser, removePinnedUserForAll } =
      useMainView();
    const { screenMinimized } = useScreen();
    const { userMe } = useUserMe();
    const { getParticipantTracks } = useJitsi();
    const { participants } = useHandleParticipants();

    const buttonMinimizeSpecialStyle = ref(false);

    let showMinimizeMessage = ref(false);

    let orientationClass = ref('');
    let videoPinned = reactive({} as Record<string, HTMLElement>);
    let audioPinned = reactive({} as Record<string, HTMLElement>);

    const hideMinimizeMessage = _.debounce(() => {
      showMinimizeMessage.value = false;
    }, 4000);

    const toggleMinimizeMessage = () => {
      if (!showMinimizeMessage.value) {
        showMinimizeMessage.value = true;
      } else {
        hideMinimizeMessage();
      }
    };
    const userPinned = computed(
      () =>
        participants.value.find(
          (participant) => participant.id == props.userId
        ) as User
    );
    // userMe.id === props.userId
    //   ? userMe
    //   :
    const showPinnedUser = computed(() => userPinned.value);
    onMounted(() => {
      const tracks = getParticipantTracks(props.userId as string);
      console.log('participant from roomjitsi', {
        user: props.userId,
        tracks,
      });
      tracks.forEach((track) => {
        if (track.getType() == 'audio') {
          track.attach(audioPinned[props.userId as string]);
        } else {
          void nextTick(() => {
            track.attach(videoPinned[props.userId as string]);
          });
        }
      });
    });

    onBeforeUnmount(() => {
      videoPinned = {};
      audioPinned = {};
    });

    return {
      toggleMinimizeMessage,
      showMinimizeMessage,
      orientationClass,
      screenMinimized,
      buttonMinimizeSpecialStyle,
      userMe,
      userPinned,
      removePinnedUser,
      removePinnedUserForAll,
      mainViewState,
      MAIN_VIEW_LOCKED_TYPE,
      videoPinned,
      audioPinned,
      showPinnedUser,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreenUser.scss';
</style>
