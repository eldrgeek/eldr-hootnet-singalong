// import { Action } from "../index";
import React from "react";
import { CurrentModule, useApp, app } from "./CurrentModule";
import { Button as MaterialButton } from "@material-ui/core";
import { TextareaAutosize } from "@material-ui/core";
import { action } from "overmind";

const Button = (props) => {
  return (
    <MaterialButton variant="contained" color="primary" {...props}>
      {props.children}
    </MaterialButton>
  );
};
const spec = {
  name: "UI",
  // types: 'Registration',
  types: "",
  state: "textInput,isDialogVisible",
  actions: "setTextInput,setDialogVisible",
  components: "IconButton",
  styled: "Button"
};

const createStuff = (spec) => {
  const [junk, prefix, stateInitial, stateRest] = spec.name.match(
    /([_]?)(\w)(\w*)/
  );
  const capsName = prefix + stateInitial.toUpperCase() + stateRest;
  const stateImport = `import {
  state as ${spec.name}, 
  State as ${capsName}State 
} from "./namespaced/${spec.name}"
`;

  const actionsType = stateInitial.toUpperCase() + stateRest + "Actions";
  const actionsImport = `import {
  actions as ${spec.name},
  Actions as ${capsName}Actions
} from "./namespaced/${spec.name}";
`;

  const actionsAdd = `${spec.name}: ${actionsType},`;
  const namespace = `
import { Action } from "../index";
import React from "react";
import { CurrentModule, useApp, app } from "../../util/CurrentModule";

${spec.types.split(",").map((type) => {
  return `type ${type} = {
}
`;
})}

export type Actions = {
${spec.actions
  .split(",")
  .map((action) => {
    return `  ${action}: Action;
`;
  })
  .join("")}};

export const actions: Actions = {
${spec.actions
  .split(",")
  .map((action) => {
    return `  ${action}: ({ state, actions }) => {

  }`;
  })
  .join(",\n")}
}

export type State = {
${spec.state
  .split(",")
  .map((state) => {
    return `  ${state}: any;`;
  })
  .join("\n")}
};

export const state: State = {
${spec.state
  .split(",")
  .map((state) => {
    return `  ${state}: null;
`;
  })
  .join("")}};
`;
  const component = `
import React from "react";
import { CurrentModule, useApp, register } from "../util/CurrentModule";
import { ${spec.components}} from "@material-ui/core";
import styled from "styled-components";

const CL = (...args) => {
  console.log(...args, \`(${__filename})\`);
};

${spec.styled.split(",").map(
  (styled) =>
    `
  const Styled${styled} = styled(${styled})
  color: green;
  &:hover {
    
  }
  \`;
  `
)}

const Component = ({
  
}) => {
  return (
    <React.Fragment>
${spec.components
  .split(",")
  .map(
    (component) => `      <${component}> </${component}>
`
  )
  .join("")}
${spec.styled
  .split(",")
  .map(
    (component) => `      <Styled${component}> </Styled${component}>
`
  )
  .join("")}
    </React.Fragment>
  );
};

export default Component;
CurrentModule(Component);
register(__filename, Component, true);
`;

  return {
    stateImport,
    actionsImport,
    actionsAdd,
    name: spec.name,
    namespace,
    component
  };
};
const Component = () => {
  const { state, actions } = useApp();
  const copyToClipboard = (text) => {
    console.log("COPY", text);
    const copyText = document.querySelector("#fakeClipboard");
    copyText.value = text;
    copyText.select();
    document.execCommand("copy");
  };

  // console.log("call component wraps");
  return (
    <React.Fragment>
      {"stateImport,actionsImport,actionsAdd,name,namespace,component"
        .split(",")
        .map((key) => {
          return (
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={() => copyToClipboard(createStuff(spec)[key])}
              >
                {key}
              </Button>
            </div>
          );
        })}
      <input id="fakeClipboard" type="text" />
    </React.Fragment>
  );
};
export default Component;
CurrentModule(Component);
