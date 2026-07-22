import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Calendar,
  Bell,
  ChevronDown,
  Building2,
  Check,
  UserCheck,
  X,
  Sparkles,
  Wallet,
  FileSpreadsheet
} from 'lucide-react';
import { MosqueProfile, User, AuditLog } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { formatMonthName, formatDateTime } from '../utils/formatters';

interface HeaderProps {
  mosque: MosqueProfile;
  currentUser: User;
  onUserChange: (u: User) => void;
  currentMonth: string;
  onMonthChange: (m: string) => void;
  onOpenMobileSidebar: () => void;
  onQuickAction: (action: 'COLLECT' | 'ADD_HOUSE' | 'GENERATE_SHEET') => void;
  onSearchQuery: (query: string) => void;
  auditLogs: AuditLog[];
}

export const Header: React.FC<HeaderProps> = ({
  mosque,
  currentUser,
  onUserChange,
  currentMonth,
  onMonthChange,
  onOpenMobileSidebar,
  onQuickAction,
  onSearchQuery,
  auditLogs
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const months = ['2026-07', '2026-06', '2026-05', '2026-08'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearchQuery(e.target.value);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
            title="মেনু খুলুন"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>{mosque.name}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {mosque.code}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">মসজিদ কালেকশন ম্যানেজমেন্ট সিস্টেম (MCMS)</p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="খুঁজুন (বাড়ি নম্বর ১০১/এ, দাতা, ফোন, রসিদ নং)..."
            className="w-full pl-9 pr-8 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue('');
                onSearchQuery('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Actions, Month Picker, Notifications & User Role Dropdown */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Action Menu */}
          <div className="relative">
            <button
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">দ্রুত কাজ</span>
            </button>

            {isQuickActionOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 text-xs text-slate-800 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => {
                    onQuickAction('COLLECT');
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center space-x-2 font-medium text-emerald-900"
                >
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  <span>দ্রুত চাঁদা গ্রহণ করুন</span>
                </button>
                <button
                  onClick={() => {
                    onQuickAction('ADD_HOUSE');
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center space-x-2 font-medium text-slate-800"
                >
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span>নতুন বাড়ি যুক্ত করুন</span>
                </button>
                <button
                  onClick={() => {
                    onQuickAction('GENERATE_SHEET');
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center space-x-2 font-medium text-slate-800"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                  <span>নতুন মাসের রেজিস্টার তৈরি</span>
                </button>
              </div>
            )}
          </div>

          {/* Month Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <select
              value={currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl relative transition-colors"
              title="সাম্প্রতিক নোটিফিকেশন"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-600 rounded-full animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-600 rounded-full" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <h4 className="font-bold text-slate-900">সাম্প্রতিক অ্যাক্টিভিটি নোটিফিকেশন</h4>
                  <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center font-bold text-[11px] text-slate-800">
                        <span>{log.userName}</span>
                        <span className="text-[10px] text-slate-400">{formatDateTime(log.timestamp)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-xl border border-slate-200 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xs">
                {currentUser.name[0]}
              </div>
              <div className="text-left hidden lg:block pr-1">
                <div className="font-bold text-slate-900 text-xs leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-800 font-semibold">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 text-xs text-slate-800 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  ডেমো ড্যাশবোর্ড অ্যাকাউন্ট সিলেক্ট
                </div>
                {INITIAL_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onUserChange(user);
                      setIsUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                      currentUser.id === user.id ? 'bg-emerald-50 font-bold text-emerald-950' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {user.role} — {user.assignedArea}
                      </div>
                    </div>
                    {currentUser.id === user.id && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
