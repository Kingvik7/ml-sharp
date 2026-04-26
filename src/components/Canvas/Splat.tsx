import { useEffect, useState } from "react";
import { useApp } from "@playcanvas/react/hooks";
import { Entity } from "@playcanvas/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { GSplat } from "./GSplat";
import { animate, useSpring } from "motion/react";
import { type Asset } from "playcanvas";
import { fetchAsset } from "@playcanvas/react/utils";

gsap.registerPlugin(useGSAP);

interface SplatProps {
  src: string;
  opacity: any; // MotionValue
  onLoad?: () => void;
  position?: [number, number, number];
  rotation?: [number, number, number];
  isAnimated?: boolean;
  onAnimationComplete?: () => void;
}

export default function Splat({
  src,
  opacity,
  onLoad,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isAnimated = false,
  onAnimationComplete,
}: SplatProps) {
  const swirl = useSpring(isAnimated ? 1 : 0);
  const { data: splat } = useSplat(src);

  useEffect(() => {
    if (splat) {
      if (onLoad) onLoad();
      if (isAnimated) {
        animate(swirl, 0, {
          duration: 5,
          onComplete: onAnimationComplete,
        });
      } else {
        swirl.set(0);
      }
    }
  }, [splat, isAnimated]);

  return (
    <Entity
      name="splat"
      rotation={rotation}
      position={position}
      scale={[0.1, 0.1, 0.1]}
    >
      <GSplat swirl={swirl} asset={splat as Asset} opacity={opacity} />
    </Entity>
  );
}

const useAsset = (
  src: string,
  type: string,
  props: Record<string, unknown>,
) => {
  const app = useApp();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!app) return;

    setLoading(true);
    setError(null);

    fetchAsset(app, src, type, props)
      .then((result) => {
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [app, src, type, JSON.stringify(props)]);

  return { data, loading, error };
};

const useSplat = (src: string, props = {}) => useAsset(src, "gsplat", props);
