<template>
  <section
    class="o-cooperate"
    v-on="{ mousemove: !screenMinimized ? toogleMenuBar : toogleMenuBar }"
    v-touch:tap="toogleMenuBar"
    :style="[bgRenderStyles, heightObjectStyle]"
    @click.self="closePanels"
  >
    <q-resize-observer @resize="onResize" />
    <q-icon
      name="fas fa-expand-alt"
      size="24px"
      class="o-cooperate__expand"
      @click="updateScreenState"
      v-show="screenMinimized"
    />

    <fu-cooperate-header v-show="renderHeader" />

    <fu-cooperate-menu-bar v-show="showMenuBar" />
    <transition :name="$q.screen.lt.sm ? 'dragged' : 'slide'">
      <fu-cooperate-side-bar v-show="isSidebarRender" />
    </transition>
    <fu-cooperate-user-video
      v-show="
        !screenMinimized && $q.screen.lt.md
          ? showUsersVideoList
          : !screenMinimized
      "
    />
    <fu-hand-notification v-show="handActives && !screenMinimized" />
    <fu-full-screen v-if="mainViewState.mode !== MAIN_VIEW_MODE.NONE" />

    <!-- solicitudes -->
    <q-dialog
      v-model="showParticipantPanel"
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <fu-cooperate-participants-panel />
    </q-dialog>
    <fu-warning v-model="openTabSharedWarning" />
  </section>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  toRefs,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
} from 'vue';
import FuCooperateMenuBar from 'organisms/FuCooperateMenuBar';
import FuCooperateHeader from 'molecules/FuCooperateHeader';
import FuCooperateUserVideo from 'atoms/FuCooperateUserVideo';
import FuCooperateSideBar from 'molecules/FuCooperateSideBar';
import FuHandNotification from 'atoms/FuHandNotification';
import FuFullScreen from 'molecules/FuFullScreen';
import FuWarning from 'atoms/FuWarning';
import FuCooperateParticipantsPanel from '@/components/molecules/FuCooperateParticipantsPanel';
import { debounce as _debounce } from 'lodash';
import {
  useRoom,
  useScreen,
  useToogleFunctions,
  useSidebarToogle,
  useMainView,
  useHandleParticipants,
} from '@/composables';
import { usePanels } from '@/composables/panels';
import { useLayout } from '@/composables/layout';
import { useBoard } from '@/composables/board';
import { LAYOUT, MAIN_VIEW_MODE } from '@/utils/enums';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'FuCooperate',
  components: {
    FuCooperateMenuBar,
    FuCooperateHeader,
    FuCooperateSideBar,
    FuCooperateUserVideo,
    FuHandNotification,
    FuFullScreen,
    FuCooperateParticipantsPanel,
    FuWarning,
  },
  setup(props, { emit }) {
    let vh = ref(window.innerHeight * 0.01);
    const { participantVideoTracks, participantAudioTracks } =
      useHandleParticipants();
    const { openTabSharedWarning } = usePanels();
    const { layout, setNewLayout } = useLayout();
    const $q = useQuasar();
    const { setShowExcaliBoard } = useBoard();
    const isMultichat = window.xprops?.multichat;

    onMounted(() => {
      emit('mounted');
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleDeviceHeight);
    });

    const handleDeviceHeight = () => {
      vh.value = window.innerHeight * 0.01;
    };

    const heightObjectStyle = computed(() => ({
      '--vh': String(vh.value) + 'px',
    }));

    onBeforeUnmount(() => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleDeviceHeight);
    });

    let showMenuBar = ref<boolean>(false);
    let showUsersVideoList = ref<boolean>(false);
    const showHeader = ref<boolean>(true);

    const { mainViewState } = useMainView();
    let { isSidebarRender, showParticipantPanel, setSidebarState } =
      useSidebarToogle();

    const { functionsOnMenuBar, setShowChat } = useToogleFunctions();

    const { roomState } = useRoom();

    const {
      screenMinimized,
      updateScreenState,
      setScreenDeviceOrientation,
      isMobile,
      updateScreenTest,
    } = useScreen();

    const hideMenuBar = _debounce(() => {
      showMenuBar.value = false;
      showUsersVideoList.value = false;
      showHeader.value = false;
    }, 5000);

    window?.xprops?.onProps?.((props) => {
      if (isMultichat) {
        if (props.miniMode) {
          updateScreenTest(true);
        } else {
          updateScreenTest(false);
        }
      }
    });
    watch(
      () => screenMinimized.value,
      (value) => {
        if (value) {
          hideMenuBar.cancel();
        }
      }
    );

    watch(
      () => mainViewState.mode,
      (value) => {
        if (value !== 0 && isMobile()) {
          setNewLayout(LAYOUT.PRESENTATION_LAYOUT);
        }
      }
    );
    const toogleMenuBar = () => {
      if (!showMenuBar.value) {
        showMenuBar.value = true;
        showUsersVideoList.value = true;
        showHeader.value = true;
      } else {
        hideMenuBar();
      }
    };

    const handleOrientationChange = () => {
      const orientation = window.screen.orientation.type;
      if (orientation == 'landscape-primary') {
        setScreenDeviceOrientation(true);
      } else if (orientation == 'portrait-primary') {
        setScreenDeviceOrientation(false);
      }
    };

    const handActives = computed(() => {
      return functionsOnMenuBar.handNotificationInfo.length > 0;
    });

    const isPresentationLayout = computed(() => {
      return layout.value == LAYOUT.PRESENTATION_LAYOUT;
    });

    const renderHeader = computed(() => {
      return !screenMinimized.value &&
        $q.screen.lt.md &&
        layout.value == LAYOUT.PRESENTATION_LAYOUT
        ? showHeader.value
        : isPresentationLayout.value;
    });
    const bgRenderStyles = computed(() => {
      return isPresentationLayout.value
        ? {
            'background-image': `url(${roomState.bgInfo.url})`,
            'background-size': `${roomState.bgInfo.maximized ? 100 : 50}vw`,
            'background-position': ' 50% center',
            'background-repeat': 'no-repeat',
          }
        : '';
    });

    const onResize = (size: { height: number; width: number }) => {
      if (size.width < 1024) {
        setNewLayout(LAYOUT.PRESENTATION_LAYOUT);
        setShowExcaliBoard(false);
      }
    };

    const closePanels = () => {
      setSidebarState(false);
      setShowChat(false);
    };

    return {
      toogleMenuBar,
      showMenuBar,
      isSidebarRender,
      functionsOnMenuBar,
      screenMinimized,
      updateScreenState,
      ...toRefs(roomState),
      showParticipantPanel,
      showUsersVideoList,
      mainViewState,
      MAIN_VIEW_MODE,
      showHeader,
      heightObjectStyle,
      handActives,
      participantVideoTracks,
      participantAudioTracks,
      openTabSharedWarning,
      renderHeader,
      bgRenderStyles,
      onResize,
      closePanels,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
