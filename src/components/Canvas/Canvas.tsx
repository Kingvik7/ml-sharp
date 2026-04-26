import {
  AnimatePresence,
  motion,
  useMotionValue,
  animate,
  useTransform,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Application, Entity } from "@playcanvas/react";
import { Camera } from "@playcanvas/react/components";
import { OrbitControls } from "@playcanvas/react/scripts";
import { FILLMODE_FILL_WINDOW, RESOLUTION_AUTO } from "playcanvas";
import * as pc from "playcanvas";
import { gsap } from "gsap";
import Splat from "./Splat";
import { Image3D } from "./Image3D";
import { useApp } from "@playcanvas/react/hooks";

// Define the config interface here or import it
export interface SplatConfig {
  src: string;
  initialPosition: [number, number, number];
  rotation: [number, number, number];
  startZ: number; // Camera Z position at start (can be negative)
  endZ: number; // Camera Z position at end (can be negative)
  imageSrc?: string;
  imageInitialPosition?: [number, number, number];
  imageScale?: [number, number, number];
}

export default function Canvas({
  splats,
  scrollSensitivity = 0.001,
  scrollDamping = 0.1,
}: {
  splats: SplatConfig[];
  scrollSensitivity?: number;
  scrollDamping?: number;
}) {
  const [splatLoaded, setSplatLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanvasReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <CanvasWrapper>
        {canvasReady && (
          <Application
            autoRender={false}
            fillMode={FILLMODE_FILL_WINDOW}
            resolutionMode={RESOLUTION_AUTO}
            graphicsDeviceOptions={{
              antialias: false,
              powerPreference: "low-power",
            }}
            style={{
              opacity: splatLoaded ? 1 : 0,
              transition: "1s ease",
              width: "100%",
              height: "100%",
            }}
          >
            <Scene
              splats={splats}
              splatLoaded={splatLoaded}
              setSplatLoaded={setSplatLoaded}
              scrollSensitivity={scrollSensitivity}
              scrollDamping={scrollDamping}
              setLoadProgress={setLoadProgress}
              setCanScroll={setCanScroll}
            />
          </Application>
        )}
        <AnimatePresence>
          {!splatLoaded && (
            <LoadingOverlay
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut", delay: 1.0 }}
            >
              <motion.div
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <IOSSpinner />
                <LoadingText>Loading {loadProgress}%</LoadingText>
              </motion.div>
            </LoadingOverlay>
          )}

          {canScroll && (
            <ScrollIndicatorContainer
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ScrollIndicatorText>Scroll</ScrollIndicatorText>
              <ScrollChevron
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
              </ScrollChevron>
            </ScrollIndicatorContainer>
          )}
        </AnimatePresence>
      </CanvasWrapper>
    </>
  );
}

const IOSSpinner = () => {
  return (
    <SpinnerContainer>
      {Array.from({ length: 12 }).map((_, i) => (
        <SpinnerTick
          key={i}
          style={{
            rotate: `${i * 30}deg`,
            animationDelay: `-${1.1 - i * 0.1}s`,
          }}
        />
      ))}
    </SpinnerContainer>
  );
};

const fade = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.15;
  }
`;

const SpinnerContainer = styled.div`
  position: relative;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
`;

const SpinnerTick = styled.div`
  animation: ${fade} 1.2s linear infinite;
  background: #ffffffc3;
  border-radius: 5px;
  height: 25%;
  opacity: 0;
  position: absolute;
  top: 0;
  width: 2px;
  transform-origin: center 180%; // Makes it rotate around the center of the container roughly
`;

const LoadingText = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #ffffffc9;
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  gap: 5px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: black;
  color: white;
  z-index: 10;
  pointer-events: none;
`;

const TransitionOverlay = styled(motion.div)`
  position: fixed;
  top: -10%;
  left: 0;
  width: 100%;
  height: 120%;
  background: linear-gradient(180deg, #000000 0%, #000000 100%);
  z-index: 20;
  pointer-events: none;
`;

const ScrollIndicatorContainer = styled(motion.div)`
  position: fixed;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
  z-index: 100;
  pointer-events: none;
`;

const ScrollIndicatorText = styled.span`
  font-size: 12px;
  text-transform: uppercase;
  opacity: 0.8;
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
`;

const ScrollChevron = styled.svg`
  animation: ${bounce} 2s infinite;
  opacity: 0.8;
`;

const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
  & canvas {
    pointer-events: none;
  }
