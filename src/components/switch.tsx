"use client"
import {useState} from "react";
import {Switch, cn} from "@nextui-org/react";

export default function Component({name, description, default_value = false, onValueChange}: {name: string, description?: string, default_value?: boolean, onValueChange?: ((value: boolean) => void) | (() => void)}) {
  const [isSelected, setIsSelected] = useState(default_value);
  const handleClick = () => {
    const value = !isSelected;
    setIsSelected(value);
    onValueChange?.(value);
  };
  return (
    <Switch isSelected={isSelected} onValueChange={handleClick}
      classNames={{
        base: cn(
          "inline-flex flex-row-reverse w-full max-w-full bg-content1 hover:bg-content2 items-center",
          "justify-between cursor-pointer rounded-2xl gap-2 p-6 border-3 border-transparent",
          "data-[selected=true]:border-primary",
        ),
        wrapper: "p-0 h-4 overflow-visible",
        thumb: cn(
          "w-6 h-6 border-2 shadow-lg",
          "group-data-[hover=true]:border-primary",
          //selected
          "group-data-[selected=true]:ms-6",
          // pressed
          "group-data-[pressed=true]:w-7",
          "group-data-[selected]:group-data-[pressed]:ms-4",
        ),
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-2xl">{name}</p>
        <p className="text-lg text-default-400">{description}</p>
      </div>
    </Switch>
  );
}
