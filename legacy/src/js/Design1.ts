import ButtonBase from './ButtonBase';
import React from 'react'; //eslint-disable-line
import { derived } from 'overmind';
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
const [state] = useApp();
const components = {
	addVideo: {
		type: 'button',
		icon: 'faPlus',
		buttonColor: 'blue',
		toggle: 'videos.addVideo',
		disabled: ({ state }) => {
			state.videos.playing || state.videos.addDialogOpen;
		}
	},
	buttonCamera: {
		type: 'button',
		disabled: ({ state }) => state.videos.recording,
		toggle: 'videos.cameraOn',
		buttoncolor: ({ state }) => (!state.videos.cameraOn ? 'green' : 'palered'),
		icon: ({ state }) => (state.videos.cameraOn ? 'faVideoSlash' : 'faVideo')
	},
	buttonDelete: {
		move: { top: '-50px' },
		buttoncolor: 'gray',
		disabled: ({ state }) => state.videos.recording,
		icon: 'faTrash',
		onClick: ({ state, actions, id }) => {
			const url = state.videos.videos[id].URL;
			if (url.match(/^blob:/)) {
				URL.revokeObjectURL(url);
			}
			//@ts-ignore
			actions.videos.delete(id);
		}
	}
};

// const ButtonComponent = (spec) => {
//   return (
//     <React.Fragment>
//     <ButtonBase
//     id="button-add"
//         disabled={state.videos.playing || state.videos.addDialogOpen}
//         //@ts-ignore
//         onClick={() => actions.UI.setDialogType("add")}
//         buttoncolor="blue"
//         icon={faPlus}
//       />
//     </React.Fragment>
//   );
// };

//   const componentMap = {
//     button: ButtonComponent,
//     dialog: DialogComponent
//   }
// })
