import { cn } from "@/lib/utils";

/**
 * Komponen Atom Skeleton Loader
 * Dilengkapi animasi pulse/shimmer dan atribut aksesibilitas screen reader
 * Standar acuan: Handbook Section 11.3 (UI Resilience & Aksesibilitas)
 */
export const Skeleton = ({
  className,
  "aria-hidden": ariaHidden = true,
  ...props
}) => {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn(
        "animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-700/50",
        className
      )}
      {...props}
    />
  );
};

/**
 * Card Skeleton Loader
 * Digunakan untuk preview pemuatan kartu pengurus, berita, program, dan galeri.
 * Mendukung kustomisasi className, props, dan opsi penggandaan (count).
 */
export const CardSkeleton = ({
  className,
  count = 1,
  showAvatar = true,
  ...props
}) => {
  const cards = Array.from({ length: count });

  if (count > 1) {
    return (
      <>
        {cards.map((_, index) => (
          <CardSkeleton
            key={`card-skeleton-${index}`}
            className={className}
            showAvatar={showAvatar}
            {...props}
          />
        ))}
      </>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4",
        className
      )}
      {...props}
    >
      <span className="sr-only">Memuat data kartu...</span>
      {showAvatar && (
        <Skeleton className="w-20 h-20 rounded-full mx-auto" />
      )}
      <Skeleton className="h-5 w-3/4 mx-auto rounded" />
      <Skeleton className="h-4 w-1/2 mx-auto rounded" />
      <div className="pt-2 space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 mx-auto rounded" />
      </div>
    </div>
  );
};

/**
 * Table Skeleton Loader
 * Digunakan untuk loading baris tabel data admin (Korwil, Proker, Kader, dll.)
 */
export const TableSkeleton = ({
  rows = 5,
  columns = 5,
  className,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn("divide-y divide-gray-100 w-full", className)}
      {...props}
    >
      <span className="sr-only">Memuat data tabel...</span>
      {Array.from({ length: rows }).map((_, rIndex) => (
        <div
          key={`table-skeleton-row-${rIndex}`}
          className="flex items-center gap-4 py-4 px-6"
        >
          {Array.from({ length: columns }).map((_, cIndex) => (
            <Skeleton
              key={`table-skeleton-cell-${rIndex}-${cIndex}`}
              className={cn(
                "h-4 rounded",
                cIndex === 0
                  ? "w-1/4"
                  : cIndex === columns - 1
                  ? "w-20 ml-auto"
                  : "flex-1"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Default export
export default Skeleton;
