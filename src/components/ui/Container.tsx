import type { ComponentPropsWithoutRef, ElementType } from "react";

type ContainerProps<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>;

/** Largura máxima de 1280 px (max-w-page); margem lateral de 16 px no mobile e 24 px (page-margin) a partir de sm. */
export function Container<T extends ElementType = "div">({
  as,
  className = "",
  ...rest
}: ContainerProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={`mx-auto w-full max-w-page px-4 sm:px-page-margin ${className}`.trim()} {...rest} />;
}
