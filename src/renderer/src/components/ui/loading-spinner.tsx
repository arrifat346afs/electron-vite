import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  color?: "default" | "primary" | "secondary"
}

export function LoadingSpinner({
  size = "md",
  color = "primary",
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  }

  const colorClasses = {
    default: "border-background/10 border-t-background",
    primary: "border-primary/10 border-t-primary",
    secondary: "border-secondary/10 border-t-secondary",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    />
  )
}
