import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathProps {
  latex: string;
  display?: boolean;
  className?: string;
}

export function Math({ latex, display = false, className = '' }: MathProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        displayMode: display,
        throwOnError: false,
      });
    } catch (_) {
      ref.current.textContent = latex;
    }
  }, [latex, display]);

  return <span ref={ref} className={className} />;
}
