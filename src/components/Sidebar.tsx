import React from 'react';
import {
  LayoutDashboard,
  Smartphone,
  Home,
  Users,
  FileSpreadsheet,
  BarChart3,
  Settings,
  User,
  Building2,
  X,
  ChevronRight,
  History,
  Sparkles
} from 'lucide-react';
import { MosqueProfile, User as UserType } from '../types';

interface SidebarProps {
  mosque: MosqueProfile;
  currentUser: UserType;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  dueCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mosque,
  currentUser,
  activeTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
  dueCount = 0
}) => {
  const isCollector = currentUser.role === 'COLLECTOR';

  // Role-based Navigation Items
  const navItems = isCollector
    ? [
        { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
        { id: 'collector', label: 'চাঁদা আদায় (Collect)', icon: Smartphone, highlight: true },
        { id: 'history', label: 'আদায়ের ইতিহাস', icon: History },
        { id: 'profile', label: 'আমার প্রোফাইল', icon: User }
      ]
    : [
        { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
        {
          id: 'collections',
          label: 'আদায় ও রেজিস্টার',
          icon: FileSpreadsheet,
          badge: dueCount > 0 ? dueCount : undefined
        },
        { id: 'houses', label: 'বাড়ি ও দাতা তালিকা', icon: Home },
        { id: 'collectors', label: 'সংগ্রাহকবৃন্দ (Collectors)', icon: Users },
        { id: 'reports', label: 'রিপোর্ট ও অ্যানালিটিক্স', icon: BarChart3 },
        { id: 'settings', label: 'মসজিদ সেটিংস', icon: Settings }
      ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 border border-emerald-500/40 flex items-center justify-center text-amber-300 font-bold shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">MCMS Digital</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{mosque.name}</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {isCollector ? 'সংগ্রাহক প্যানেল (COLLECTOR MENU)' : 'প্রধান প্যানেল (MAIN MENU)'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-700/90 text-white shadow-md shadow-emerald-950/40 font-bold border border-emerald-500/30'
                    : item.highlight
                    ? 'bg-emerald-950/80 text-amber-300 hover:bg-emerald-900/90 border border-emerald-800/80'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-amber-300'
                        : item.highlight
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                    {item.badge}
                  </span>
                )}

                {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-300 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Status Teaser Badge */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-800/40 text-[11px] text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-white block text-[11px]">bKash & SMS Ready</span>
            <span className="text-[10px] text-slate-400">অনলাইন পেমেন্ট ও এসএমএস সহায়ক</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-600">
              {currentUser.name[0]}
            </div>
            <div className="truncate">
              <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-400 font-semibold">{currentUser.role}</div>
            </div>
          </div>

          <button
            onClick={() => onTabChange('profile')}
            title="ইউজার প্রোফাইল"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
