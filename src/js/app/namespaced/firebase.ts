import { Action } from '../index';
import firebase from 'firebase';

import { C } from '../../util/CL';
const CL = C(__filename);
let fb = null;
interface StorageSpec {
	path: string;
	content: any;
	metadata: string;
}
export type Actions = {
	init: Action;
	store: Action<StorageSpec>;
	list: Action<string>;
	upload: Action<StorageSpec>;
	download: Action<string, any>;
};

export const actions: Actions = {
	init({ state, actions }) {
		CL('start init');
		const firebaseConfig = {
			apiKey: 'AIzaSyDazmoZ4hGks6Lw1E56wmp7F2rEivDjKwU',
			authDomain: 'mike-wolf.firebaseapp.com',
			ConstantSourceNodeatabaseURL: 'https://mike-wolf.firebaseio.com',
			projectId: 'mike-wolf',
			storageBucket: 'mike-wolf.appspot.com',
			messagingSenderId: '595993744223',
			appId: '1:595993744223:web:9d992db48c10795c0a9cea',
			measurementId: 'G-JN7VTQKP24'
		};
		// Initialize Firebase
		try {
			CL('Init');
			firebase.initializeApp(firebaseConfig);
		} catch (e) {
			CL('Already initialized', e);
			// firebase.analytics();
		}
	},
	store({ state, actions }, spec: StorageSpec) {
		if (!spec || !spec.path) return;
		// console.clear();

		const ref = firebase.storage().ref(spec.path);
		const message = 'This is my message.';
		ref
			.putString(message)
			.then(function (snapshot) {
				console.log('Uploaded a raw string!');
			})
			.catch((e) => CL('an error storing', e));
		CL('stored');
	},
	upload({ state }, spec: StorageSpec) {
		const ref = firebase.storage().ref(spec.path);
	},
	download({ state }, path: string) {
		const ref = firebase.storage().ref(path);
	},
	list({ state }, path = '/') {
		const ref = firebase.storage().ref(path);

		ref
			.listAll()
			.then(function (res) {
				res.prefixes.forEach(function (folderRef) {
					CL('Folder', folderRef);
					// All the prefixes under listRef.
					// You may call listAll() recursively on them.
				});
				res.items.forEach(function (itemRef) {
					CL('item', itemRef);
					// All the items under listRef.
				});
			})
			.catch(function (error) {
				CL('List error', error);
				// Uh-oh, an error occurred!
			});
	}
};
export type State = {
	fb: any;
};

export const state: State = {
	fb: null
};
