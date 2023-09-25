import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "../../api/todolists-api";
import { Dispatch } from "redux";
import { AppRootStateType, AppThunk } from "../../app/store";
import { handleServerAppError, handleServerNetworkError } from "../../utils/error-utils";
import { appActions } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { todolistsActions } from "features/TodolistsList/todolists-reducer";

//const initialState: TasksStateType = {};
// {
//   'todoId1': [{id:'231ferg', title: 'What'}]
// }

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
      // return { ...state, [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId) };
      const tasksForCurrentTodolist = state[action.payload.todolistId];
      console.log(tasksForCurrentTodolist, "tasksForCurrentTodolist");
      const index = tasksForCurrentTodolist.findIndex((task) => task.id === action.payload.taskId);
      if (index !== -1) tasksForCurrentTodolist.splice(index, 1);
    },
    addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
      //return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] };
      const tasksForCurrentTodolist = state[action.payload.task.todoListId];
      tasksForCurrentTodolist.unshift(action.payload.task);
    },
    updateTask: (
      state,
      action: PayloadAction<{ taskId: string; model: UpdateDomainTaskModelType; todolistId: string }>,
    ) => {
      //       return {
      //         ...state,
      //         [action.todolistId]: state[action.todolistId].map((t) =>
      //           t.id === action.taskId ? { ...t, ...action.model } : t,
      //         ),
      //       };
      const tasksForCurrentTodolist = state[action.payload.todolistId];
      const index = tasksForCurrentTodolist.findIndex((task) => task.id === action.payload.taskId);
      if (index !== -1) {
        tasksForCurrentTodolist[index] = { ...tasksForCurrentTodolist[index], ...action.payload.model };
      }
    },
    setTasks: (state, action: PayloadAction<{ tasks: TaskType[]; todolistId: string }>) => {
      //return { ...state, [action.todolistId]: action.tasks };
      state[action.payload.todolistId] = action.payload.tasks;
    },
  },
  extraReducers: (builder) => {
    //нужен если нужно воспользоваться экшонами из другого слайса или санками
    builder.addCase(todolistsActions.addTodolist, (state, action) => {
      //return { ...state, [action.todolist.id]: [] };
      state[action.payload.todolist.id] = [];
    });
    builder.addCase(todolistsActions.removeTodolist, (state, action) => {
      //      const copyState = { ...state };
      //       delete copyState[action.id];
      //       return copyState;
      delete state[action.payload.id];
    });
    builder.addCase(todolistsActions.setTodolists, (state, action) => {
      //       const copyState = { ...state };
      //       action.todolists.forEach((tl: any) => {
      //         copyState[tl.id] = [];
      //       });
      //       return copyState;
      action.payload.todolists.forEach((tl) => {
        state[tl.id] = [];
      });
    });
  },
});
export const tasksReducer = slice.reducer;
export const tasksAction = slice.actions;

// thunks
export const fetchTasksTC =
  (todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI.getTasks(todolistId).then((res) => {
      const tasks = res.data.items;
      console.log(res.data);
      //dispatch(setTasksAC(tasks, todolistId));
      dispatch(tasksAction.setTasks({ tasks, todolistId }));
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
    });
  };
export const removeTaskTC =
  (taskId: string, todolistId: string): AppThunk =>
  (dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId).then(() => {
      // const action = removeTaskAC(taskId, todolistId);
      // dispatch(action);
      dispatch(tasksAction.removeTask({ taskId, todolistId }));
    });
  };
export const addTaskTC =
  (title: string, todolistId: string): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const task = res.data.data.item;
          // const action = addTaskAC(task);
          // dispatch(action);
          dispatch(tasksAction.addTask({ task }));
          dispatch(appActions.setAppStatus({ status: "succeeded" }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const task = state.tasks[todolistId].find((t) => t.id === taskId);
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn("task not found in the state");
      return;
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    };

    todolistsAPI
      .updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          //const action = updateTaskAC(taskId, domainModel, todolistId);
          //dispatch(action);
          dispatch(tasksAction.updateTask({ taskId, model: domainModel, todolistId }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };

// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};
