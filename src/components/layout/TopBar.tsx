"use scroll";
"use client";

import React, { useEffect, useState } from 'react';
import { 
  Search, Bell, HelpCircle, ChevronDown, ChevronLeft, 
  User, Settings, Wallet, Keyboard, MessageSquare, ExternalLink, LogOut, Moon, Sun, Menu
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const { 
    showNotifications, setShowNotifications, 
    showUserMenu, setShowUserMenu, 
    setShowCommandPalette, activeEntity,
    isMobileMenuOpen, setIsMobileMenuOpen
  } = useStore();
  const supabase = createClient();
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-30">
      <div className="flex items-center justify-between h-12 px-8">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-muted-foreground/80">{activeEntity.name.split(' ')[0]}</span>
          <ChevronLeft className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-foreground font-medium">{t('topbar.dashboard')}</span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center gap-2 h-8 px-2.5 bg-card border border-border rounded-md hover:border-border/80 text-[12px] text-muted-foreground/80"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t('topbar.searchcmd')}</span>
            <kbd className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded mr-2">⌘K</kbd>
          </button>

          <div className="w-px h-5 bg-border mx-1.5"></div>


          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground/80 hover:text-foreground relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-[#E5484D] rounded-full"></span>
            </button>
            {showNotifications && <NotificationsDropdown />}
          </div>

          <div className="relative mr-1">
            <button 
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 h-8 pl-2 pr-1 rounded-md hover:bg-muted"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-[#5B5BD6] to-[#3E3FBF] rounded-full flex items-center justify-center text-primary-foreground text-[10px] font-semibold">
                مز
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground/80" />
            </button>
            {showUserMenu && <UserMenu onLogout={handleLogout} />}
          </div>

          <div className="w-px h-5 bg-border mx-1.5 lg:hidden"></div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-8 h-8 lg:hidden flex items-center justify-center rounded-md hover:bg-muted text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function NotificationsDropdown() {
  const { t } = useTranslation();
  return (
    <div className="absolute top-full left-0 mt-1.5 w-[360px] bg-card border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] animate-slideUp overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="text-[13px] font-semibold text-foreground">{t('topbar.notifications')}</div>
        <button className="text-[11px] text-[#5B5BD6] hover:underline">{t('topbar.mark_all_read')}</button>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        <NotifItem dot="#22C55E" title="تم قبول عرض السعر" desc="مؤسسة النخبة قبلت عرض Q-2026-045" time="منذ 5 دقائق" />
        <NotifItem dot="#F59E0B" title="فاتورة قاربت على الاستحقاق" desc="INV-2026-127 تستحق خلال 3 أيام" time="منذ ساعة" />
        <NotifItem dot="#A88732" title="تم استخراج 12 صنف" desc="من عرض السعر الخارجي بنجاح" time="منذ 3 ساعات" />
        <NotifItem dot="#9B9B9B" title="تم تجديد اشتراكك" desc="باقة احترافية - سنة كاملة" time="أمس" read />
      </div>
      <div className="px-4 py-2 border-t border-border text-center">
        <button className="text-[12px] text-muted-foreground hover:text-foreground">{t('topbar.view_all_notif')}</button>
      </div>
    </div>
  );
}

function NotifItem({ dot, title, desc, time, read }: any) {
  return (
    <button className={`w-full text-right px-4 py-3 border-b border-border/50 last:border-0 hover:bg-background transition-colors ${read ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: dot }}></div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-foreground mb-0.5">{title}</div>
          <div className="text-[12px] text-muted-foreground truncate mb-1">{desc}</div>
          <div className="text-[11px] text-muted-foreground/80">{time}</div>
        </div>
      </div>
    </button>
  );
}

function UserMenu({ onLogout }: any) {
  const { t } = useTranslation();
  return (
    <div className="absolute top-full left-0 mt-1.5 w-[260px] bg-card border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] animate-slideUp overflow-hidden py-1.5">
      <div className="px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#5B5BD6] to-[#3E3FBF] rounded-full flex items-center justify-center text-primary-foreground text-[12px] font-semibold">مز</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-foreground">معاذ الزاهد</div>
            <div className="text-[11px] text-muted-foreground/80 truncate">moe@asimat.sa</div>
          </div>
        </div>
      </div>
      <div className="py-1">
        <MenuItem icon={User} label={t('topbar.profile')} />
        <MenuItem icon={Settings} label={t('topbar.settings')} shortcut="⌘ ," />
        <MenuItem icon={Wallet} label={t('topbar.billing')} />
        <MenuItem icon={Keyboard} label={t('topbar.shortcuts')} shortcut="⌘ /" />
      </div>
      <div className="border-t border-border py-1">
        <MenuItem icon={MessageSquare} label={t('topbar.support')} />
        <MenuItem icon={ExternalLink} label={t('topbar.whats_new')} />
      </div>
      <div className="border-t border-border py-1">
        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-[#E5484D] hover:bg-[#FEF1F1] transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('topbar.logout')}</span>
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, shortcut }: any) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors">
      <span className="flex items-center gap-2.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span>{label}</span>
      </span>
      {shortcut && <kbd className="text-[10px] text-muted-foreground/80 font-mono">{shortcut}</kbd>}
    </button>
  );
}
