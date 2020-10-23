import React from 'react'; //eslint-disable-line
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ButtonBase from './ButtonBase';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import { C } from '../util/CL';
const CL = C(__filename);

const Default = () => {
	return <div>element to drag goes here</div>;
};

const Component = ({ Element = Default, children }) =>
	// : {
	// 	Element: React.FC;
	// 	children?: Array<React.FC>;
	// }
	{
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
		const { actions, state } = useApp();
		//@ts-ignore
		return (
			<React.Fragment>
				<div className="wrapperparent w-8 h-2 inline-block ">
					<TransformWrapper
						defaultScale={1}
						options={{
							limitToBounds: false,
							limitToWrapper: false
						}}
					>
						<TransformComponent>
							{children ? children : <Element />}
							<br />
							{/* <img src="image.jpg" alt="test" /> */}
							{/* <div className="">
								arrow
								<ButtonBase icon={faArrowsAlt} />
							</div> */}
						</TransformComponent>
					</TransformWrapper>
				</div>
			</React.Fragment>
		);
	};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);
