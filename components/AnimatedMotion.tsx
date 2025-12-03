/**
 * Enhanced AnimatedMotion Component with Professional Features
 * Provides advanced animations, reduced motion support, and performance optimization
 */

import React, { useEffect, useState, useMemo } from 'react';

// Lazy load Framer Motion for performance
const LazyMotion: React.FC<any> = ({ children }) => {
  const [{ motion }, setLib] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    import('framer-motion').then(mod => {
      if (mounted) setLib({ motion: mod.motion });
    });
    return () => { mounted = false; };
  }, []);

  if (!motion) return <div>{children}</div>;

  const MDiv = motion.div;
  return <MDiv>{children}</MDiv>;
};

// Animation variants and presets
export const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  }
};

export const springPresets = {
  gentle: { type: 'spring', stiffness: 100, damping: 10 },
  bouncy: { type: 'spring', stiffness: 300, damping: 15 },
  smooth: { type: 'spring', stiffness: 200, damping: 20 }
};

// LazyAnimatePresence component for conditional animation loading
export const LazyAnimatePresence: React.FC<any> = ({ children, mode = "wait", initial = true }) => {
  const [{ AnimatePresence }, setLib] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    import('framer-motion').then(mod => {
      if (mounted) setLib({ AnimatePresence: mod.AnimatePresence });
    });
    return () => { mounted = false; };
  }, []);

  if (!AnimatePresence) return <div>{children}</div>;

  return (
    <AnimatePresence
      mode={mode}
      initial={initial}
    >
      {children}
    </AnimatePresence>
  );
};

// Hook for detecting reduced motion preferences
const useReducedMotion = () => {
  const [shouldReduce, setShouldReduce] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduce(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setShouldReduce(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return shouldReduce;
};

// Enhanced LazyMotionDiv with spring animations and reduced motion
export const LazyMotionDiv: React.FC<any> = ({
  children,
  variant,
  whileHover,
  whileTap,
  transition,
  ...rest
}) => {
  const [{ motion }, setLib] = useState<any>({});
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    import('framer-motion').then(mod => {
      if (mounted) setLib({ motion: mod.motion });
    });
    return () => { mounted = false; };
  }, []);

  if (!motion) return <div {...rest}>{children}</div>;

  const MDiv = motion.div;

  // Apply reduced motion settings
  const finalTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : transition || springPresets.gentle;

  const finalWhileHover = shouldReduceMotion ? undefined : whileHover;
  const finalWhileTap = shouldReduceMotion ? undefined : whileTap;

  return (
    <MDiv
      {...rest}
      transition={finalTransition}
      whileHover={finalWhileHover}
      whileTap={finalWhileTap}
    >
      {children}
    </MDiv>
  );
};

// Staggered list container for animating children with delay
export const StaggeredList: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className }) => {
  const [{ motion }, setLib] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    import('framer-motion').then(mod => {
      if (mounted) setLib({ motion: mod.motion });
    });
    return () => { mounted = false; };
  }, []);

  if (!motion) return <div className={className}>{children}</div>;

  const MDiv = motion.div;

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <MDiv
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {children}
    </MDiv>
  );
};

// Export Framer Motion components via lazy loading
export const motion = {
  div: React.forwardRef<any, any>(({ children, ...props }, ref) => {
    const [{ motion }, setLib] = useState<any>({});

    useEffect(() => {
      let mounted = true;
      import('framer-motion').then(mod => {
        if (mounted) setLib({ motion: mod.motion });
      });
      return () => { mounted = false; };
    }, []);

    if (!motion?.div) return <div {...props} ref={ref}>{children}</div>;
    const MDiv = motion.div;
    return <MDiv {...props} ref={ref}>{children}</MDiv>;
  })
};

export const AnimatePresence = LazyAnimatePresence;
export default LazyMotionDiv;