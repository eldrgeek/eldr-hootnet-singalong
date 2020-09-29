import { Action } from "../index";

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
  _applyAll: Action<{ id: string; cb: Action }>;
};

type VideoInfo = {
  id: string;
  URL?: string;
  blobs?: Array<any>;
  muted: boolean;
  soundLevel: number;
};
export type State = {
  videos: {
    [id: string]: VideoInfo;
  };
};

const delay = async (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
console.log("LOADED");
const delayTest = async () => {
  console.log("Starting");
  await delay(2000);
  console.log("Delay ended ");
};
delayTest();

export const actions: Actions = {
  _test: async ({ state, actions }) => {
    const a = actions.videos;
    const s = state.videos;

    if (Object.keys(s.videos).length !== 2) {
      a.add("URL1");
      a.add("URL2");
      a.add("URL3");
    }
    a.playAll(undefined);
    await delay(1000);
    a.pauseAll();
    await delay(1000);
  },
  add: ({ state, actions }) => {},
  delete: ({ state, actions }) => {},
  mute: ({ state, actions }) => {},
  playAll: ({ state, actions }) => {},
  pauseAll: ({ state, actions }) => {},
  markAll: ({ state, actions }) => {},
  unmarkAll: ({ state, actions }) => {},
  rewindAll: ({ state, actions }) => {},
  _applyAll: ({ state, actions }) => {}
};

export const state: State = {
  text: "this tex",
  timeout: null
};
