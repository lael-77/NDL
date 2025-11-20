import { useEffect, useRef, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onKeyPress?: (key: string) => void;
  enabled?: boolean;
  target?: HTMLElement | null;
}

/**
 * Custom hook for keyboard navigation with cursor logic
 * Supports arrow keys, Enter, Escape, and custom key bindings
 */
export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onKeyPress,
    enabled = true,
    target,
  } = options;

  const handlerRef = useRef<(e: KeyboardEvent) => void>();

  useEffect(() => {
    if (!enabled) return;

    handlerRef.current = (e: KeyboardEvent) => {
      // Prevent default for navigation keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          onArrowUp?.();
          break;
        case 'ArrowDown':
          onArrowDown?.();
          break;
        case 'ArrowLeft':
          onArrowLeft?.();
          break;
        case 'ArrowRight':
          onArrowRight?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
        default:
          // Handle custom key bindings (case-insensitive)
          if (onKeyPress) {
            const key = e.key.toLowerCase();
            // Only trigger for single character keys (not modifiers)
            if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
              onKeyPress(key);
            }
          }
          break;
      }
    };

    const element = target || window;
    element.addEventListener('keydown', handlerRef.current);

    return () => {
      if (handlerRef.current) {
        element.removeEventListener('keydown', handlerRef.current);
      }
    };
  }, [enabled, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onKeyPress, target]);

  return {
    focus: useCallback((element: HTMLElement | null) => {
      if (element) {
        element.focus();
      }
    }, []),
  };
};

/**
 * Hook for managing focus trap in modals
 */
export const useFocusTrap = (isOpen: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when modal opens
    firstElement?.focus();

    container.addEventListener('keydown', handleTab);

    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, containerRef]);
};

/**
 * Hook for keyboard shortcuts (Ctrl/Cmd + key combinations)
 */
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const modifier = e.ctrlKey || e.metaKey;
      
      if (!modifier) return;

      const shortcut = `ctrl+${key}`;
      if (shortcuts[shortcut]) {
        e.preventDefault();
        shortcuts[shortcut]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

