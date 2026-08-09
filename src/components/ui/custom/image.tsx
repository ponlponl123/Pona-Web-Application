import { cn } from "@/lib/utils"
import NextImage from "next/image"
import React, { useState } from "react"

export interface ImageWithSkeletonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  unoptimized?: boolean
  priority?: boolean
  classNames?: {
    wrapper?: string
    image?: string
  }
  imageClassName?: string
}

function ImageWithSkeleton({
  src,
  alt,
  width,
  height,
  className,
  classNames,
  imageClassName,
  style,
  unoptimized = true,
  priority,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const isNumericWidthHeight =
    typeof width === "number" && typeof height === "number"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/20",
        !isNumericWidthHeight && "w-full h-full",
        className,
        classNames?.wrapper
      )}
      style={{
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined ? { height } : {}),
        ...style,
      }}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted/40 z-10 pointer-events-none" />
      )}
      {isNumericWidthHeight ? (
        <NextImage
          src={src}
          alt={alt}
          width={width as number}
          height={height as number}
          unoptimized={unoptimized}
          priority={priority}
          className={cn(
            "transition-opacity duration-300 object-cover w-full h-full",
            isLoading ? "opacity-0" : "opacity-100",
            hasError ? "opacity-0" : "opacity-100",
            imageClassName,
            classNames?.image
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      ) : (
        <NextImage
          src={src}
          alt={alt}
          fill
          unoptimized={unoptimized}
          priority={priority}
          className={cn(
            "transition-opacity duration-300 object-cover",
            isLoading ? "opacity-0" : "opacity-100",
            hasError ? "opacity-0" : "opacity-100",
            imageClassName,
            classNames?.image
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}

export default ImageWithSkeleton
