type CountdownOptions = {
  endsAt: number;
  setState: React.Dispatch<React.SetStateAction<number>>;
  intervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
};

export const startCountdown = ({
  endsAt,
  setState,
  intervalRef,
}: CountdownOptions) => {

  if (intervalRef.current) {
    clearInterval(intervalRef.current);
  }

  const updateCountdown = () => {
    const remaining = Math.max(
      0,
      Math.floor((endsAt - Date.now()) / 1000)
    );

    setState(remaining);

    if (remaining <= 0) {
      stopCountdown(intervalRef);
    }
  };

  // run immediately so UI updates instantly
  updateCountdown();

  intervalRef.current = setInterval(updateCountdown, 1000);
};

export const stopCountdown = (
  intervalRef: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
};
