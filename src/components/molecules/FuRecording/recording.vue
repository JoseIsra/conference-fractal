<template>
  <div v-if="canRecording">
    <q-btn
      v-if="!userMe.isRecording"
      :disable="roomState.isBeingRecorded"
      color="primary"
      icon="fas fa-record-vinyl"
      :label="
        $q.screen.lt.sm
          ? ''
          : isLoading
          ? 'Cargando...'
          : roomState.isBeingRecorded
          ? 'La reunión está siendo grabada'
          : 'Iniciar Grabación'
      "
      @click="startRecording"
    />
    <q-btn
      v-if="roomState.isBeingRecorded && !isLoading && userMe.isRecording"
      color="negative"
      icon="radio_button_checked"
      :label="$q.screen.lt.sm ? '' : `Detener Grabación ${recordTime}`"
      @click="stopRecording"
    />
  </div>
  <div
    v-show="!canRecording && roomState.isBeingRecorded"
    class="recordingContent"
  >
    <div class="recordingContent__icon" />
    <div v-if="$q.screen.gt.sm" class="recordingContent__text">
      La reunión está siendo grabada
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoom, useUserMe } from '@/composables';
import { warningMessage, successMessage } from '@/utils/notify';
import { useJitsi } from '@/composables/jitsi';

export default defineComponent({
  name: 'FuMRecording',
  setup() {
    const interval = ref();
    const recordTime = ref('00:00:00');
    const secondsElapsed = ref(0);
    /* const { recordingStream, stopRecordingStream } = useInitMerge(); */
    const { initRecord, finishRecord, sendNotification } = useJitsi();
    // const { participants } = useHandleParticipants();
    const { userMe, updateUserMe } = useUserMe();

    const { roomState } = useRoom();
    /* const { admittedParticipants } = useHandleParticipants(); */
    const isLoading = ref(false);

    // const watchParticipants = ref<() => void>();

    const mergedName = ref('');

    const oneSecondElapsed = () => {
      secondsElapsed.value++;
      /* console.log(secondsElapsed.value); */
      recordTime.value = new Date(secondsElapsed.value * 1000)
        .toISOString()
        .substr(11, 8);
    };

    const startRecording = () => {
      // updateRoom({ isBeingRecorded: true });

      // window.xprops?.handleStartRecording?.();
      /* watchParticipants.value = watch(
        () => participants.value,
        (actualParticipants, prevParticipants) => {
          refreshMerge(prevParticipants, actualParticipants);
        },
        { deep: true }
      ); */

      const timestamp = new Date().getTime();

      isLoading.value = true;
      warningMessage('Iniciando grabación...');
      mergedName.value = `m-r-${roomState.classroomId}-${userMe.fractalUserId}-${roomState.id}-${timestamp}`;
      sendNotification('INIT_RECORDING', { value: userMe.id });
      initRecord();
      isLoading.value = false;
      // sendNotificationEvent('RECORDING_STARTED', userMe.id);
      /* createMergeInstance(roomState.id, mergedName.value, mergedName.value)
        .then(() => {
          isLoading.value = false;
          interval.value = setInterval(oneSecondElapsed, 1000);
          isRecording.value = true;
        })
        .catch((e) => console.log(e)); */

      /* recordingStream(mergedName.value, mergedName.value, roomState.id)
        .then(() => {
          isLoading.value = false;
          successMessage('Grabando la sesión');
          interval.value = setInterval(oneSecondElapsed, 1000);
          isRecording.value = true;
          updateRoom({
            recordingUrl: `https://f002.backblazeb2.com/file/MainPublic/classrooms/${roomState.classroomId}/cooperate/recordings/${mergedName.value}.mp4`,
          });
        })
        .catch((e) => console.log(e)); */
      // fetch(
      //   `https://cooperate.fractalup.com/WebRTCAppEE/rest/v2/broadcasts/${userMe.id}/recording/true?recordType=webm`,
      //   { method: 'PUT' }
      // )
      //   .then(() => {
      //     isLoading.value = false;
      successMessage('Grabando la sesión');
      interval.value = setInterval(oneSecondElapsed, 1000);
      //     /* isRecording.value = true; */
      updateUserMe({
        isRecording: true,
      });
      //   })
      //   .catch((e) => console.log(e));
    };

    const stopRecording = () => {
      sendNotification('END_RECORDING', { value: userMe.id });
      finishRecord();
      // updateRoom({ isBeingRecorded: false });
      updateUserMe({
        isRecording: false,
      });
      //     /* isRecording.value = false; */
      recordTime.value = '00:00:00';
      clearInterval(interval.value);
      //     /* stopMerge(); */
      //     //stopRecordingStream(mergedName.value);
      secondsElapsed.value = 0;
      //     /* window.xprops?.handleStopRecording?.(roomState.recordingUrl); */
      //     sendNotificationEvent('RECORDING_STOPPED', userMe.id);
      //     if (
      //       !userMe.isCameraOn &&
      //       !userMe.isScreenSharing &&
      //       !userMe.isMicOn &&
      //       !userMe.isHost
      //     ) {
      //       updateUserMe({ isPublishing: 0 });
      //       stopPublishing(userMe.id);
      //     }
      //   })
      //   .catch((e) => console.log(e));
    };

    const canRecording = ref(userMe.roleId === 0);

    return {
      startRecording,
      stopRecording,
      recordTime,
      isLoading,
      roomState,
      canRecording,
      userMe,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './recording.scss';
</style>
