import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Modern Shimmer Skeleton Component
 */
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-700/50",
        className
      )}
      {...props}
    />
  );
};

/**
 * Card Skeleton Loader for Members, News, Programs, and Gallery
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
      <Skeleton className="w-20 h-20 rounded-full mx-auto" />
      <Skeleton className="h-5 w-3/4 mx-auto rounded" />
      <Skeleton className="h-4 w-1/2 mx-auto rounded" />
      <div className="pt-2 space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 mx-auto rounded" />
      </div>
    </div>
  );
};

export default Skeleton;
