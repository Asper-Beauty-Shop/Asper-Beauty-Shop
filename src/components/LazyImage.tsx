import { useState, useEffect, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ImageSkeleton } from "./ProductCardSkeleton";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  skeletonClassName?: string;
  fallbackSrc?: string;
}

export const LazyImage = ({
  src,
  alt,
  className,
  skeletonClassName,
  fallbackSrc = "/placeholder.svg",
  onLoad,
  onError,
  loading,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
  }, [src]);

  return (
    <div className="relative w-full h-full">
      {/* Skeleton placeholder */}
      {!isLoaded && !isError && (
        <ImageSkeleton className={cn("absolute inset-0 w-full h-full", skeletonClassName)} />
      )}

      {/* Actual image / fallback */}
      {isError ? (
        <img
          src={fallbackSrc}
          alt={alt}
          loading={loading ?? "lazy"}
          className={cn("opacity-100", className)}
          {...props}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading ?? "lazy"}
          className={cn(
            "transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={(e) => {
            setIsLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setIsError(true);
            onError?.(e);
          }}
          {...props}
        />
      )}
    </div>
  );
};
