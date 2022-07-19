<template>
  <section
    :style="styleOnMobile"
    :class="[layoutStyle, usersDistributionStyle]"
  >
    <div
      :class="[
        'userVideoBox',
        { fade: mainViewState.pinnedUsers.includes(userMe.id) },
        { '--third': totalUsers == 3 && isGridLayout },
      ]"
      :style="backgroundColorSelected(userMe.id)"
    >
      <div
        v-show="!userMe.isVideoActivated"
        class="userVideoBox__avatar relative-position"
      >
        <figure class="userVideoBox__avatar__imageBox">
          <img
            class="userVideoBox__avatar__imageBox__image"
            :src="userMe.avatar"
          />
        </figure>
        <div
          class="userVideoBox__avatar__info absolute row items-center q-px-xs"
        >
          <label class="userVideoBox__avatar__info__userName">
            {{ userMe.id }}-{{ userMe.name }}
          </label>
          <div class="userVideoBox__avatar__info__iconWrapper text-center">
            <q-icon
              :name="
                userMe.isMicOn
                  ? iconsPeriferics.mic.onState
                  : iconsPeriferics.mic.offState
              "
              color="white"
              size="18px"
            />
          </div>
        </div>
      </div>

      <video
        v-show="userMe.isVideoActivated"
        ref="localVideoTrack"
        class="userVideoBox__stream"
        playsinline
        muted
        autoplay
      ></video>
      <audio style="display: none" ref="localAudioTrack" muted autoplay></audio>

      <div v-show="userMe.isVideoActivated">
        <div class="userVideoBox__avatar__info__userName --video">
          {{ userMe.id }}-{{ userMe.name }}
        </div>
      </div>
    </div>
    <div
      v-for="participant in admittedParticipants"
      :key="participant.id"
      :class="[
        'userVideoBox text-white',
        { fade: mainViewState.pinnedUsers.includes(participant.id) },
      ]"
      :ref="
        ($el) => {
          demoRefs[participant.id] = $el;
        }
      "
      :style="backgroundColorSelected(participant.id)"
    >
      <div
        v-show="!participant.isVideoActivated"
        class="userVideoBox__avatar relative-position"
      >
        <figure class="userVideoBox__avatar__imageBox">
          <img
            v-if="participant.avatar"
            class="userVideoBox__avatar__imageBox__image"
            :src="participant.avatar"
          />
          <q-spinner-oval
            v-if="!participant.avatar"
            color="primary"
            size="2em"
          />
        </figure>
        <div
          class="userVideoBox__avatar__info absolute row items-center q-px-xs"
        >
          <label class="userVideoBox__avatar__info__userName">
            {{ participant.id }}-{{ participant.name }}
          </label>
          <div class="userVideoBox__avatar__info__iconWrapper text-center">
            <q-icon
              :name="participant.isMicOn ? 'mic' : 'mic_off'"
              size="18px"
              color="white"
            />
          </div>
        </div>
      </div>
      <video
        v-show="participant.isVideoActivated"
        :id="'video-' + participant.id"
        class="userVideoBox__stream"
        autoplay
        :ref="
          ($el) => {
            participantVideoTracks[`video-${participant.id}`] = $el;
          }
        "
        playsinline
      ></video>
      <audio
        :id="'audio-' + participant.id"
        style="display: none"
        :ref="
          ($el) => {
            participantAudioTracks[`audio-${participant.id}`] = $el;
          }
        "
        autoplay
      ></audio>
      <div v-show="participant.isVideoActivated">
        <div class="userVideoBox__avatar__info__userName --video">
          {{ participant.id }}-{{ participant.name }}
        </div>
      </div>

      <q-btn
        flat
        round
        :ripple="false"
        :icon="
          mainViewState.pinnedUsers.includes(participant?.id)
            ? 'location_disabled'
            : 'gps_fixed'
        "
        color="white"
        class="userVideoBox__avatar__screenBtn"
        @click="
          mainViewState.pinnedUsers.includes(participant?.id)
            ? removePinnedUser(participant?.id)
            : addPinnedUser(participant?.id)
        "
        :disable="
          (mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
            mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET) ||
          (mainViewState.pinnedUsers.length >= 4 &&
            !mainViewState.pinnedUsers.includes(participant?.id))
        "
      >
        <q-tooltip
          anchor="top middle"
          class="bg-grey-10"
          self="bottom middle"
          :offset="[10, 10]"
          transition-show="scale"
          transition-hide="scale"
        >
          <label class="userVideoBox__avatar__screenBtn__label">{{
            mainViewState.pinnedUsers.includes(participant?.id)
              ? 'Desfijar para mi'
              : 'Fijar para mi'
          }}</label>
        </q-tooltip>
      </q-btn>
    </div>
    <div
      class="userVideoBox --moreUsers"
      v-show="numberOfExtraParticipants > 0"
    >
      + {{ numberOfExtraParticipants }}
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, reactive } from 'vue';
import { useQuasar } from 'quasar';
import {
  useScreen,
  useHandleParticipants,
  useUserMe,
  useMainView,
} from '@/composables';
import { useLayout } from '@/composables/layout';
import { useUserColor } from '@/composables/userColor';
import { MAIN_VIEW_LOCKED_TYPE, LAYOUT, MAIN_VIEW_MODE } from '@/utils/enums';
import { iconsPeriferics } from '@/helpers/iconsMenuBar';

