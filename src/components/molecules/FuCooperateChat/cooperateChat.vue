<template>
  <section class="m-chat">
    <header class="m-chat__title">
      <label class="m-chat__title__text">
        <q-icon
          v-if="$q.screen.gt.sm"
          name="wechat"
          color="white"
          size="25px"
        />
        <q-btn
          v-else
          flat
          round
          size="15px"
          icon="chevron_left"
          color="white"
          dense
          class="m-chat__closeChat"
          @click="closeChat"
        />
        Chat público
      </label>
      <q-btn
        flat
        round
        size="12px"
        icon="more_vert"
        color="white"
        dense
        class="m-chat__leaveChat"
        @click="showChatMenu = !showChatMenu"
      />
      <fu-cooperate-menu
        v-show="showChatMenu"
        :isActions="false"
        :isOptions="false"
        :renderFunctions="false"
        :chatOptions="true"
        width="180px"
        bottom="-50px"
      />
    </header>
    <section class="m-chat__body" @click="hideMenu">
      <main class="m-chat__messagesBox" ref="messageContainer">
        <q-chat-message
          class="m-chat__messagesBox__bubble"
          v-for="message in userMessages"
          :key="message.id"
          :sent="message.streamId == userMe.id"
          :bg-color="
            message.streamId == userMe.id ? 'indigo-6' : 'deep-purple-9'
          "
          :size="message.typeMessage == 'plainText' ? '' : '9'"
          text-color="white"
          :stamp="message.date"
        >
          <template v-slot:name v-if="!(message.streamId === userMe.id)">
            <div class="m-chat__messagesBox__info__name">
              <span> {{ message.streamName }} </span>
            </div>

            <div
              class="m-chat__messagesBox__info__fullname"
              v-if="message.streamName.length >= 20"
            >
              {{ message.streamName }}
            </div>
          </template>

          <template v-slot:avatar>
            <q-img
              :class="[
                'm-chat__messagesBox__info__avatar',
                message.streamId == userMe.id ? '--me' : '--others',
              ]"
              :src="message.avatar"
            ></q-img>
          </template>

          <div class="m-chat__messagesBox__message">
            <span
              class="m-chat__messagesBox__message__text"
              v-if="message.typeMessage == 'plainText'"
              >{{ message.content }}</span
            >
            <span v-if="message.typeMessage == 'image'">
              <q-img
                class="m-chat__messagesBox__message__image"
                spinner-color="white"
                :src="message.content"
                alt="file-logo"
              />
            </span>
            <span
              v-if="message.typeMessage == 'file'"
              class="m-chat__messagesBox__message__file"
            >
              <p class="m-chat__messagesBox__message__file__name">
                {{ message.fileName }}
              </p>
              <p class="m-chat__messagesBox__message__file__extension">
                <strong>{{ message.fileExtension }}</strong>
              </p>
              <q-btn
                class="m-chat__messagesBox__message__file__btn"
                flat
                round
                @click="$refs.thelink.click()"
                icon="file_download"
                color="blue"
                dense
              />
              <a
                :href="message.content"
                ref="thelink"
                target="_blank"
                :style="{ display: 'none' }"
                >Descargar</a
              >
            </span>
          </div>
        </q-chat-message>
        <q-chat-message
          v-if="fakeMessage == userMe.id"
          :sent="true"
          class="m-chat__messagesBox__bubble"
          bg-color="indigo-6"
          text-color="white"
          size="4"
        >
          <template v-slot:avatar>
            <q-img
              class="m-chat__messagesBox__info__avatar --me"
              :src="userMe.avatar"
            ></q-img>
          </template>
          <span>
            <q-spinner-dots size="25px" />
          </span>
        </q-chat-message>
      </main>
      <div class="m-chat__formBox">
        <form
          class="m-chat__formBox__form"
          autocomplete="off"
          @submit.prevent="sendMessage"
        >
          <q-input
            autofocus
            class="m-chat__formBox__form__input"
            ref="inputUser"
            dense
            v-model="userInput"
            color="grey"
            :input-style="{ color: '#fffffe' }"
            outlined
            rounded
            placeholder="Nuevo mensaje..."
          />
          <input
            type="file"
            :style="{ display: 'none' }"
            @change="fileSelected"
            ref="fileInput"
          />
          <q-btn
            flat
            round
            icon="attach_file"
            dense
            @click="$refs.fileInput.click()"
          />

          <button
            type="submit"
            :disabled="!userInput"
            class="m-chat__formBox__form__saveBtn"
          >
            <q-icon name="send" size="20px" color="white" />
          </button>
        </form>
      </div>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, VueElement, nextTick, onUpdated } from 'vue';
