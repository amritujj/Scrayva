import { useEffect } from 'react';

/**
 * Observes all [data-reveal] elements in the document
 * and adds the `.visible` class when they enter the viewport.
 *
 * Use: call `useScrollReveal()` once at the top of any page.
 * Mark elements with `data-reveal`, `data-reveal="left"`, etc.
 * Add `data-delay="300"` for stagger timing.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once revealed, stop watching (animation is one-shot)
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,    // trigger when 12% of element is visible
        rootMargin: '0px 0px -40px 0px', // slight offset from bottom edge
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