`;

interface SceneProps {
  splats: SplatConfig[];
  splatLoaded: boolean;
  setSplatLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  scrollSensitivity: number;
  scrollDamping: number;
  setLoadProgress: React.Dispatch<React.SetStateAction<number>>;
  setCanScroll: React.Dispatch<React.SetStateAction<boolean>>;
}

function Scene({
  splats,
  splatLoaded,
  setSplatLoaded,
  scrollSensitivity,
  scrollDamping,
  setLoadProgress,
  setCanScroll,
}: SceneProps) {
  const cameraEntityRef = useRef<pc.Entity | null>(null);
  const app = useApp();
  const imageOpacity = useMotionValue(0);
  const imagePositionY = useMotionValue(0.125); // Start at base y position

  const [loadedIndices, setLoadedIndices] = useState(new Set<number>());

  const handleSplatLoad = (index: number) => {
    setLoadedIndices((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  useEffect(() => {
    const progress =
      splats.length > 0
        ? Math.round((loadedIndices.size / splats.length) * 100)
        : 0;
    setLoadProgress(progress);

    if (
      !splatLoaded &&
      loadedIndices.size === splats.length &&
      splats.length > 0
    ) {
      setSplatLoaded(true);
      console.log("All splats loaded");
      window.postMessage({ type: "SPLATS_LOADED" }, "*");
    }
  }, [
    loadedIndices,
    splats.length,
    setSplatLoaded,
    splatLoaded,
    setLoadProgress,
  ]);

  // Fade in image and move up 3 seconds after splat loads
  useEffect(() => {
    if (splatLoaded) {
      const timer = setTimeout(() => {
        animate(imageOpacity, 1, { duration: 1, ease: "easeOut" });
        animate(imagePositionY, 0.14, { duration: 1, ease: "easeOut" });
      }, 7000);

      const scrollTimer = setTimeout(() => {
        canScrollRef.current = true;
        setCanScroll(true);
      }, 8000);

      return () => {
        clearTimeout(timer);
        clearTimeout(scrollTimer);
      };
    }
  }, [splatLoaded]);
  const orbitRef = useRef<any>(null);
  const targetYawRef = useRef(0);
  const smoothYawRef = useRef(0);
  const baseYawRef = useRef(0);
  const targetPitchRef = useRef(0);
  const smoothPitchRef = useRef(0);
  const basePitchRef = useRef(0);

  // Scroll Progress Refs
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const canScrollRef = useRef(false);

  // Array of MotionValues for splats opacity - we need to create them dynamically?
  // React Hooks must be called in integer order.
  // We'll create a list of MotionValues. Since splats prop *can* change, we should be careful,
  // but usually for config it's constant.
  // We will assume `splats` length is constant for this session.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const opacities = useRef(splats.map(() => useMotionValue(0))).current;

  // Set first one to visible initially
  useEffect(() => {
    opacities.forEach((op) => op.set(0));
    if (opacities[0]) opacities[0].set(1);
  }, [splats]);

  // Combine global image fade-in with per-splat visibility
  const imageOpacities = splats.map((_, i) =>
    useTransform(
      [imageOpacity, opacities[i]],
      ([img, splat]: number[]) => img * splat,
    ),
  );

  const overlayOpacity = useMotionValue(0);
  const overlayY = useMotionValue(0);

  useEffect(() => {
    if (!app || !cameraEntityRef.current) return;

    const orbit = cameraEntityRef.current.script?.get("orbitCamera") as any;
    if (!orbit) return;
    orbitRef.current = orbit;

    baseYawRef.current = typeof orbit.yaw === "number" ? orbit.yaw : 0;
    basePitchRef.current = typeof orbit.pitch === "number" ? orbit.pitch : 0;

    // We must manually disable PlayCanvas mouse wheel handling to allow us to use it for virtual scroll
    if (orbitRef.current) {
      const mouse = app.mouse;
      if (mouse && orbit.onMouseWheel) {
        mouse.off(pc.EVENT_MOUSEWHEEL, orbit.onMouseWheel, orbit);
      }
      orbit.distanceSensitivity = 0;
    }

    let rafId = 0;

    const maxScrollIndex = Math.max(splats.length - 1, 0);

    const update = () => {
      // 1. Camera Rotation
      smoothYawRef.current +=
        (targetYawRef.current - smoothYawRef.current) * 1.0;
      orbit.yaw = baseYawRef.current + smoothYawRef.current;

      smoothPitchRef.current +=
        (targetPitchRef.current - smoothPitchRef.current) * 1.0;
      orbit.pitch = basePitchRef.current + smoothPitchRef.current;

      // 2. Virtual Scroll Animation
      smoothProgressRef.current +=
        (targetProgressRef.current - smoothProgressRef.current) * scrollDamping;

      const p = smoothProgressRef.current; // 0 to maxScrollIndex
      const activeIndex = Math.round(p);

      // Determine valid range for this splat index
      // Normal splat i is visible from i-0.5 to i+0.5
      // First splat 0 is visible 0.0 to 0.5
      // Last splat N is visible N-0.5 to N.0
      const tStart = Math.max(0, activeIndex - 0.5);
      const tEnd = Math.min(maxScrollIndex, activeIndex + 0.5);

      let localProgress = 0;
      if (tEnd > tStart) {
        localProgress = (p - tStart) / (tEnd - tStart);
      }
      // Clamp 0..1
      localProgress = Math.min(Math.max(localProgress, 0), 1);

      // Z Position Interpolation: Allows negative values (going through origin)
      const activeSplat = splats[activeIndex];
      if (activeSplat && cameraEntityRef.current) {
        const zPos = gsap.utils.interpolate(
          activeSplat.startZ,
          activeSplat.endZ,
          localProgress,
        );
        // Get current camera position and update only Z
        const camPos = cameraEntityRef.current.getLocalPosition();
        cameraEntityRef.current.setLocalPosition(camPos.x, camPos.y, zPos);
      }

      // Overlay Logic (Dip to Black at X.5 boundaries)
      // Transition happens when we cross from one index to another, roughly at X.5
      // We check if we are inside a transition window.
      // A transition occurs around n + 0.5.
      // Let's identify the nearest boundary:
      const boundary = Math.floor(p) + 0.5;

      // But we only have boundary if boundary < maxScrollIndex
      // e.g. if indices are 0,1,2. Max=2. Boundaries are 0.5, 1.5.

      let overlayOp = 0;
      let overlayYVal = 50; // Default off-screen down? OR dynamic based on phase.

      if (boundary < maxScrollIndex) {
        const distToBoundary = p - boundary; // range approx -0.5 to 0.5

        // Transition window: +/- 0.2 (Total 0.4)
        // Shrink window further to minimize hold time.
        if (Math.abs(distToBoundary) <= 0.2) {
          // Map -0.2..0.2 to 0..1
          const t = (distToBoundary + 0.2) / 0.4;

          // Trapezoid Opacity
          // Fade spatial distance: 0.18.
          // 0.18 / 0.4 = 0.45
          // 0 -> 0.45: Fade In
          // 0.45 -> 0.55: Hold Black (Width 0.1 = 0.04 spatial)
          // 0.55 -> 1.0: Fade Out
          if (t < 0.45) {
            overlayOp = t / 0.45; // 0->1
          } else if (t < 0.55) {
            overlayOp = 1; // Hold
          } else {
            overlayOp = 1 - (t - 0.55) / 0.45; // 1->0
          }

          // Y Motion: -50 -> 50
          overlayYVal = gsap.utils.interpolate(-50, 50, t);
        } else {
          // Outside transition
          overlayOp = 0;
          // If we are before boundary (ActiveIndex < Boundary), we are "above" (-50?) or default?
          // Only matters during transition.
          overlayYVal = 50;
        }
      }

      overlayOpacity.set(overlayOp);
      overlayY.set(overlayYVal);

      // Opacity Switch (Visibility)
      // Simple switch activeIndex
      opacities.forEach((op, idx) => {
        op.set(idx === activeIndex ? 1 : 0);
      });

      app.render();
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    // --- Event Listeners ---

    const onPointerMove = (e: PointerEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      targetYawRef.current = normX * 2;

      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      targetPitchRef.current = -normY * 2;
    };

    const onWheel = (e: WheelEvent) => {
      if (!canScrollRef.current) return;
      targetProgressRef.current = Math.min(
        Math.max(targetProgressRef.current + e.deltaY * scrollSensitivity, 0),
        maxScrollIndex,
      );
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("wheel", onWheel);
    };
  }, [app, splats, scrollSensitivity, scrollDamping]);

  return (
    <>
      <Entity name="camera" ref={cameraEntityRef}>
        <Camera fov={35} clearColor="transparent" />
        <OrbitControls
          distanceMin={0.001} // Allow very close zoom
          distance={0.4}
          distanceMax={10}
          pitchAngleMax={8}
          pitchAngleMin={2}
          inertiaFactor={0}
          mouse={{
            orbitSensitivity: 0,
            distanceSensitivity: 0,
          }}
        />
      </Entity>

      {splats.map((splat, i) => (
        <React.Fragment key={i}>
          <Splat
            src={splat.src}
            opacity={opacities[i]}
            position={splat.initialPosition}
            rotation={splat.rotation}
            onLoad={() => handleSplatLoad(i)}
          />
          {splat.imageSrc && (
            <Image3D
              src={splat.imageSrc}
              position={splat.imageInitialPosition ?? [0, 0.0, -0.65]}
              positionY={
                splat.imageInitialPosition ? undefined : imagePositionY
              }
              rotation={[90, 0, 0]}
              scale={splat.imageScale ?? [0.085, 0.085, 0.085]}
              opacity={imageOpacities[i]}
            />
          )}
        </React.Fragment>
      ))}

      <TransitionOverlay style={{ opacity: overlayOpacity, y: overlayY }} />
    </>
  );
}
