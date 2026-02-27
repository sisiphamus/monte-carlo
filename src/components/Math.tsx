"use client";

import katex from "katex";
import { useRef, useEffect } from "react";

interface MathProps {
  tex: string;
  display?: boolean;
  className?: string;
}

export function Math({ tex, display = false, className = "" }: MathProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(tex, ref.current, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    }
  }, [tex, display]);

  if (display) {
    return (
      <div className={`katex-display ${className}`}>
        <span ref={ref} />
      </div>
    );
  }

  return <span ref={ref} className={className} />;
}
