import { useHoldStack } from "@/components/HoldStack/index.hook";
import { cn } from "@/lib/utils/cn";

export const HoldStack = () => {
  const {
    handleStacking,
    handleUnstacking,
    handleReset,
    isCompleted,
    displayNumbers,
  } = useHoldStack();

  return (
    <div className="min-h-[100svh] grid place-items-center relative">
      <button
        onMouseDown={handleStacking}
        onMouseUp={handleUnstacking}
        onTouchStart={handleStacking}
        onTouchEnd={handleUnstacking}
        type="button"
        disabled={isCompleted}
        className={cn("absolute inset-0 z-10", isCompleted && "hidden")}
      />
      <div>
        {displayNumbers.length === 0 && (
          <p className="text-2xl font-bold">Hold the screen with your wish!</p>
        )}
        {displayNumbers.length > 0 && (
          <div className="flex flex-col items-center">
            <p
              className={cn(
                "invisible transition-all delay-100 opacity-0",
                isCompleted && "visible opacity-100",
              )}
            >
              These are your lucky numbers.
            </p>
            <ul className="mt-4 flex items-center gap-x-4 text-2xl font-bold">
              {displayNumbers.map((num) => (
                <li key={num} className="choosed-number">
                  {num}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleReset}
              className={cn(
                "mt-6 text-gray-500 text-sm underline invisible transition-all delay-100 opacity-0",
                isCompleted && "visible opacity-100",
              )}
            >
              Try your luck again?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
