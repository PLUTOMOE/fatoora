"use client";

import React, { useEffect, useState } from 'react';
import { 
  Search, Bell, HelpCircle, ChevronDown, ChevronLeft, 
  Settings, LogOut, Moon, Sun, Menu, User
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; initials: string } | null>(null);
  
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

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم';
        const initials = name.substring(0, 2).toUpperCase();
        setUserInfo({ name, email: user.email || '', initials });
      }
    };
    loadUser();
  }, []);

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

          {/* Notifications - disabled until real notification system is ready */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground/80 hover:text-foreground relative"
            >
              <Bell className="w-4 h-4" />
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
                {userInfo?.initials || '..'}
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground/80" />
            </button>
            {showUserMenu && <UserMenu userInfo={userInfo} onLogout={handleLogout} router={router} />}
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
  return (
    <div className="absolute top-full left-0 mt-1.5 w-[320px] bg-card border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] animate-slideUp overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[13px] font-semibold text-foreground">الإشعارات</div>
      </div>
      <div className="px-4 py-8 text-center">
        <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-[13px] text-muted-foreground">لا توجد إشعارات جديدة</p>
      </div>
    </div>
  );
}

function UserMenu({ userInfo, onLogout, router }: any) {
  const { t } = useTranslation();
  return (
    <div className="absolute top-full left-0 mt-1.5 w-[240px] bg-card border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] animate-slideUp overflow-hidden py-1.5">
      {/* User Info */}
      <div className="px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#5B5BD6] to-[#3E3FBF] rounded-full flex items-center justify-center text-primary-foreground text-[12px] font-semibold">
            {userInfo?.initials || '..'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-foreground truncate">{userInfo?.name || '...'}</div>
            <div className="text-[11px] text-muted-foreground/80 truncate">{userInfo?.email || ''}</div>
          </div>
        </div>
      </div>
      {/* Functional Actions Only */}
      <div className="py-1">
        <button 
          onClick={() => router.push('/settings')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{t('topbar.settings')}</span>
        </button>
      </div>
      <div className="border-t border-border py-1">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-[#E5484D] hover:bg-[#FEF1F1] dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('topbar.logout')}</span>
        </button>
      </div>
    </div>
  );
}
