import React from "react";

export function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon?: any;
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
