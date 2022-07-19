<template>
  <section
    :class="[
      'm-fuser relative-position',
      { '--avatar': !userPinned?.isVideoActivated },
    ]"
    v-touch:tap="handleTap"
  >
    <template v-if="showPinnedUser">
      <div v-show="!userPinned?.isVideoActivated" class="m-fuser__avatar">
        <figure class="m-fuser__avatar__imageBox">
          <img
            class="m-fuser__avatar__imageBox__image"
            :src="userPinned?.avatar"
          />
        </figure>
        <div class="m-fuser__info row items-center justify-center">
          <label
            class="m-fuser__info__userName text-white text-weight-bolder overflow-hidden text-center"
            >{{ userPinned?.name }}
            {{ userPinned?.id === userMe.id ? '(Tú)' : '' }}</label
          >
        </div>
        <div class="m-fuser__actions">
          <q-btn
            v-if="pinNormalEffect || isAdmin"
            @click="
              !pinNormalEffect
                ? unpinUserFromTheRoom(userPinned?.id)
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
        @mousemove="renderUnpinButton"
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
      <q-btn
        v-if="pinNormalEffect || isAdmin"
        v-show="
          showUnpinButton && userPinned?.isVideoActivated && !screenMinimized
        "
        :label="unpinBtnLabel"
        class="m-fuser__unpinBtn absolute-center"
        icon="fullscreen_exit"
        color="black"
        text-color="white"
        no-caps
        @click="unpinUser(userPinned.id)"
      />
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
import { MAIN_VIEW_EFFECTS, MAIN_VIEW_LOCKED_TYPE } from '@/utils/enums';
import { User } from '@/types';

export default defineComponent({
  name: 'FuFullScreenUser',
  props: {
    userId: String,
  },
  setup(props) {
    const { mainViewState, removePinnedUser, removePinnedUserForAll } =
      useMainView();
    const { screenMinimized, isMobile } = useScreen();
    const { userMe, userIsAdmin } = useUserMe();
    const { getParticipantTracks, getOwnLocalTracks } = useJitsi();
    const { participants } = useHandleParticipants();
    const { sendNotification } = useJitsi();

    const buttonMinimizeSpecialStyle = ref(false);

    let showUnpinButton = ref(false);

    let orientationClass = ref('');
    let videoPinned = reactive({} as Record<string, HTMLElement>);
    let audioPinned = reactive({} as Record<string, HTMLElement>);

    const hideUnpinButton = _.debounce(() => {
      showUnpinButton.value = false;
    }, 4000);

    const userPinned = computed(() =>
      userMe.id === props.userId
        ? userMe
        : (participants.value.find(
            (participant) => participant.id == props.userId
          ) as User)
    );

    const showPinnedUser = computed(() => userPinned.value);

    const isAdmin = computed(() => userIsAdmin());

    const pinNormalEffect = computed(() => {
      return mainViewState.effect == MAIN_VIEW_EFFECTS.NORMAL;
    });

    const unpinBtnLabel = computed(() => {
      return pinNormalEffect.value ? 'Desfijar' : 'Desfijar para todos';
    });

    onMounted(() => {
      let tracks = [];
      if (props.userId == userMe.id) {
        tracks = getOwnLocalTracks();
        console.log('myself tracks', tracks);
      } else {
        tracks = getParticipantTracks(props.userId as string);
        console.log('participant from roomjitsi', {
          user: props.userId,
          tracks,
        });
      }
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

    const renderUnpinButton = () => {
      if (!showUnpinButton.value) {
        showUnpinButton.value = true;
      } else {
        hideUnpinButton();
      }
    };

    const unpinUserFromTheRoom = (userId: string) => {
      removePinnedUserForAll(userId);
      sendNotification('PIN_USER_FOR_ALL_PARTICIPANTS', {
        value: JSON.stringify(mainViewState),
      });
    };

    const unpinUser = (userId: string) => {
      if (pinNormalEffect.value) {
        // unpin personal pinned user
        removePinnedUser(userId);
      } else {
        // is global and only for admin
        unpinUserFromTheRoom(userId);
      }
    };

    const handleTap = () => {
      if (isMobile()) {
        renderUnpinButton();
      }
    };

    return {
      pinNormalEffect,
      renderUnpinButton,
      showUnpinButton,
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
      unpinUser,
      unpinUserFromTheRoom,
      isAdmin,
      isMobile,
      unpinBtnLabel,
      handleTap,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreenUser.scss';
</style>
