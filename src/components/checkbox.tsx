import React from 'react';
import { Checkbox, cn, CheckboxProps } from "@heroui/react";

interface CustomCheckboxProps extends CheckboxProps {
  name: string;
  description?: string;
  startContent?: React.ReactElement;
  value?: string;
}

export const CustomCheckbox = (props: CustomCheckboxProps) => {
  const { name, description, startContent, value, ...otherprops } = props;
  return (
    <Checkbox
      aria-label={name}
      classNames={{
        base: cn(
          'inline-flex max-w-md w-full bg-content1 m-0',
          'hover:bg-content2 items-center justify-start',
          'cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent',
          'data-[selected=true]:border-primary'
        ),
        label: 'w-full',
      }}
      value={value}
      {...otherprops}
    >
      <div className='w-full flex justify-between gap-2'>
        <div className='flex gap-2 items-center'>
          <div className='flex'>{startContent}</div>
          <div className='flex flex-col gap-1'>
            <p className='text-lg'>{name}</p>
            <p className='text-sm text-foreground-400'>{description}</p>
          </div>
        </div>
      </div>
    </Checkbox>
  );
};
