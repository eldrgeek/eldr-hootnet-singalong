//@ts-ignore
import React from 'react'; //eslint-disable-line
//@ts-ignore
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
// import { IconButton } from '@material-ui/core';
import ButtonBase from './ButtonBase';
import { faCheck, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@material-ui/core';
//@ts-ignore
const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
	const { actions, state } = useApp();
	type Mode = {
		title: string;
		onClick: any;
	};
	const modeNull: Mode = {
		title: 'change title',
		onClick: () => console.log('change')
	};
	const [mode, setMode] = React.useState(modeNull);
	React.useEffect(() => {
		CL(state.UI.dialogType);
		switch (state.UI.dialogType) {
			case 'loadconfig':
				setMode({
					title: 'Load singalong configuration',
					onClick: () => {
						console.log('Load congig');
					}
				});
				break;
			case 'saveconfig':
				setMode({
					title: 'Save configuration as',
					onClick: () => {
						CL('Save congig');
					}
				});
				break;
			case 'add':
				setMode({
					title: 'Enter video URL',
					onClick: () => {
						if (state.videos.videoTitle.match(/^hoot/)) {
							console.log('firebase', state.videos.videoTitle);
							//@ts-ignore
							const URL = actions.firebase.download('testvideo');
							if (URL) {
								URL.then((URL) => {
									CL('URL is ', URL);
									//@ts-ignore
									actions.videos.add(URL);
								}).catch((e) => {
									CL('ERor', e);
								});
							}
						} else {
							//@ts-ignore
							actions.videos.add(state.videos.videoTitle);
						}
						CL('Set type');
						//@ts-ignore}
						actions.UI.setDialogType('');
					}
				});
				break;
			case 'save':
				setMode({
					title: 'Save file as...',
					onClick: () => {
						console.log('Save congig');
					}
				});
				break;
			case 'load':
				break;
			default:
				break;
		}
	}, [state.UI.dialogType]); //eslint-disable-line

	//@ts-ignore
	const setValue = (e) => {
		//eslint-disable-line
		//eslint-disable-line
		e.persist();
		CL('setting value', e.target.value);
		//@ts-ignore
		actions.videos.setVideoTitle(e.target.value);
		CL('setting', e.target.value);
	};
	if (state.UI.dialogType === '') return null;
	return (
		<React.Fragment>
			<div className="border-2 border-black">
				<div>
					<div className="flex justify-center">{mode.title}</div>
					<div className="flex justify-center">
						<Input
							style={{ margin: '2px 23px 2px 10px', width: '350px' }}
							id="input-add"
							//@ts-ignore
							onChange={(e) => actions.videos.setVideoTitle(e.target.value)}
							value={state.videos.videoTitle}
							placeholder="Enter video URL"
						/>
					</div>
				</div>
				<div className="flex justify-around">
					<ButtonBase
						id="button-confirm"
						disabled={false}
						onClick={mode.onClick}
						buttoncolor="blue"
						icon={faCheck}
					/>
					<ButtonBase
						id="button-cancel"
						disabled={false}
						//@ts-ignore
						onClick={() => actions.UI.setDialogType('')}
						buttoncolor="blue"
						icon={faWindowClose}
					/>
				</div>
			</div>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);
