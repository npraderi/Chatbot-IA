import { Spinner } from "./Spinner";

interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: "sm" | "md" | "lg";
  spinnerVariant?: "primary" | "secondary" | "white";
}

export const LoadingWrapper = ({
  isLoading,
  children,
  className = "",
  spinnerSize = "md",
  spinnerVariant = "primary",
}: LoadingWrapperProps) => {
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[200px] ${className}`}
      >
        <Spinner size={spinnerSize} variant={spinnerVariant} />
      </div>
    );
  }

  return <>{children}</>;
};
