import { Dispatch } from "redux";
import { authAPI, LoginParamsType } from "../../api/todolists-api";
import { handleServerAppError, handleServerNetworkError } from "../../utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "app/store";
import { appActions } from "app/app-reducer";

// const initialState: InitialStateType = {
//   isLoggedIn: false,
// };

const slice = createSlice({
  name: "auth",
  initialState: { isLoggedIn: false },
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      //code
      state.isLoggedIn = action.payload.isLoggedIn;
      //мутируем стейт напрямую
      //потому что под капот есть библиотека которая берет это на себя
    },
  },
});
//reducers содержат подредьюсеры

// export const authReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//   switch (action.type) {
//     case "login/SET-IS-LOGGED-IN":
//       return { ...state, isLoggedIn: action.value };
//     default:
//       return state;
//   }
// };

// actions

// export const setIsLoggedInAC = (value: boolean) => ({ type: "login/SET-IS-LOGGED-IN", value }) as const;

// thunks
export const loginTC =
  (data: LoginParamsType): AppThunk =>
  (dispatch) => {
    //dispatch(setAppStatusAC("loading"));
    dispatch(appActions.setAppStatus({ status: "loading" }));
    authAPI
      .login(data)
      .then((res) => {
        if (res.data.resultCode === 0) {
          //dispatch(setIsLoggedInAC(true));
          dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }));
          //dispatch(setAppStatusAC("succeeded"));
          dispatch(appActions.setAppStatus({ status: "succeeded" }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
export const logoutTC = (): AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({ status: "loading" }));
  authAPI
    .logout()
    .then((res) => {
      if (res.data.resultCode === 0) {
        //dispatch(setIsLoggedInAC(false));
        dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }));
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch);
    });
};

// types

// type ActionsType = ReturnType<typeof setIsLoggedInAC>;
// type InitialStateType = {
//   isLoggedIn: boolean;
// };

// type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>;

export const authReducer = slice.reducer;
//под капотом создает олдскульный редьюсер
export const authActions = slice.actions;
//authActions.setIsLoggedIn
