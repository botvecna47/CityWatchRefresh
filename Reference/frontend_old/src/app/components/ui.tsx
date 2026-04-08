import { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', size?: 'default' | 'sm' | 'lg' }>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-sm",
          size === 'default' && "px-4 py-2",
          size === 'sm' && "px-3 py-1.5 text-xs",
          size === 'lg' && "px-8 py-3 text-lg",
          variant === 'primary' && "bg-[#2E7D32] text-white hover:bg-[#1B5E20] focus:ring-[#2E7D32]",
          variant === 'secondary' && "bg-gray-100 text-[#1A4331] hover:bg-gray-200 focus:ring-gray-200",
          variant === 'danger' && "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
          variant === 'ghost' && "bg-transparent text-[#1A4331] hover:bg-gray-100 focus:ring-gray-200",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-[#1A4331] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-50 rounded-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full border border-gray-300 bg-white px-3 py-2 text-sm text-[#1A4331] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-50 rounded-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden", className)} {...props} />
  );
}

export function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variant === 'default' && "bg-gray-100 text-gray-800",
      variant === 'success' && "bg-green-100 text-green-800",
      variant === 'warning' && "bg-yellow-100 text-yellow-800",
      variant === 'danger' && "bg-red-100 text-red-800",
      className
    )}>
      {children}
    </span>
  );
}
