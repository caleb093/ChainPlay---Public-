import React, { FC, ReactNode, useEffect, useRef } from "react";
// import CloseIcon from "../../../public/svgs/close-icon.svg"
import {X} from "lucide-react"
import { twMerge } from "tailwind-merge";
import Image from "next/image";

interface modalType {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode
  className?: unknown;
  containerClassname?: string
  closeOnClickOutside?: boolean;
  hideCloseIcon?: boolean;
  loading?: boolean;
  showBot?: boolean;
}

export const Loadingline = () => {
  return (
    <div className="loading-line"></div>
  )
}

const Modal: FC<modalType> = ({ isOpen, showBot, onClose, loading, hideCloseIcon, children, className = "", containerClassname, closeOnClickOutside = true }) => {

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      
      if (!closeOnClickOutside) return;

      const handleClickOutside = (event: MouseEvent) => {
        // FOR MATERIAL UI TIME AND DATE PICKER 
        const pickerPopups = Array.from(document.querySelectorAll(".MuiPopper-root, .MuiPopover-root"));
        for (let popup of pickerPopups) {
          if (popup.contains(event.target as Node)) {
            return;
          }
        }
        //////////////////////////////////////////

      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          onClose();
        }
      };
  
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, onClose, closeOnClickOutside]);

    if (!isOpen) {
      return null;
    }
    // "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    return (
      <div className="fixed h-screen w-screen z-[25] inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
         
        <div className={twMerge(`relative text-white w-full sm:w-auto `)}>
          {showBot && (
            <Image src={'/assets/pbot/pbot-wave.webp'} className="absolute z-[1] left-0 -top-18 w-30 h-30 mx-auto mb-4" alt="logo" height={120} width={120} />
          )}
          <div ref={modalRef} className={twMerge(`px-4 relative text-white rounded-lg mx-auto py-6 retro-card w-[90%] max-h-[80vh] sm:w-[35em] overflow-auto z-[2] ${containerClassname}`)}>
            {!hideCloseIcon && <button className="absolute border-2 cursor-pointer border-gray-500 rounded-sm right-4 sm:right-2 text-gray-300 z-[2] scale-[0.8] -mt-4" onClick={onClose}>
              <X />
            </button>}
            {loading && <Loadingline />}
            <div className={`${className} ${loading && "opacity-[0.5] pointer-events-none cursor-not-allowed"} `}>{children}</div>
          </div>
        </div>
        
      </div>
    );
  };

export default React.memo(Modal)