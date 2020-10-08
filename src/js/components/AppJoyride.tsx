//@ts-ignore
import React, { Component } from "react";
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line

import Joyride, {
  CallBackProps,
  STATUS,
  EVENTS,
  ACTIONS,
  Step,
  StoreHelpers
} from "react-joyride";
//@ts-ignore
import styled from "styled-components";
import App from "./App";
// @ts-ignore
// import a11yChecker from 'a11y-checker';

// import { ReactComponent as LogoSVG } from '../media/logo.svg';
// import StarBurst from '../components/StarBurst';

// import './styles.css';

interface Props {
  breakpoint?: string;
  state: any;
  actions: any;
}

interface State {
  run: boolean;
  steps: Step[];
}

// const Logo = styled(LogoSVG)`
//   height: auto;
//   margin-bottom: 10px;
//   max-height: 100%;
//   max-width: ${({ breakpoint }: Props) => `${breakpoint === 'lg' ? '500px' : '290px'}`};
//   width: 100%;
// `;
//@ts-ignore
const Subtitle = styled.p`
  font-size: ${({ breakpoint }: Props) =>
    `${breakpoint === "lg" ? "35px" : "20px"}`};
  margin: 0 auto;
  width: 100%;
`;

class Basic extends Component<Props, State> {
  //@ts-ignore
  private helpers?: StoreHelpers;
  private UIState: any;
  private UIActions: any;
  constructor(props: Props) {
    super(props);
    this.UIState = props.state.UI;
    this.UIActions = props.actions.UI;
    this.state = {
      run: this.UIState.joyride,
      steps: [
        {
          content: <h2>Here's a short tour of the applicaton </h2>,
          placement: "center",
          target: "body"
        },
        {
          title: "Add content",
          content: <div>Click this button to add a track to perform with</div>,
          // floaterProps: {
          //   disableAnimation: true
          // },
          spotlightPadding: 40,
          target: "#button-add"
        },
        {
          title: "Input URL",
          content: (
            <div>
              You can enter paste a Video URL here
              <br />
              <h3>Like this H3 title</h3>
            </div>
          ),
          placement: "top",
          spotlightPadding: 40,

          target: "#input-add"
        },
        {
          title: "Confirm selection",
          content: (
            <div>
              And click here to confirm it
              <br />
              <h3>Like this H3 title</h3>
            </div>
          ),
          placement: "top",
          target: "#button-confirm"
        },
        {
          title: "Cancel dialog",
          content: <div>You can also cancel the dialog by clicking here</div>,
          placement: "top",
          target: "#button-cancel"
        },

        {
          title: "Turn on camera and mic",
          content: (
            <div>
              To record your sing-along you'll click here
              <br />
              to turn on the camera and mic
            </div>
          ),
          placement: "bottom",
          target: "#button-camera"
        },
        {
          title: "Play",
          content: (
            <div>
              You can click this button to play a track
              <br />
              If you've recorded your own track, it will play in sync
            </div>
          ),
          placement: "bottom",
          target: "#button-play-pause"
        },
        {
          title: "Record your track",
          content: (
            <div>
              If you've turned on your camera, this button will be enabled
              <br />
              Click it to start recording. Click again to stop
            </div>
          ),
          placement: "bottom",
          target: "#button-record-stop"
        },
        {
          title: "Add your track to the composition",
          content: (
            <div>
              When you stop recording, your track will be added
              <br />
              Once it's added it will play in sync
            </div>
          ),
          placement: "bottom",
          target: "#button-record-stop"
        },
        {
          title: "Delete or download",
          content: (
            <div>
              If you don't like your track, you can press delete
              <br />
              If you do like it, you can download it, email it or upload to
              Vimeo or YouTube
            </div>
          ),
          placement: "bottom",
          target: "#button-record-stop"
        }
      ]
    };
  }

  public componentDidMount() {
    // a11yChecker();
  }

  private getHelpers = (helpers: StoreHelpers) => {
    this.helpers = helpers;
  };
  //@ts-ignore
  private handleClickStart = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    this.setState({
      run: true
    });
  };

  private handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    //@ts-ignore
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      this.UIActions.setJoyrideIndex(
        index + (action === ACTIONS.PREV ? -1 : 1)
      );
      //@ts-ignore
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      this.setState({ run: false });
      this.UIActions.setJoyride(false);
      // Need to set our running state to false, so we can restart if we click start again.
    }
    enum StepId {
      OpenAdd = 2,
      CloseAdd = StepId.OpenAdd + 3
    }
    switch (index) {
      case StepId.OpenAdd:
        this.UIActions.setDialogType("add");
        break;
      case StepId.CloseAdd:
        this.UIActions.setDialogType("");
        break;
    }

    console.groupCollapsed(type);
    console.log(data); //eslint-disable-line no-console
    console.groupEnd();
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
    }

    // tslint:disable:no-console
    console.groupCollapsed(type);
    console.log(data);
    console.groupEnd();
    // tslint:enable:no-console
  };

  public render() {
    //@ts-ignore
    const { steps } = this.state;
    //@ts-ignore
    // const { breakpoint } = this.props;

    return (
      <div
        style={{ display: "flex", justifyContent: "center" }}

        // lassName="demo-wrapper"
      >
        <Joyride
          callback={this.handleJoyrideCallback}
          continuous={true}
          // getHelpers={this.getHelpers}
          run={this.UIState.joyride}
          scrollToFirstStep={true}
          showProgress={true}
          showSkipButton={true}
          stepIndex={this.UIState.joyrideIndex}
          steps={steps}
          styles={{
            options: {
              zIndex: 10000
            }
          }}
        />
        <App />
      </div>
    );
  }
}
const WrapJoyride = () => {
  const { state, actions } = useApp();
  return <Basic state={state} actions={actions} />;
};

export default WrapJoyride;
