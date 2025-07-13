import { useHoldStack } from "@/components/HoldStack/index.hook";
import { cn } from "@/lib/utils/cn";

export const HoldStack = () => {
  const { onMouseDown, onMouseUp, isCompleted, displayNumbers } =
    useHoldStack();

  return (
    <div className="min-h-screen grid place-items-center relative">
      <button
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        type="button"
        disabled={isCompleted}
        className="absolute inset-0 z-10"
      />
      <div
        className={cn(
          "flex items-center gap-x-4 text-2xl font-bold",
          isCompleted && "text-green-500",
        )}
      >
        {displayNumbers.length === 0 && <p>Hold the screen with your wish!</p>}
        {displayNumbers.map((num) => (
          <span key={num} className="choosed-number">
            {num}
          </span>
        ))}
      </div>
    </div>
  );
};
