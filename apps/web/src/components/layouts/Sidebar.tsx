'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../../store/app-store';
import { cn } from '../../lib/utils';
import { LayoutDashboardIcon, ListTodoIcon, TimerIcon, BarChartIcon, ZapIcon } from '../ui/Icons';

const NAV = [
  { href: '/dashboard',            label: 'Dashboard',  icon: LayoutDashboardIcon },
  { href: '/dashboard/tasks',      label: 'Tasks',      icon: ListTodoIcon },
  { href: '/dashboard/sessions',   label: 'Sessions',   icon: TimerIcon },
  { href: '/dashboard/analytics',  label: 'Analytics',  icon: BarChartIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-30 flex flex-col',
        'w-[220px] bg-surface border-r border-border',
        'transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
            <ZapIcon className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-base text-text">FocusFlow</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-medium text-muted uppercase tracking-widest px-3 py-2">Menu</p>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  active
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-muted hover:text-text hover:bg-card border border-transparent',
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
