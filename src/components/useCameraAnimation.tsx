import { useEffect, useRef, useState } from "react";

// Utility function for easing (optional, can use libraries like gsap for more complex easing)
const easeInOutQuad = (t: number) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

function useCameraAnimation({
  targetValue,
  currentValue,
  duration,
  easing = easeInOutQuad,
  onComplete,
}: {
  targetValue: number;
  currentValue: number;
  duration: number;
  easing?: (t: number) => number;
  onComplete?: () => void;
}) {
  const [value, setValue] = useState(currentValue);
  const [enabled, setEnabled] = useState(false); // Will control the OrbitControls
  const startTime = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  // Manage the animation progress
  useEffect(() => {
    const startAnimation = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsedTime = timestamp - startTime.current;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easing(progress);
      const newValue =
        currentValue + (targetValue - currentValue) * easedProgress;

      setValue(newValue);

      // When the animation completes, enable controls and call onComplete
      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(startAnimation);
      } else {
        if (onComplete) onComplete();
        setEnabled(true); // Enable OrbitControls after animation finishes
        cancelAnimationFrame(animationFrameId.current!);
      }
    };

    animationFrameId.current = requestAnimationFrame(startAnimation);

    return () => {
      cancelAnimationFrame(animationFrameId.current!);
    };
  }, [targetValue, currentValue, duration, easing, onComplete]);

  return { value, enabled };
}

export default useCameraAnimation;
