/**
 * Unified Loading Spinner Component
 * Supports both predefined colors and custom Tailwind classes
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  color?: 'primary' | 'white' | 'gray' | string;  // Predefined or custom Tailwind class
  centered?: boolean;  // Whether to add padding/centering
}

export function LoadingSpinner({ 
  size = 'md', 
  message,
  color = 'primary',
  centered = true
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Map predefined colors to Tailwind classes, or use custom class
  const colorMap: Record<string, string> = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };
  const colorClass = colorMap[color] || color;

  const spinnerContent = (
    <>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg className={`w-full h-full ${colorClass}`} fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {message && (
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      )}
    </>
  );

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {spinnerContent}
    </div>
  );
}

// Default export for backward compatibility
export default LoadingSpinner;
