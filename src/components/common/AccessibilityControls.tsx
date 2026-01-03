import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Sun, Moon, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Accessibility Controls Panel
 * Provides:
 * - High contrast mode toggle
 * - Font size increase/decrease
 * - Dark mode toggle
 * - Persistent preferences via localStorage
 */
interface AccessibilityControlsProps {
  className?: string;
}

const FONT_SCALES = [1, 1.125, 1.25, 1.5];
const FONT_SCALE_KEY = 'a11y-font-scale';
const THEME_KEY = 'a11y-theme';
const HIGH_CONTRAST_KEY = 'a11y-high-contrast';

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({ className }) => {
  const [fontScaleIndex, setFontScaleIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontScale = localStorage.getItem(FONT_SCALE_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    const savedHighContrast = localStorage.getItem(HIGH_CONTRAST_KEY);

    if (savedFontScale) {
      const index = FONT_SCALES.indexOf(parseFloat(savedFontScale));
      if (index !== -1) {
        setFontScaleIndex(index);
        document.documentElement.style.setProperty('--font-scale', savedFontScale);
      }
    }

    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    if (savedHighContrast === 'true') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  // Font size controls
  const increaseFontSize = () => {
    if (fontScaleIndex < FONT_SCALES.length - 1) {
      const newIndex = fontScaleIndex + 1;
      setFontScaleIndex(newIndex);
      const newScale = FONT_SCALES[newIndex].toString();
      document.documentElement.style.setProperty('--font-scale', newScale);
      localStorage.setItem(FONT_SCALE_KEY, newScale);
    }
  };

  const decreaseFontSize = () => {
    if (fontScaleIndex > 0) {
      const newIndex = fontScaleIndex - 1;
      setFontScaleIndex(newIndex);
      const newScale = FONT_SCALES[newIndex].toString();
      document.documentElement.style.setProperty('--font-scale', newScale);
      localStorage.setItem(FONT_SCALE_KEY, newScale);
    }
  };

  // Theme toggle
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  };

  // High contrast toggle
  const toggleHighContrast = () => {
    const newHighContrast = !isHighContrast;
    setIsHighContrast(newHighContrast);
    
    if (newHighContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem(HIGH_CONTRAST_KEY, 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem(HIGH_CONTRAST_KEY, 'false');
    }
  };

  const currentScale = FONT_SCALES[fontScaleIndex];
  const scaleLabel = currentScale === 1 ? '100%' : `${currentScale * 100}%`;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      role="group"
      aria-label="Accessibility controls"
    >
      {/* Font size decrease */}
      <Button
        variant="outline"
        size="icon"
        onClick={decreaseFontSize}
        disabled={fontScaleIndex === 0}
        aria-label={`Decrease font size. Current size: ${scaleLabel}`}
      >
        <ZoomOut className="w-5 h-5" aria-hidden="true" />
      </Button>

      {/* Font size indicator */}
      <span className="min-w-[60px] text-center text-sm font-bold text-muted-foreground">
        {scaleLabel}
      </span>

      {/* Font size increase */}
      <Button
        variant="outline"
        size="icon"
        onClick={increaseFontSize}
        disabled={fontScaleIndex === FONT_SCALES.length - 1}
        aria-label={`Increase font size. Current size: ${scaleLabel}`}
      >
        <ZoomIn className="w-5 h-5" aria-hidden="true" />
      </Button>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" aria-hidden="true" />

      {/* Dark mode toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDarkMode}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Moon className="w-5 h-5" aria-hidden="true" />
        )}
      </Button>

      {/* High contrast toggle */}
      <Button
        variant={isHighContrast ? 'secondary' : 'outline'}
        size="icon"
        onClick={toggleHighContrast}
        aria-label={isHighContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
        aria-pressed={isHighContrast}
      >
        <Eye className="w-5 h-5" aria-hidden="true" />
      </Button>

      {/* Screen reader announcement for state changes */}
      <div role="status" aria-live="polite" className="sr-only">
        {isDarkMode ? 'Dark mode enabled' : 'Light mode enabled'}
        {isHighContrast && ', High contrast mode enabled'}
        {`, Font size ${scaleLabel}`}
      </div>
    </div>
  );
};

export { AccessibilityControls };
