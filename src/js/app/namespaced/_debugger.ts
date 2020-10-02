import { Action } from "../index";
import React from "react";
import { CurrentModule, useApp, app } from "../../util/CurrentModule";

export type Element = () => JSX.Element;
type Registration = {
  name: String;
  element: Element;
  show: boolean;
  after?: string;
};
export type Actions = {
  register: Action<Registration>;
  toggleApp: Action;
};

export const actions: Actions = {
  register: ({ state, actions }, { name, element, show = false }) => {
    const registration = {
      name,
      element,
      show
    };
    state._debugger.registrations[name] = registration;
  },
  toggleApp: ({ state }) => {
    state._debugger.showApp = !state._debugger.showApp;
  }
};
export type State = {
  registrations: {
    [id: string]: Registration;
  };
  showApp: boolean;
};

export const state: State = {
  registrations: {},
  showApp: true
};
