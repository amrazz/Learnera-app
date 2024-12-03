import { useEffect, useRef } from "react";

const useSlideOnScroll = (direction) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight) {
          ref.current.classList.add(direction === 'left' ? 'animate-slideLeft' : 'animate-slideRight');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [direction]);

  return ref;
};

export { useSlideOnScroll };