import { regexp } from '@/types';

import { useRoute } from 'vue-router';
import moment from 'moment';
import {
  useRoom,
  useSidebarToogle,
  useUserMe,
  useHandleMessage,
} from '@/composables';
import { useJitsi } from '@/composables/jitsi';
import { nanoid } from 'nanoid';
import { simplifyExtension, renameFile } from '@/utils/file';
import FuCooperateMenu from 'molecules/FuCooperateMenu';
import backblazeService from '@/services/backblaze';
const { uploadFileToBackblaze } = backblazeService;
import { warningMessage } from '@/utils/notify';

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

type MessageContainer = VueElement & {
  scrollTop: number;
  scrollHeight: number;
};

type InputChat = VueElement & {
  focus(): void;
};

export default defineComponent({
  name: 'FuCooperateChat',
  components: { FuCooperateMenu },
  setup() {
    const route = useRoute();
    let showChatMenu = ref<boolean>(false);
    const { roomState } = useRoom();
    const backBlazePathFile = `https://encrypted.fractalup.com/file/MainPublic/classrooms/${roomState.classroomId}/cooperate/chat`;
    const messageContainer = ref<MessageContainer>({} as MessageContainer);
    let userInput = ref<string>('');
    const { userMessages } = useHandleMessage();
    let { setSidebarState } = useSidebarToogle();
    const { userMe } = useUserMe();
    let userName = ref(window?.xprops?.streamId || route.query.streamName);
    const fakeMessage = ref('');
    const inputUser = ref<InputChat>({} as InputChat);
    const { sendChatMessage } = useJitsi();

    const sendMessage = () => {
      if (!regexp.test(userInput.value)) {
        warningMessage('No hay mensaje para enviar');
        return;
      }

      addTextMessage(userInput.value, new Date(), 'plainText');
    };

    const addTextMessage = (
      content: string,
      thedate: Date,
      typeMessage: string,
      fileExtension?: string,
      fileName?: string
    ) => {
      let userLocalMessage = {
        id: nanoid(),
        streamId: userMe.id,
        date: moment(thedate).format('h: mm a'),
        streamName: userMe.name,
        eventType: 'CHAT_MESSAGE',
        content,
        avatar: userMe.avatar,
        typeMessage,
        fileExtension,
        fileName,
      };
      userInput.value = '';
      inputUser.value.focus();
      sendChatMessage(JSON.stringify(userLocalMessage));
    };

    const fileSelected = (e: HTMLInputEvent) => {
      let fileInformation = e?.target?.files?.[0] as File;
      const reader = new FileReader();
      const [leftType] = fileInformation.type.split('/');
      const fileExtension = simplifyExtension(fileInformation.type);
      const fileName = fileInformation.name;
      const fileNameToBackblaze = `${new Date().getTime()}.${fileExtension}`;
      fileInformation = renameFile(fileInformation, fileNameToBackblaze);
      reader.onload = async function () {
        const B2Info = await window.xprops?.getB2Info?.();
        const uploadUrl = B2Info?.uploadUrl;
        const authorizationToken = B2Info?.authorizationToken;
        const b2Info = {
          uploadUrl: uploadUrl,
          authorizationToken: authorizationToken,
        };
        fakeMessage.value = userMe.id;
        uploadFileToBackblaze({
          file: new File([fileInformation], encodeURIComponent(fileName)),
          path: `classrooms/${roomState.classroomId}/cooperate/chat`,
          b2Info,
          retries: 10,
        })
          .then(() => {
            fakeMessage.value = '';
            const fileRoute = `${backBlazePathFile}/${fileName}`;
            if (leftType === 'image') {
              addTextMessage(fileRoute, new Date(), 'image');
            } else {
              addTextMessage(
                fileRoute,
                new Date(),
                'file',
                fileExtension,
                fileName
              );
            }
          })
          .catch((err) => console.error(err));
      };
      reader.readAsArrayBuffer(fileInformation);
      e.target.value = '';
    };

    const closeChat = () => {
      setSidebarState(false);
    };

    const scrollToEnd = () => {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    };

    onUpdated(() => {
      try {
        void nextTick(() => scrollToEnd());
      } catch (error) {
        console.error(error);
      }
    });

    const hideMenu = () => {
      showChatMenu.value = false;
    };

    return {
      userInput,
      sendMessage,
      userMessages,
      userName,
      userMe,
      closeChat,
      fileSelected,
      messageContainer,
      showChatMenu,
      hideMenu,
      fakeMessage,
      inputUser,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateChat.scss';
</style>
