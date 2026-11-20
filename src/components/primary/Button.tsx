import { appContext } from "@/contexts/appContext";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { useContext } from "react";

type ButtonProps = {
  children: React.ReactNode;
  onMouseEnter?: () => void;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: any;
};

const Button: React.FC<ButtonProps> = ({ children, onMouseEnter, type, onClick, disabled, className }) => {
  const {playSfx} = useContext(appContext)
  return (
    <button
      onMouseEnter={onMouseEnter}
      onClick={() => {onClick && onClick(), playSfx("normalInteraction")}}
      type={type}
      disabled={disabled}
      className={twMerge(`
        px-8 py-2 cursor-pointer rounded-md text-white
        bg-brandPrimary hover:bg-pink-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200 ${className}
      `)}
    >
      {children}
    </button>
  );
};

export default Button;
