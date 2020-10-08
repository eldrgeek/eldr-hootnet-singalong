import React from "react"; //eslint-disable-line
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line
import ReactPlayer from "react-player";
import getCameraStream from "../lib/getCameraStream";
import Blobber from "../lib/blobber";
//eslint-disable-next-line
const CL = (...args) => {
  console.log(...args, __filename);
};
const Monitor = () => {
  const [blobber, setBlobber] = React.useState(null);
  const { state, actions } = useApp();
  const [cameraStream, setCameraStream] = React.useState(null);

  React.useEffect(() => {
    if (state.videos.cameraOn && cameraStream === null) {
      getCameraStream().then((stream) => {
        setCameraStream(stream);
        const b = new Blobber(stream);
        setBlobber(b);
      });
    } else if (!state.videos.cameraOn && cameraStream !== null) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  }, [state.videos.cameraOn]); //eslint-disable-line

  React.useEffect(() => {
    if (state.videos.recording) {
      blobber.start(2000);
    } else if (blobber) {
      blobber.stopBlobber();
      //@ts-ignore
      actions.videos.add(URL.createObjectURL(new Blob(blobber.blobs)));
      setBlobber(null);
    }
  }, [state.videos.recording]); //eslint-disable-line
  return (
    <React.Fragment>
      <ReactPlayer
        height={"50%"}
        width={"50%"}
        muted={true}
        url={cameraStream}
        playing={true}
      />
    </React.Fragment>
  );
};
export default Monitor;
// CurrentModule(Monitor);
register(__filename, Monitor, true);