export default defineComponent({
  name: 'FuCooperateUserVideo',
  setup() {
    const { addPinnedUser, removePinnedUser, mainViewState } = useMainView();
    const {
      admittedParticipants,
      participantAudioTracks,
      participantVideoTracks,
    } = useHandleParticipants();

    const { userMe, localTracks, localAudioTrack, localVideoTrack } =
      useUserMe();

    const streamIdPinned = ref('');
    const $q = useQuasar();
    const { screenMinimized } = useScreen();
    const { colorList } = useUserColor();
    const { layout } = useLayout();
    let demoRefs = reactive({} as Record<string, HTMLElement>);

    const styleOnMobile = computed(() => {
      return admittedParticipants.value.length > 5
        ? { 'justify-content': 'center' }
        : '';
    });

    const layoutStyle = computed(() => ({
      gridLayout: layout.value == LAYOUT.GRID_LAYOUT,
      rowLayout: layout.value == LAYOUT.ROW_LAYOUT,
      fade: screenMinimized.value,
      '--split':
        layout.value == LAYOUT.GRID_LAYOUT &&
        mainViewState.mode !== MAIN_VIEW_MODE.NONE,
      '--moreviews': totalUsers.value >= 5 && isGridLayout.value,
    }));

    watch(
      () => localTracks.value,
      () => {
        localTracks.value.forEach((track) => {
          if (track.getType() == 'audio') {
            track.attach(localAudioTrack.value);
          } else {
            track.attach(localVideoTrack.value);
          }
        });
      }
    );

    const totalUsers = computed(() => {
      return admittedParticipants.value.length + 1;
    });

    const isGridLayout = computed(() => {
      return layout.value == LAYOUT.GRID_LAYOUT;
    });

    const usersDistributionStyle = computed(
      () => isGridLayout.value && `--${totalUsers.value}users`
    );

    const backgroundColorSelected = (id: string) => {
      return {
        'background-color': colorList.get(id),
      };
    };

    // Manage row layout
    const visibleParticipantsRowLayout = computed(() => {
      return $q.screen.lt.md
        ? admittedParticipants.value.slice(0, 1)
        : admittedParticipants.value.slice(0, 4);
    });

    const invisibleParticipantsRowLayout = computed(() => {
      return $q.screen.lt.md
        ? admittedParticipants.value.slice(1)
        : admittedParticipants.value.slice(4);
    });

    // manage grid layout
    const visibleParticipantsFullScreen = computed(() => {
      return mainViewState.mode !== MAIN_VIEW_MODE.NONE
        ? admittedParticipants.value.slice(0, 7)
        : admittedParticipants.value.slice(0, 8);
    });

    const visibleParticipantsGridLayout = computed(() => {
      return $q.screen.lt.md
        ? admittedParticipants.value.slice(0, 4)
        : visibleParticipantsFullScreen.value;
    });

    const invisibleParticipantsFullScreen = computed(() => {
      return mainViewState.mode !== MAIN_VIEW_MODE.NONE
        ? admittedParticipants.value.slice(7)
        : admittedParticipants.value.slice(8);
    });
    const invisibleParticipantsGridLayout = computed(() => {
      return $q.screen.lt.md
        ? admittedParticipants.value.slice(4)
        : invisibleParticipantsFullScreen.value;
    });

    // visible users on screen
    const visibleParticipants = computed(() => {
      return isGridLayout.value
        ? visibleParticipantsGridLayout.value
        : visibleParticipantsRowLayout.value;
    });

    // no visible users on screen
    const invisibleParticipants = computed(() => {
      return isGridLayout.value
        ? invisibleParticipantsGridLayout.value
        : invisibleParticipantsRowLayout.value;
    });

    const numberOfExtraParticipants = computed(() => {
      return invisibleParticipants.value.length;
    });

    watch(
      () => admittedParticipants.value,
      () => {
        void nextTick(() => {
          invisibleParticipants.value.forEach((p) => {
            demoRefs[p.id].classList.add('fade');
          });
        });
      }
    );

    watch(
      () => isGridLayout.value,
      (newVal) => {
        if (newVal) {
          visibleParticipants.value.forEach((p) => {
            demoRefs[p.id].classList.remove('fade');
          });
        } else {
          void nextTick(() => {
            invisibleParticipants.value.forEach((p) => {
              demoRefs[p.id].classList.add('fade');
            });
          });
        }
      }
    );

    watch(
      () => mainViewState.pinnedUsers,
      () => {
        void nextTick(() => {
          invisibleParticipants.value.forEach((p) => {
            demoRefs[p.id].classList.add('fade');
          });
        });
      }
    );

    return {
      numberOfExtraParticipants,
      visibleParticipants,
      invisibleParticipants,
      userMe,
      admittedParticipants,
      streamIdPinned,
      styleOnMobile,
      screenMinimized,
      addPinnedUser,
      removePinnedUser,
      mainViewState,
      MAIN_VIEW_LOCKED_TYPE,
      iconsPeriferics,
      localAudioTrack,
      localVideoTrack,
      participantAudioTracks,
      participantVideoTracks,
      backgroundColorSelected,
      layoutStyle,
      layout,
      LAYOUT,
      usersDistributionStyle,
      totalUsers,
      isGridLayout,
      demoRefs,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
