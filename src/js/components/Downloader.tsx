import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
//eslint-disable-next-line
const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};
const Component = ({ url, disabled }) => {
	const [error, setError] = React.useState('');

	const clickDownload = (e) => {
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = 'test.webm';
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			document.body.removeChild(a);
			// window.URL.revokeObjectURL(url);
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
export default Component;
register(__filename, Component, false);
