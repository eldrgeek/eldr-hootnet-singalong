import React from 'react'; //eslint-disable-line
import AppWrapper from './js/util/AppWrapper';
import { CurrentModule } from './js/util/1Hz';
// import "./js/util/CreateModules";
console.log('INDEX', __filename);
if (module.hot) {
	module.hot.accept(
		[
			'./js/app',
			'./js/util/AppWrapper'
			// './js/util/1Hz'

			// './js/components/App',
			// './js/util/CreateModules'
		],
		() => {
			// console.log('loading');
			CurrentModule(AppWrapper);
		}
	);
}
// CurrentModule(App);
