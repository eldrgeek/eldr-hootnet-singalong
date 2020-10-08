import { Action } from "../index";

export type Actions = {
  setTextInput: Action<string>;
  setDialogVisible: Action<boolean>;
  setJoyride: Action<boolean>;
  setJoyrideIndex: Action<number>;
  setDialogType: Action<string>;
};

export const actions: Actions = {
  setTextInput: ({ state, actions }, text) => {
    state.UI.textInput = text;
  },
  setDialogVisible: ({ state, actions }, dialog) => {
    state.UI.isDialogVisible = dialog;
  },
  setJoyride: ({ state, actions }, setting) => {
    if (setting === true) {
      state.UI.joyrideIndex = 0;
    }
    if (setting === true) {
      state.UI.joyrideIndex = 0;
    }
    state.UI.joyride = setting;
  },
  setJoyrideIndex: ({ state, actions }, index) => {
    state.UI.joyrideIndex = index;
  },
  setDialogType: ({ state, actions }, mode) => {
    state.UI.dialogType = mode;
  }
};

export type State = {
  textInput: string;
  isDialogVisible: boolean;
  joyride: boolean;
  joyrideIndex: number;
  dialogType: string;
};

export const state: State = {
  textInput: "",
  isDialogVisible: false,
  joyride: true,
  joyrideIndex: 0,
  dialogType: ""
};
