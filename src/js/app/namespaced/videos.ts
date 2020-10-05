import { Action } from '../index';
import React from 'react';
import { CurrentModule, useApp, app } from '../../util/CurrentModule';

export type Actions = {
	_test: Action;
	setVideoTitle: Action<string>;
	setLocation: Action<number>;
	add: Action<string>;
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
	add: ({ state, actions }, URL) => {
		const s = state.videos;
		const v: VideoInfo = {
			id: 'S' + s.index++,
			URL,
			muted: false,
			soundLevel: 1
		};
		s.videos[v.id] = v;
	},
	setLocation: ({ state }, location) => {
		state.videos.location = location;
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
		state.videos.location = 0;
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
	},

	markAll: ({ state, actions }) => {},
	unmarkAll: ({ state, actions }) => {},
	rewind: ({ state, actions }) => {
		state.videos.location = 0;
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
	// videoTitle: 'https://www.youtube.com/watch?v=OSdGW_HBrLE'
	videoTitle: 'https://www.youtube.com/watch?v=o507bg_K6hs'
};
