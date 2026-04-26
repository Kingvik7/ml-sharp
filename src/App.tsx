import "./App.css";
import styled from "styled-components";
import Canvas, { type SplatConfig } from "./components/Canvas/Canvas";

const SPLATS: SplatConfig[] = [
	{
		src: `/splats/spiderman/1.ply`,
		initialPosition: [0, -0.0, 0],
		rotation: [0, 180, 180],
		startZ: 0.1,
		endZ: -0.1,
		imageSrc: `/spiderverse.png`,
	},
	{
		src: `/splats/spiderman/2.ply`,
		initialPosition: [0, 0.01, 0],
		rotation: [5, 185, 0],
		startZ: 0.2,
		endZ: -0.1,
		imageSrc: `/spiderman.png`,
		imageInitialPosition: [0, 0.22, -1.0],
		imageScale: [0.15, 0.15, 0.15],
	},
	{
		src: `/splats/spiderman/3.ply`,
		initialPosition: [-0.01, 0.02, 0],
		rotation: [0, 180, 0],
		startZ: 0.055,
		endZ: 0.0,
	},
];

const SCROLL_SENSITIVITY = 0.0005;
const SCROLL_DAMPING = 0.1;

function App() {
	return (
		<Wrapper>
			<Canvas
				splats={SPLATS}
				scrollSensitivity={SCROLL_SENSITIVITY}
				scrollDamping={SCROLL_DAMPING}
			/>
		</Wrapper>
	);
}

export default App;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 800;
`;
