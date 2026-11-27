import type { ImageRef } from "@shop/contracts"

/**
 * A product photo at 4:5 on the neutral photo ground, never tinted or covered
 * (DESIGN.md). Plain `img`: the files come from the shop's catalog bucket.
 */
export function Photo({
  image,
  className = "",
  priority = false,
}: {
  image: ImageRef
  className?: string
  priority?: boolean
}) {
  return (
    <span className={`block aspect-[4/5] overflow-hidden rounded-md bg-photo-ground ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-cover"
      />
    </span>
  )
}
