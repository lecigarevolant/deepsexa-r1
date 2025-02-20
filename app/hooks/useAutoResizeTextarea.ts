import { useRef, useCallback } from 'react';

export function useAutoResizeTextarea() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, []);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>, onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void) => {
    if (onChange) {
      onChange(e);
    }
    autoResize();
  }, [autoResize]);

  return {
    textareaRef,
    handleTextareaChange
  };
} 