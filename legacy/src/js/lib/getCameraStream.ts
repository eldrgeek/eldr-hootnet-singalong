const getCameraStream = async (constraints?) => {
	if (!constraints)
		constraints = {
			audio: true,
			video: true
		};
	const stream = await navigator.mediaDevices.getUserMedia(constraints);

	return stream;
};

export default getCameraStream;
