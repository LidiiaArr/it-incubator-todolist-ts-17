import { Dispatch } from "redux";
import { authAPI } from "../api/todolists-api";
import { authActions } from "features/Login/auth-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// const initialState: InitialStateType = {
//   status: "idle",
//   error: null,
//   isInitialized: false,
// };

const slice = createSlice({
  name: "app",
  initialState: {
    status: "idle" as RequestStatusType,
    error: null as string | null,
    isInitialized: false,
  },
  reducers: {
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      //      return { ...state, error: action.error };
      state.error = action.payload.error;
    },
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status;
    },
    setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
      state.isInitialized = action.payload.isInitialized;
    },
  },
});

export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";
// export type InitialStateType = {
//   // происходит ли сейчас взаимодействие с сервером
//   status: RequestStatusType;
//   // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
//   error: string | null;
//   // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
//   isInitialized: boolean;
// };

export const appReducer = slice.reducer;
export const appActions = slice.actions;
export const appInitialState = slice.getInitialState;
//получаем инициализационный стейт

export type InitialStateType = ReturnType<typeof slice.getInitialState>;
export const initializeAppTC = () => (dispatch: Dispatch) => {
  authAPI.me().then((res) => {
    if (res.data.resultCode === 0) {
      //dispatch(setIsLoggedInAC(true));
      dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
    } else {
    }
    //dispatch(setAppInitializedAC(true));
    dispatch(appActions.setAppInitialized({ isInitialized: true }));
  });
};
