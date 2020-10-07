import React from "react";
import { CurrentModule, useApp, register } from "../util/CurrentModule";
import Joyride, {
  CallBackProps,
  STATUS,
  EVENTS,
  ACTIONS,
  Step,
  StoreHelpers
} from "react-joyride";
const CL = (...args) => {
  console.log(...args, `(${__filename})`);
};

const Component = () => {
  console.log("render joyride");
  const { state, actions } = useApp();
  const [stepIndex, setStepIndex] = React.useState(0);
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    CL("Data", data);
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      setStepIndex(stepIndex + (action === ACTIONS.PREV ? -1 : 1));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      actions.UI.setJoyride(false);
    }

    // tslint:disable:no-console
    // console.groupCollapsed(type);
    // console.log(data);
    // console.groupEnd();
    // tslint:enable:no-console
  };
  const steps = [
    {
      content: <h2>Let's begin our jour</h2>,
      locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
      placement: "center",
      target: "body"
    },
    {
      content: <h2>Sticky elements</h2>,
      // floaterProps: {
      //   disableAnimation: true
      // },
      spotlightPadding: 20,
      target: "#button-add"
    },
    {
      content: "This is the joy",
      placement: "bottom",
      target: "#button-joyride"
      // styles: {
      //   options: {
      //     width: 300
      //   }
    }
    // {
    //   target: "#button-joyride",
    //   title: "Our projects"
    // }
    // {
    //   content: (
    //     <div>
    //       You can render anything!
    //       <br />
    //       <h3>Like this H3 title</h3>
    //     </div>
    //   ),
    //   placement: "top",
    //   target: ".demo__how-it-works h2",
    //   title: "Our Mission"
    // },
    // {
    //   content: (
    //     <div>
    //       <h3>All about us</h3>
    //       <svg
    //         width="50px"
    //         height="50px"
    //         viewBox="0 0 96 96"
    //         xmlns="http://www.w3.org/2000/svg"
    //         preserveAspectRatio="xMidYMid"
    //       >
    //         <g>
    //           <path
    //             d="M83.2922435,72.3864207 C69.5357835,69.2103145 56.7313553,66.4262214 62.9315626,54.7138297 C81.812194,19.0646376 67.93573,0 48.0030634,0 C27.6743835,0 14.1459311,19.796662 33.0745641,54.7138297 C39.4627778,66.4942237 26.1743334,69.2783168 12.7138832,72.3864207 C0.421472164,75.2265157 -0.0385432192,81.3307198 0.0014581185,92.0030767 L0.0174586536,96.0032105 L95.9806678,96.0032105 L95.9966684,92.1270809 C96.04467,81.3747213 95.628656,75.2385161 83.2922435,72.3864207 Z"
    //             fill="#000000"
    //           />
    //         </g>
    //       </svg>
    //     </div>
    //   ),
    //   placement: "left",
    //   target: ".demo__about h2"
    // }
  ];

  return (
    <React.Fragment>
      <Joyride
        // callback={handleJoyrideCallback}
        continuous={false}
        // getHelpers={getHelpers}
        run={state.UI.joyride}
        scrollToFirstStep={true}
        showProgress={true}
        showSkipButton={true}
        steps={steps}
        // stepIndex={stepIndex}
        styles={{
          options: {
            zIndex: 10000
          }
        }}
ragment>
efault Component;
ent;
// CurrentModule(Component);
register(__filename, Component, true);
