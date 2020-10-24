let CLPrintStatus = {};
export const C = (filename, category?) => {
	return (...args) => {
		if (!category || CLPrintStatus[category] === true)
			console.log(...args, `(${filename})`);
	};
};
export const CLPrint = (category, state = true) => {
	CLPrintStatus[category] = state;
};

// const CL = C.bind(__filename)

// import {C} from "./CL"
// const CL = C(__filename)
