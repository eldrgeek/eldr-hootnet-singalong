export const C = (filename, opts = '') => {
	const fns = {
		log: (...args) => {
			console.log(...args, `(${filename})`);
		},
		error: (...args) => {
			console.error(...args, `(${filename})`);
		},
		warn: (...args) => {
			console.warn(...args, `(${filename})`);
		}
	};
	return fns;
};

export const CLPrint = (category, state = true) => {};

// const CL = C.bind(__filename)

// import {C} from "./CL"
// const CL = C(__filename)
