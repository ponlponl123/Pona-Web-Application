import { cn, Radio as NextUIRadio, RadioProps } from "@nextui-org/react";

export const Radio = (props: RadioProps) => {
  const {children, ...otherProps} = props;

  return (
    <NextUIRadio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row-reverse max-w-full cursor-pointer rounded-xl gap-4 p-4 border-3 border-transparent",
          "data-[selected=true]:border-primary",
        ),
      }}
    >
      {children}
    </NextUIRadio>
  );
};