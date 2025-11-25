'use client';
import { cn } from '@/lib/utils';
import { useMotionValue, motion, useAnimationFrame } from 'motion/react';
import { useState, useRef } from 'react';
import useMeasure from 'react-use-measure';

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const baseSpeed = isHovered && speedOnHover !== undefined ? speedOnHover : speed;
  const directionFactor = reverse ? 1 : -1;
  const targetVelocity = baseSpeed * directionFactor;

  const velocityRef = useRef(targetVelocity);
  const hasDragged = useRef(false);

  useAnimationFrame((t, delta) => {
    if (isDragging) return;

    // Determine the wrapping distance
    // The container has two copies of children + gap between them
    // width = 2 * content + gap
    // We want to wrap every (content + gap)
    // content + gap = (width + gap) / 2
    const size = direction === 'horizontal' ? width : height;
    if (!size) return;
    
    const contentSize = (size + gap) / 2;
    
    // Apply decay/lerp to velocity to return to target speed
    const diff = targetVelocity - velocityRef.current;
    const lerpFactor = 0.05; // Adjust for smoother/faster recovery
    if (Math.abs(diff) > 0.5) {
      velocityRef.current += diff * lerpFactor;
    } else {
      velocityRef.current = targetVelocity;
    }

    // Move
    const moveBy = velocityRef.current * (delta / 1000);
    let current = translation.get();
    let next = current + moveBy;

    // Wrap logic
    if (next < -contentSize) {
      next += contentSize;
      // If we wrapped, we might need to adjust current to avoid visual jump if framer was tracking it?
      // No, we are setting it.
    } else if (next > 0) {
      next -= contentSize;
    }

    translation.set(next);
  });

  const onDragStart = () => {
    hasDragged.current = true;
    setIsDragging(true);
  };

  const onDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    // Capture the throw velocity from the drag gesture
    const throwVelocity = direction === 'horizontal' ? info.velocity.x : info.velocity.y;
    
    // If the user just clicks or drags very slowly, info.velocity might be low.
    // We might want to ensure we don't stop if velocity is 0, unless that's intended.
    // But the lerp will pick it up back to targetVelocity anyway.
    // So if throw is 0, it will accelerate back to speed.
    velocityRef.current = throwVelocity;
  };

  const onHoverStart = () => {
    setIsHovered(true);
  };

  const onHoverEnd = () => {
    setIsHovered(false);
  };

  return (
    <div className={cn('overflow-hidden cursor-grab active:cursor-grabbing', className)}>
      <motion.div
        className='flex w-max'
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
        drag={direction === 'horizontal' ? 'x' : 'y'}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        dragMomentum={false}
        onPointerDownCapture={() => { hasDragged.current = false; }}
        onClickCapture={(e) => {
          if (hasDragged.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
