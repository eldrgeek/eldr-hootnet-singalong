import { Action } from "../index";
import React from "react";
import { CurrentModule, useApp, app } from "../../util/CurrentModule";

export type Actions = {
  setTextInput: Action<string>;
  setDialogVisible: Action;
};

export const actions: Actions = {
  setTextInput: ({ state, actions }, text) => {
    state.UI.textInput = text;
  },
  setDialogVisible: ({ state, actions }, dialog) => {
    state.UI.isDialogVisible = dialog;
  }
};

export type State = {
  textInput: string;
  isDialogVisible: boolean;
};

export const state: State = {
  textInput: "",
  isDialogVisible: false
};
