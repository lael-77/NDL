import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";

interface PermissionGateProps {
  action: string;
  resourceId?: string;
  fallback?: ReactNode;
  children: ReactNode;
  showIfDenied?: boolean;
}

/**
 * PermissionGate component - Conditionally renders children based on permissions
 * 
 * @example
 * <PermissionGate action="manage:team" resourceId={teamId}>
 *   <Button>Edit Team</Button>
 * </PermissionGate>
 */
export const PermissionGate = ({
  action,
  resourceId,
  fallback = null,
  children,
  showIfDenied = false,
}: PermissionGateProps) => {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return <>{fallback}</>;
  }

  const hasPermission = resourceId
    ? can(action) // For now, we'll check general permission. Resource-specific check can be added
    : can(action);

  if (showIfDenied) {
    return <>{hasPermission ? children : fallback}</>;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

/**
 * PermissionButton - Button that's disabled/enabled based on permissions
 */
interface PermissionButtonProps {
  action: string;
  resourceId?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
  disabled?: boolean;
}

export const PermissionButton = ({
  action,
  resourceId,
  children,
  className,
  variant = "default",
  size = "default",
  onClick,
  disabled = false,
  ...props
}: PermissionButtonProps) => {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <Button variant={variant} size={size} className={className} disabled {...props}>
        {children}
      </Button>
    );
  }

  const hasPermission = can(action);
  const isDisabled = disabled || !hasPermission;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={isDisabled}
      onClick={hasPermission ? onClick : undefined}
      title={!hasPermission ? "You don't have permission to perform this action" : undefined}
      {...props}
    >
      {children}
    </Button>
  );
};

