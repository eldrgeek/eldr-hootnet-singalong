import { Action } from "../index";
import React from "react";
import { CurrentModule, useApp, app } from "../../util/CurrentModule";
import { Settings } from "@material-ui/icons";

export type Actions = {
  setTextInput: Action<string>;
  setDialogVisible: Action<boolean>;
  setJoyride: Action<boolean>;
};

export const actions: Actions = {
  setTextInput: ({ state, actions }, text) => {
    state.UI.textInput = text;
  },
  setDialogVisible: ({ state, actions }, dialog) => {
    state.UI.isDialogVisible = dialog;
  },
  setJoyride: ({ state, actions }, setting) => {
    state.UI.joyride = setting;
  }
};

export type State = {
  textInput: string;
  isDialogVisible: boolean;
  joyride: boolean;
};

export const state: State = {
  textInput: "",
  isDialogVisible: false,
  joyride: true
};
