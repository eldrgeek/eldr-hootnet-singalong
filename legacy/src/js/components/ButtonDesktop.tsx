import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
// import { IconButton } from '@material-ui/core';
import ButtonBase from './ButtonBase';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	//eslint-disable-line
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};
let timeout;
let recordDesktop;
CL('reloaded modules here we go', recordDesktop);
const setRecordDesktop = (value) => (recordDesktop = value);
const Component = () => {
	const { actions, state } = useApp();
	// const [recordDesktop, setRecordDesktop] = React.useState(false);
	const [stream, setStream] = React.useState(null);

	const toggleRecord = () => {
		if (recordDesktop) {
			CL('TIMEOUT value is', timeout);
			if (timeout) clearTimeout(timeout);
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
				setStream(null);
			}
		} else {
			const gdmOptions = {
				video: {
					cursor: 'always'
				},
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					sampleRate: 44100
				}
			};
			try {
				navigator.mediaDevices
					//@ts-ignore
					.getDisplayMedia(gdmOptions)
					.then((stream) => {
						const checkStream = () => {
							CL('checking stream', recordDesktop);
							if (stream.active) {
								timeout = setTimeout(checkStream, 1000);
							} else {
								CL('Stream ended', recordDesktop);
								if (recordDesktop) toggleRecord();
							}
						};
						setStream(stream);
						checkStream();
					})
					.catch((e) => {
						CL('caught error', e);
					});
			} catch (err) {
				CL('Error: ' + err);
			}
		}
		CL('SET VALUE');
		setRecordDesktop(!recordDesktop);
	};

	return (
		<React.Fragment>
			<ButtonBase
				id="button-camera"
				disabled={state.videos.recording}
				//@ts-ignore
				bg={recordDesktop ? 'red' : 'white'}
				onClick={toggleRecord}
				buttoncolor={recordDesktop ? 'green' : 'gray'}
				icon={faDesktop}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);
