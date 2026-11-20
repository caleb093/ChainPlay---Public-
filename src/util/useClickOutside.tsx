import { useEffect, useRef } from 'react';

function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  // @ts-ignore
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // // Check if click was outside the referenced element
      // i
  // @ts-ignore
  return ref;
}

export default useClickOutside;