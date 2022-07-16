import { reactive } from 'vue';

interface AuthState {
  loadingOrErrorMessage: string;
  existRoom: boolean;
  isLoadingOrError: boolean;
  errorType: number;
}

const authState = reactive<AuthState>({
  loadingOrErrorMessage: '',
  existRoom: false,
  isLoadingOrError: true,
  errorType: -1,
} as AuthState);

export function useAuthState() {
  const setLoadingOrErrorMessage = (message: string) => {
    authState.loadingOrErrorMessage = message;
  };
  const setExistRoom = (existRoom: boolean) => {
    authState.existRoom = existRoom;
  };
  const setIsLoadingOrError = (isLoadingOrError: boolean) => {
    authState.isLoadingOrError = isLoadingOrError;
  };

  const setErrorType = (payload: number) => {
    authState.errorType = payload;
  };

  return {
    authState,
    setLoadingOrErrorMessage,
    setExistRoom,
    setIsLoadingOrError,
    setErrorType,
  };
}
