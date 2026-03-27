import { cn } from "@/lib/utils"
import { DetailedHTMLProps, ImgHTMLAttributes, useState } from "react"

interface ImageWithSkeletonProps extends DetailedHTMLProps<
  ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> {
  src: string
  alt: string
  classNames?: {
    wrapper?: string
    image?: string
  }
}

function ImageWithSkeleton({
  src,
  alt,
  classNames,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div
      className={cn(
        "bg-default-200 relative overflow-hidden rounded-lg",
        classNames?.wrapper
      )}
    >
      {isLoading && (
        <div className="via-default-300 absolute inset-0 animate-pulse bg-linear-to-r from-transparent to-transparent" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          `transition-opacity duration-300`,
          isLoading ? "opacity-0" : "opacity-100",
          hasError ? "opacity-0" : "opacity-100",
          classNames?.image
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        {...props}
      />
    </div>
  )
}

export default ImageWithSkeleton
