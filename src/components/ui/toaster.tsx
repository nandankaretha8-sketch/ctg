import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant?: string) => {
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

  const getVariantStyles = (variant?: string) => {
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
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            variant={variant === "destructive" ? "destructive" : "default"}
            className={`${getVariantStyles(variant)} backdrop-blur-md`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(variant)}
              </div>
              <div className="flex-1 min-w-0">
                {title && <ToastTitle className="text-sm font-bold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-sm opacity-90 mt-1">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
