import { Action } from '../index';
import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, app } from '../../util/CurrentModule'; //eslint-disable-line

export type Actions = {
	_test: Action;
	setVideoTitle: Action<string>;
	clearRewinding: Action<string>;
	setLoadingState: Action<{ id: string; state: string }>;
	setAttr: Action<{ attr: string; value: any }>;
	setDelayTime: Action<{ id: string; time: number }>;
	setStartTime: Action<{ id: string; time: number }>;
	add: Action<string, string>;
	delete: Action<string>;
	mute: Action<string>;
	toggleCameraOn: Action;
	toggleRecording: Action;
	toggleAddDialog: Action;
	togglePlay: Action;
	markAll: Action;
	unmarkAll: Action;
	rewind: Action;
	deleteAll: Action;
	setEnabled: Action<string>;
	_applyAll: Action<{ id: string; cb: Action }>;
};

type VideoInfo = {
	id: string;
	URL: string | any;
	blobs?: Array<any>;
	muted: boolean;
	soundLevel: number;
	enabled: boolean;
	startTime: number;
	delayTime: number;
	rewinding: boolean;
	loadingState: string;
};

const delay = async (timeout) => {
	//eslint-disable-line
	//eslint-disable-line
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
};

export const actions: Actions = {
	_test: async ({ state, actions }) => {
		const a = actions.videos; //eslint-disable-line
		const s = state.videos; //eslint-disable-line
		// console.log('Test called', state); //Object.keys(s.videos))
		// s.videos.videos = {}

		// if (Object.keys(s.videos).length <= 2) {
		//   a.add("https://www.youtube.com/watch?v=o507bg_K6hs");
		//   a.add("https://www.youtube.com/watch?v=OSdGW_HBrLE");
		//   a.add("https://www.youtube.com/watch?v=8M8v7l9zsAM");
		// }
		// a.togglePlay(undefined);
		// await delay(1000);
		// a.pauseAll();
		// await delay(1000);
	},
	setLoadingState: ({ state }, { id, newState }) => {
		state.videos.videos[id].loadingState = newState;
	},
	clearRewinding: ({ state }, id) => {
		state.videos.videos[id].rewinding = false;
	},
	setAttr: ({ state, actions }, { attr, value }) => {
		Object.keys(state.videos.videos).forEach((key) => {
			state.videos.videos[key][attr] = value;
		});
	},
	setEnabled: ({ state }, id) => {
		state.videos.videos[id].enabled = true;
	},
	add: ({ state, actions }, URL) => {
		const s = state.videos;
		const v: VideoInfo = {
			id: 'S' + s.index++,
			URL,
			muted: false,
			soundLevel: 1,
			startTime: 0,
			delayTime: 0,
			enabled: false,
			loadingState: 'initial'
		};
		s.videos[v.id] = v;
		return v.id;
	},
	setStartTime: ({ state }, { id, time }) => {
		state.videos.videos[id].startTime = time;
	},
	setDelayTime: ({ state }, { id, time }) => {
		state.videos.videos[id].delayTime = time;
	},

	setVideoTitle: ({ state }, title) => {
		state.videos.videoTitle = title;
	},
	toggleAddDialog: ({ state }) => {
		state.videos.addDialogOpen = !state.videos.addDialogOpen;
	},
	deleteAll: ({ state, actions }) => {
		console.log('Delete all');
		state.videos.videos = {};
	},

	toggleCameraOn: ({ state, actions }) => {
		state.videos.cameraOn = !state.videos.cameraOn;
	},
	toggleRecording: ({ state, actions }) => {
		if (!state.videos.recording) {
			state.videos.recording = true;
			state.videos.playing = true;
		} else {
			state.videos.recording = false;
			state.videos.playing = false;
			state.videos.location = 0;
			state.videos.cameraOn = false;
		}
	},
	delete: ({ state, actions }) => {},
	mute: ({ state, actions }) => {},
	togglePlay: ({ state, actions }) => {
		// if (!state.videos.playing) {
		// 	state.videos.location = 0.1;
		// }
		state.videos.playing = !state.videos.playing;
		state.videos.hasPlayed = true;
	},

	markAll: ({ state, actions }) => {},
	unmarkAll: ({ state, actions }) => {},
	rewind: ({ state, actions }) => {
		state.videos.hasPlayed = false;
		actions.videos.setAttr({ attr: 'rewinding', value: true });
	},
	_applyAll: ({ state, actions }) => {}
};
export type State = {
	videos: {
		[id: string]: VideoInfo;
	};
	index: number;
	playing: boolean;
	_testData: Array<string>;
	cameraOn: boolean;
	recording: boolean;
	location: number;
	addDialogOpen: boolean;
	videoTitle: string;
	hasPlayed: boolean;
};

export const state: State = {
	videos: {},
	index: 0,
	playing: false,
	_testData: [
		'https://www.youtube.com/watch?v=o507bg_K6hs',
		'https://www.youtube.com/watch?v=OSdGW_HBrLE',
		'https://www.youtube.com/watch?v=8M8v7l9zsAM'
	],
	cameraOn: false,
	recording: false,
	location: 0,
	addDialogOpen: false,
	hasPlayed: false,
	// videoTitle: 'https://www.youtube.com/watch?v=OSdGW_HBrLE'
	videoTitle: 'https://www.youtube.com/watch?v=o507bg_K6hs'
};
