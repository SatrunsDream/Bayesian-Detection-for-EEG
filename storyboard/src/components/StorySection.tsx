import React from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { cn } from '../lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const StorySection: React.FC<SectionProps> = ({ children, className, id }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn("min-h-screen py-24 px-6 md:px-12 lg:px-24 flex flex-col justify-center", className)}
    >
      <div className="max-w-4xl mx-auto w-full">
        {children}
      </div>
    </motion.section>
  );
};
