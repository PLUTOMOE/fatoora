"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Inbox, ScrollText, Receipt, Sparkles, 
  Users, Package, Bookmark, Building2, BarChart3, 
  Settings, ChevronsUpDown, Plus, ChevronRight, PenLine, ShieldAlert
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, activeEntity, setShowEntitySwitcher, isMobileMenuOpen, setIsMobileMenuOpen } = useStore();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.email === '38mhamdy@gmail.com') {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  const sections = [
    {
      label: null,
      items: [
        { icon: Home, label: t('sidebar.dashboard'), href: '/', shortcut: 'G H' }
      ]
    },
    {
      label: t('sidebar.operations'),
      items: [
        { icon: ScrollText, label: t('sidebar.quotations'), href: '/quotations', shortcut: 'G Q' },
        { icon: Receipt, label: t('sidebar.invoices'), href: '/invoices', shortcut: 'G I' }
      ]
    },
    {
      label: t('sidebar.library'),
      items: [
        { icon: Users, label: t('sidebar.customers'), href: '/customers' },
        { icon: Package, label: t('sidebar.products'), href: '/products' }
      ]
    },
    {
      label: t('sidebar.management'),
      items: [
        { icon: Building2, label: t('sidebar.entities'), href: '/entities' },
        { icon: BarChart3, label: t('sidebar.reports'), href: '/reports' },
        { icon: Settings, label: t('sidebar.settings'), href: '/settings' },
        ...(isAdmin ? [{ icon: ShieldAlert, label: 'لوحة التحكم العليا', href: '/admin', highlight: true }] : [])
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={`fixed top-0 right-0 h-screen bg-card border-l border-border flex flex-col transition-all duration-300 z-50 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      } ${sidebarCollapsed ? 'w-[60px]' : 'w-[240px]'}`}>
      <div className="px-3 pt-3 pb-2">
        <button 
          onClick={() => setShowEntitySwitcher(true)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-muted group transition-colors"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-md flex items-center justify-center text-primary-foreground text-[11px] font-bold flex-shrink-0">
            {activeEntity.short}
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 min-w-0 text-right">
                <div className="text-[13px] font-medium text-foreground truncate leading-tight">{activeEntity.name}</div>
                <div className="text-[11px] text-muted-foreground/80 leading-tight">{activeEntity.short}</div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/80 group-hover:text-muted-foreground flex-shrink-0" />
            </>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 pt-2">
        {sections.map((section, idx) => (
          <div key={idx}>
            {section.label && !sidebarCollapsed && (
              <div className="px-2.5 mb-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem 
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-muted-foreground/80 hover:text-muted-foreground text-[12px]"
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          {!sidebarCollapsed && <span>{t('sidebar.collapse')}</span>}
        </button>
      </div>
    </aside>
    </>
  );
}

function NavItem({ icon: Icon, label, active, count, accent, shortcut, href, collapsed, highlight }: any) {
  return (
    <Link 
      href={href}
      className={`group w-full flex items-center gap-2.5 px-2.5 h-[30px] rounded-md transition-colors text-right text-[13px] ${
        active 
          ? 'bg-[#F0F0F0] text-foreground font-medium' 
          : highlight 
            ? 'text-red-500 hover:bg-red-50 hover:text-red-600 font-bold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
      title={collapsed ? label : undefined}
    >
      <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${active ? 'text-foreground' : accent ? 'text-[#A88732]' : ''}`} strokeWidth={1.75} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {count !== undefined && (
            <span className={`text-[11px] tabular-nums ${active ? 'text-muted-foreground' : 'text-muted-foreground/80'}`}>
              {count}
            </span>
          )}
          {shortcut && !count && (
            <span className="text-[10px] text-muted-foreground/80 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              {shortcut}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
