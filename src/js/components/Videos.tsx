//@ts-ignore
import React, { JSX } from 'react'; //eslint-disable-line
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import Video from './Video';

// export type Element = () => JSX.Element;
// const TSTransforComponent = TransformComponent;
//eslint-disable-next-line
const CL = (...args) => {
	//eslint-disable-line
	console.log(...args, `(${__filename})`);
};
const Videos = () => {
	const { state, actions } = useApp(); //eslint-disable-line
	React.useEffect(() => {
		// actions.videos._test();
		console.clear();

		const trans1 = document.querySelectorAll('.wrapperparent');
		CL('groupc', trans1.length);
		for (let i = 0; i < trans1.length; i++) {
			// trans[i].style.fontFamily = 'Comic Sans MS';
			CL('trans', trans1[i].firstChild);
			//@ts-ignore
			trans1[i].firstChild.style.overflow = 'visible';
		}
	});
	/*

	options={{
                    limitToBounds,
                    transformEnabled,
                    disabled,
                    limitToWrapper,
                  }}
	*/
	return (
		<React.Fragment>
			{Object.keys(state.videos.videos).map((key, index) => {
				return (
					<div className="wrapperparent">
						<TransformWrapper
							key={key}
							options={{
								limitToBounds: false,
								limitToWrapper: false
							}}
						>
							<TransformComponent>
								<Video key={key} id={key} />;
								{/* <img src="image.jpg" alt="test" /> */}
							</TransformComponent>
						</TransformWrapper>
					</div>
				);
			})}
		</React.Fragment>
	);
};
export default Videos;
// CurrentModule(Videos);
register(__filename, Videos, true);
