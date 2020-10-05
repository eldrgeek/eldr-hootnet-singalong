import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
const StreamRecorder = ({ recordedBlobs, disabled }) => {
	const [error, setError] = React.useState('');

	const clickDownload = (e) => {
		const blob = new Blob(recordedBlobs, { type: 'video/webm' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = 'test.webm';
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 100);
	};

	return (
		<React.Fragment>
			<Button id="download" onClick={clickDownload} disabled={disabled}>
				Download
			</Button>
			<span id="errorMsg">{error}</span>
		</React.Fragment>
	);
};
export default StreamRecorder;
