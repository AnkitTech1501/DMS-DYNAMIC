import { useEffect, useRef, useState } from 'react';
import { subscribe } from '../utils/loadingBar';

export default function LoadingBar() {
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribe((state) => {
      if (state === 'loading') {
        clearInterval(timerRef.current);
        setVisible(true);
        setWidth(15);
        timerRef.current = setInterval(() => {
          setWidth((w) => (w < 85 ? w + Math.random() * 10 : w));
        }, 250);
      } else {
        clearInterval(timerRef.current);
        setWidth(100);
        setTimeout(() => {
          setVisible(false);
          setWidth(0);
        }, 350);
      }
    });

    return () => {
      unsubscribe();
      clearInterval(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="dms-loading-bar-track">
      <div className="dms-loading-bar-fill" style={{ width: `${width}%` }} />
    </div>
  );
}