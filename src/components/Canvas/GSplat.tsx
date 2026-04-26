// GSplat.tsx

"use client";

import { useLayoutEffect, useRef, type FC } from "react";
import {
  type Asset,
  type Entity as PcEntity,
  type EventHandle,
} from "playcanvas";
import { type MotionValue } from "motion/react";
import { useParent, useApp } from "@playcanvas/react/hooks";
// @ts-ignore
import vertex from "./shaders/splat-vertex.js";

interface GsplatProps {
  asset: Asset;
  swirl: MotionValue;
  opacity: MotionValue;
}

export const GSplat: FC<GsplatProps> = ({ asset, swirl, opacity }) => {
  const parent: PcEntity = useParent();
  const app = useApp();
  const assetRef = useRef<PcEntity | null>(null);
  let localTime: number = 0;
  let realTime: number = 0;
  const transitionDelay = 2.0; // Delay for the second stage transition (in seconds)

  useLayoutEffect(() => {
    let handle: EventHandle;

    if (asset) {
      assetRef.current = (asset.resource as any).instantiate({ vertex });
      parent.addChild(assetRef.current!);

      handle = app.on("update", (dt: number) => {
        realTime += dt;

        // Calculate speed multiplier: 1.0 initially, increases exponentially after 4 seconds
        let speedMultiplier = 1.0;
        if (realTime > 4.0) {
          // Exponential growth: e^((t-4)*0.5)
          // Cap the multiplier to prevent overflow of uTime in shaders
          speedMultiplier = Math.min(Math.exp((realTime - 4.0) * 1.0), 1000.0);
        }

        localTime += dt * speedMultiplier;

        if (!assetRef.current) return;

        const currentOpacity = opacity.get();

        // Culling optimization: Disable entity if invisible
        if (currentOpacity <= 0.01) {
          if (assetRef.current.enabled) assetRef.current.enabled = false;
          return;
        } else {
          if (!assetRef.current.enabled) assetRef.current.enabled = true;
        }

        const material = assetRef.current?.gsplat?.material;
        if (material) {
          material.setParameter("uTime", localTime);
          material.setParameter("uSwirlAmount", swirl.get());
          material.setParameter("uOpacity", currentOpacity);
          material.setParameter("transitionDelay", transitionDelay);

          // Enable depth writing so splat can occlude other geometry
          material.depthWrite = true;
        }
      });
    }

    return () => {
      if (!assetRef.current) return;
      if (handle) handle.off();
      parent.removeChild(assetRef.current);
    };
  }, [asset, parent]);

  return null;
};
