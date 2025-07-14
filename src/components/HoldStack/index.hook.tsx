import type * as React from "react";
import { useCallback, useRef, useState } from "react";

type AnimationLifecycle = {
  onUpdate: (ratio: number) => void;
  onComplete: () => void;
};

type AnimationParams = {
  computedRatio: (elapsed: number) => number;
  shouldContinue: (ratio: number) => boolean;
} & AnimationLifecycle;

type TriggerAnimationParams = {
  duration: number;
  params: AnimationLifecycle;
};

const THRESHOLDS = [0, 20, 40, 60, 80, 100];

export const useHoldStack = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const animationFrameId = useRef<number>(null);
  const ratio = useRef(0);
  const prevRatio = useRef(0);
  const choosedNumbers = useRef<number[]>([]);
  const candidateNumbers = useRef<number[]>(
    Array.from({ length: 43 }, (_, i) => i + 1),
  );
  const [displayNumbers, setDisplayNumbers] = useState<number[]>([]);

  const animate = useCallback(
    ({
      computedRatio,
      shouldContinue,
      onUpdate,
      onComplete,
    }: AnimationParams) => {
      const start = performance.now();

      const loop = () => {
        const now = performance.now();
        const elapsed = now - start;
        ratio.current = computedRatio(elapsed);
        onUpdate(ratio.current);

        if (shouldContinue(ratio.current)) {
          animationFrameId.current = requestAnimationFrame(loop);
        } else {
          animationFrameId.current = null;
          onComplete();
        }
      };

      animationFrameId.current = requestAnimationFrame(loop);
    },
    [],
  );

  const startStacking = useCallback(
    ({ params, duration }: TriggerAnimationParams) => {
      animate({
        ...params,
        computedRatio: (elapsed) =>
          Math.min(elapsed / duration + prevRatio.current, 1),
        shouldContinue: (ratio) => ratio < 1,
      });
    },
    [animate],
  );

  const startUnstacking = useCallback(
    ({ params, duration }: TriggerAnimationParams) => {
      animate({
        ...params,
        computedRatio: (elapsed) =>
          Math.max(0, prevRatio.current - elapsed / duration),
        shouldContinue: (ratio) => ratio > 0,
      });
    },
    [animate],
  );

  const drawNextNumber = useCallback(() => {
    const randomIndex = Math.floor(
      Math.random() * candidateNumbers.current.length,
    );
    const choosedNumber = candidateNumbers.current[randomIndex];
    candidateNumbers.current = candidateNumbers.current.filter(
      (num) => num !== choosedNumber,
    );
    choosedNumbers.current.unshift(choosedNumber);
    setDisplayNumbers([...choosedNumbers.current]);
  }, []);

  const updateProgressOnStacking = useCallback(
    (ratio: number) => {
      const progressRatio = Math.floor(ratio * 100);

      for (let i = 0; i < THRESHOLDS.length - 1; i++) {
        if (
          progressRatio >= THRESHOLDS[i] &&
          progressRatio < THRESHOLDS[i + 1] &&
          choosedNumbers.current.length < i + 1
        ) {
          drawNextNumber();
          break;
        }
      }
    },
    [drawNextNumber],
  );

  const removeFirstNumber = useCallback(() => {
    candidateNumbers.current.push(choosedNumbers.current[0]);
    choosedNumbers.current = choosedNumbers.current.slice(1);
    setDisplayNumbers([...choosedNumbers.current]);
  }, []);

  const updateProgressOnUnstacking = useCallback(
    (ratio: number) => {
      const progressRatio = Math.floor(ratio * 100);

      for (let i = 0; i < THRESHOLDS.length - 1; i++) {
        if (
          progressRatio >= THRESHOLDS[i] &&
          progressRatio < THRESHOLDS[i + 1] &&
          choosedNumbers.current.length >= i + 1
        ) {
          removeFirstNumber();
          break;
        }
      }
    },
    [removeFirstNumber],
  );

  const handleStacking = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.TouchEvent<HTMLButtonElement>,
    ) => {
      e.preventDefault();

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      startStacking({
        duration: 3000,
        params: {
          onUpdate: (ratio) => updateProgressOnStacking(ratio),
          onComplete: () => {
            drawNextNumber();
            setDisplayNumbers((prev) => [...prev].sort((a, b) => a - b));
            setIsCompleted(true);
          },
        },
      });

      prevRatio.current = ratio.current;
    },
    [startStacking, updateProgressOnStacking, drawNextNumber],
  );

  const handleUnstacking = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.TouchEvent<HTMLButtonElement>,
    ) => {
      e.preventDefault();

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      startUnstacking({
        duration: 1000,
        params: {
          onUpdate: (ratio) => updateProgressOnUnstacking(ratio),
          onComplete: () => {},
        },
      });

      prevRatio.current = ratio.current;
    },
    [startUnstacking, updateProgressOnUnstacking],
  );

  const handleReset = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.TouchEvent<HTMLButtonElement>,
    ) => {
      e.preventDefault();

      setIsCompleted(false);
      animationFrameId.current = null;
      ratio.current = 0;
      prevRatio.current = 0;
      choosedNumbers.current = [];
      candidateNumbers.current = Array.from({ length: 43 }, (_, i) => i + 1);
      setDisplayNumbers([]);
    },
    [],
  );

  return {
    handleStacking,
    handleUnstacking,
    handleReset,
    isCompleted,
    displayNumbers,
  };
};
