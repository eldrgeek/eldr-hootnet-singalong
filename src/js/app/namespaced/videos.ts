import { Action } from "../index";
import React from "react";
import { CurrentModule, useApp, app } from "../../util/CurrentModule";

export type Actions = {
  _test: Action;
  add: Action<string>;
  delete: Action<string>;
  mute: Action<string>;
  playAll: Action;
  pauseAll: Action;
  markAll: Action;
  unmarkAll: Action;
  rewindAll: Action;
  deleteAll: Action;
  _applyAll: Action<{ id: string; cb: Action }>;
};

type VideoInfo = {
  id: string;
  URL: string | any;
  blobs?: Array<any>;
  muted: boolean;
  soundLevel: number;
};

const delay = async (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

export const actions: Actions = {
  _test: async ({ state, actions }) => {
    const a = actions.videos;
    const s = state.videos;
    console.log("Test called", state); //Object.keys(s.videos))
    // s.videos.videos = {}

    if (Object.keys(s.videos).length <= 2) {
      a.add("https://www.youtube.com/watch?v=o507bg_K6hs");
      a.add("https://www.youtube.com/watch?v=OSdGW_HBrLE");
      a.add("https://www.youtube.com/watch?v=8M8v7l9zsAM");
    }
    // a.playAll(undefined);
    // await delay(1000);
    // a.pauseAll();
    // await delay(1000);
  },
  add: ({ state, actions }, URL) => {
    const s = state.videos;
    const v: VideoInfo = {
      id: "S" + s.index++,
      URL,
      muted: false,
      soundLevel: 1
    };
    s.videos[v.id] = v;
  },
  deleteAll: ({ state, actions }) => {
    console.log("Delete all");
    state.videos.videos = {};
  },

  delete: ({ state, actions }) => {},
  mute: ({ state, actions }) => {},
  playAll: ({ state, actions }) => {},
  pauseAll: ({ state, actions }) => {},
  markAll: ({ state, actions }) => {},
  unmarkAll: ({ state, actions }) => {},
  rewindAll: ({ state, actions }) => {},
  _applyAll: ({ state, actions }) => {}
};
export type State = {
  videos: {
    [id: string]: VideoInfo;
  };
  index: number;
  playing: boolean;
};

export const state: State = {
  videos: {},
  index: 0,
  playing: true
};
