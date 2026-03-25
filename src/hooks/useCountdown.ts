'use client';

import { useState, useEffect, useCallback } from 'react';

interface CountdownValues {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isExpired: boolean;
}

export function useCountdown(daysFromNow: number = 3, hoursExtra: number = 22, minutesExtra: number = 15, secondsExtra: number = 10): CountdownValues {
  const getTargetDate = useCallback(() => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    target.setHours(target.getHours() + hoursExtra);
    target.setMinutes(target.getMinutes() + minutesExtra);
    target.setSeconds(target.getSeconds() + secondsExtra);
    return target;
  }, [daysFromNow, hoursExtra, minutesExtra, secondsExtra]);

  const [targetDate] = useState<Date>(getTargetDate);
  const [values, setValues] = useState<CountdownValues>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isExpired: false,
  });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setValues({ days: '00', hours: '00', minutes: '00', seconds: '00', isExpired: true });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setValues({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isExpired: false,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return values;
}
