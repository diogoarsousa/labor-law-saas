import { cn } from "@/lib/utils";

interface DashboardShellProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Action buttons (top-right area) */
  actions?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Additional class names for the wrapper */
  className?: string;
}

/**
 * Consistent page wrapper for all dashboard views.
 * Renders a header row with title, description, and optional action buttons,
 * followed by the main content area.
 */
export function DashboardShell({
  title,
  description,
  actions,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("flex flex-col gap-6 p-6", className)}>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
