import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import VideoLibrary from '@material-ui/icons/VideoLibrary';
import Visibility from '@material-ui/icons/Visibility';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},
	input: {
		display: 'none'
	},
	video: {
		display: 'none'
	}
}));

export default function UploadButtons() {
	const classes = useStyles();
	const [stream, setStream] = React.useState(null);
	const [stream2, setStream2] = React.useState(null);

	const videoRef = React.useRef(null);
	const videoRef2 = React.useRef(null);
	const [visible, setVisible] = React.useState('none');
	React.useEffect(() => {
		if (stream && videoRef && videoRef.current && !videoRef.current.src) {
			videoRef.current.src = stream;
			setStream2(videoRef.current.captureStream());
		}
	}, [stream, videoRef]);
	React.useEffect(() => {
		console.log('stream2', stream2);
		if (stream2 && videoRef2 && videoRef2.current && !videoRef2.current.src) {
			console.log('Atttached video');
			videoRef2.current.srcObject = stream2;
		}
	}, [stream2, videoRef2]);
	const fileSelected = (e) => {
		// Set object URL as the video <source>
		const file = URL.createObjectURL(e.target.files[0]);
		setStream(file);
	};
	const videoVisible = () => {
		if (visible === 'block') {
			setVisible('none');
		} else {
			setVisible('block');
		}
	};
	const chooseCamera = () => {
		setStream(null);
		setStream(null);
		videoRef.current.srcObject = null;
		videoRef2.current.srcObject = null;
	};
	return (
		<div className={classes.root}>
			<input
				accept="video/*"
				className={classes.input}
				id="icon-button-file"
				type="file"
				onChange={fileSelected}
			/>
			<label htmlFor="icon-button-file">
				<IconButton
					color="primary"
					aria-label="upload picture"
					component="span"
				>
					<VideoLibrary />
				</IconButton>
			</label>

			<IconButton
				onClick={chooseCamera}
				color="primary"
				aria-label="upload picture"
				component="span"
			>
				<PhotoCamera />
			</IconButton>
			<IconButton
				onClick={videoVisible}
				style={{ display: 'inline-block' }}
				color="primary"
				aria-label="upload picture"
				component="span"
			>
				<Visibility />
			</IconButton>
			<video
				style={{ display: visible, height: '140px' }}
				ref={videoRef}
				controls
				autoPlay
			>
				= {/* <source type="video/mp4"> */}
			</video>
			<video
				style={{ display: visible, height: '140px' }}
				ref={videoRef2}
				controls
				autoPlay
			>
				{/* <source type="video/mp4"> */}
			</video>
		</div>
	);
}
