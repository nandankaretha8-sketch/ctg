import * as React from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { Toast, ToastTitle, ToastDescription, ToastClose } from "./toast";

interface EnhancedToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
}

const EnhancedToast = React.forwardRef<
  React.ElementRef<typeof Toast>,
  React.ComponentPropsWithoutRef<typeof Toast> & EnhancedToastProps
>(({ title, description, variant = "default", duration = 5000, ...props }, ref) => {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-primary" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-500/30 bg-green-500/10 text-green-100 shadow-green-500/20";
      case "destructive":
        return "border-red-500/30 bg-red-500/10 text-red-100 shadow-red-500/20";
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-100 shadow-yellow-500/20";
      case "info":
        return "border-blue-500/30 bg-blue-500/10 text-blue-100 shadow-blue-500/20";
      default:
        return "border-glass-border/30 bg-glass/20 text-white shadow-glass";
    }
  };

  return (
    <Toast
      ref={ref}
      variant={variant === "destructive" ? "destructive" : "default"}
      className={`${getVariantStyles()} backdrop-blur-md`}
      duration={duration}
      {...props}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <ToastTitle className="text-sm font-bold">
            {title}
          </ToastTitle>
          {description && (
            <ToastDescription className="text-sm opacity-90 mt-1">
              {description}
            </ToastDescription>
          )}
        </div>
      </div>
      <ToastClose />
    </Toast>
  );
});

EnhancedToast.displayName = "EnhancedToast";

export { EnhancedToast };
