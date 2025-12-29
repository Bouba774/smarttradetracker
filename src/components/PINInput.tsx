import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Delete, Check } from 'lucide-react';

interface PINInputProps {
  length: 4 | 6;
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  error?: boolean;
  showConfirm?: boolean;
  disabled?: boolean;
}

export const PINInput: React.FC<PINInputProps> = ({
  length,
  onComplete,
  onCancel,
  error = false,
  showConfirm = false,
  disabled = false,
}) => {
  const { language } = useLanguage();
  const [pin, setPin] = useState<string>('');
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset PIN on error
  useEffect(() => {
    if (error) {
      setShake(true);
      setPin('');
      setIsSubmitting(false);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Reset PIN when component key changes (detected by length or showConfirm change)
  useEffect(() => {
    setPin('');
    setIsSubmitting(false);
  }, [length, showConfirm]);

  const handleNumberClick = useCallback((num: number) => {
    if (disabled || isSubmitting || pin.length >= length) return;
    
    const newPin = pin + num.toString();
    setPin(newPin);
    
    // Auto-submit when complete (only if NOT in confirm mode)
    if (newPin.length === length && !showConfirm) {
      setIsSubmitting(true);
      // Use setTimeout to allow state update before callback
      setTimeout(() => {
        onComplete(newPin);
        // Reset after submission
        setPin('');
        setIsSubmitting(false);
      }, 100);
    }
  }, [disabled, isSubmitting, pin, length, showConfirm, onComplete]);

  const handleDelete = useCallback(() => {
    if (disabled || isSubmitting) return;
    setPin(prev => prev.slice(0, -1));
  }, [disabled, isSubmitting]);

  const handleConfirm = useCallback(() => {
    if (pin.length !== length || isSubmitting) return;
    
    setIsSubmitting(true);
    const currentPin = pin;
    
    // Clear state immediately before calling onComplete
    setPin('');
    
    // Call onComplete after state is cleared
    setTimeout(() => {
      onComplete(currentPin);
      setIsSubmitting(false);
    }, 50);
  }, [pin, length, isSubmitting, onComplete]);

  const dots = Array.from({ length }, (_, i) => (
    <div
      key={i}
      className={cn(
        "w-4 h-4 rounded-full border-2 transition-all duration-200",
        i < pin.length
          ? "bg-primary border-primary scale-110"
          : "bg-transparent border-muted-foreground/50",
        error && "border-destructive bg-destructive/20"
      )}
    />
  ));

  const numberButtons = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [null, 0, 'delete'],
  ];

  return (
    <div className={cn("flex flex-col items-center gap-8", shake && "animate-shake")}>
      {/* PIN Dots */}
      <div className="flex gap-3">
        {dots}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4">
        {numberButtons.flat().map((item, index) => {
          if (item === null) {
            return <div key={index} className="w-16 h-16" />;
          }
          
          if (item === 'delete') {
            return (
              <button
                key={index}
                onClick={handleDelete}
                disabled={disabled || isSubmitting || pin.length === 0}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  "text-muted-foreground transition-all",
                  "hover:bg-secondary/50 active:scale-95",
                  "disabled:opacity-30 disabled:pointer-events-none"
                )}
                type="button"
              >
                <Delete className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={index}
              onClick={() => handleNumberClick(item as number)}
              disabled={disabled || isSubmitting || pin.length >= length}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                "text-2xl font-medium text-foreground",
                "bg-secondary/30 border border-border/50",
                "transition-all duration-150",
                "hover:bg-secondary/60 hover:border-primary/50",
                "active:scale-95 active:bg-primary/20",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
              type="button"
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Confirm Button (for setup mode - only show when PIN is complete) */}
      {showConfirm && pin.length === length && !isSubmitting && (
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-lg",
            "bg-primary text-primary-foreground font-medium",
            "transition-all hover:opacity-90 active:scale-95"
          )}
          type="button"
        >
          <Check className="w-5 h-5" />
          {language === 'fr' ? 'Confirmer' : 'Confirm'}
        </button>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          type="button"
        >
          {language === 'fr' ? 'Annuler' : 'Cancel'}
        </button>
      )}
    </div>
  );
};

export default PINInput;
