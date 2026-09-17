import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ children, className, header, footer }: CardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      {header && <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">{header}</div>}
      <div>{children}</div>
      {footer && <div className="px-5 py-3.5 border-t border-border">{footer}</div>}
    </div>
  );
}
