import React, { useState } from 'react';
import {
  Building2,
  LayoutDashboard,
  Smartphone,
  Home,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Calendar
} from 'lucide-react';
import { MosqueProfile, User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { formatMonthName } from '../utils/formatters';

interface NavbarProps {
  mosque: MosqueProfile;
  currentUser: User;
  onUserChange: (user: User) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mosque,
  currentUser,
  onUserChange,
  activeTab,
  onTabChange,
  currentMonth,
  onMonthChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const months = ['2026-07', '2026-06', '2026-05', '2026-08'];

  const navItems = [
    { id: 'collector', label: 'চাঁদা আদায় মোড', icon: Smartphone, highlight: true },
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'houses', label: 'বাড়ি ও দাতা তালিকা', icon: Home },
    { id: 'sheet', label: 'মাসিক রেজিস্টার', icon: FileSpreadsheet },
    { id: 'due', label: 'বকেয়া তালিকা', icon: AlertTriangle },
    { id: 'reports', label: 'রিপোর্ট ও লেনদেন', icon: FileText }
  ];

  return (
    <header className="bg-emerald-950 text-white sticky top-0 z-40 shadow-lg border-b border-emerald-800">
      {/* Top Mosque & User Switcher Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Brand / Mosque Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-600 flex items-center justify-center text-amber-300 font-bold shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {mosque.name}
                </h1>
                <span className="hidden sm:inline-block bg-emerald-900 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-700">
                  MCMS Digital
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                মসজিদ চাঁদা ও কালেকশন ব্যবস্থাপনা সফটওয়্যার
              </p>
            </div>
          </div>

          {/* Controls: Month + User Role Switcher */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Month Picker */}
            <div className="flex items-center space-x-1.5 bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-700 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-emerald-200 font-medium">মাস:</span>
              <select
                value={currentMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                {months.map(m => (
                  <option key={m} value={m} className="bg-emerald-950 text-white">{formatMonthName(m)}</option>
                ))}
              </select>
            </div>

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 bg-emerald-900 hover:bg-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-700 text-xs transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-[10px]">
                  {currentUser.name[0]}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-300 font-semibold">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-300 ml-1" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 text-xs text-gray-800 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    রোল পরিবর্তন করুন (Demo Account)
                  </div>
                  {INITIAL_USERS.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onUserChange(user);
                        setIsUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                        currentUser.id === user.id ? 'bg-emerald-50/80 font-bold text-emerald-900' : ''
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-[10px] text-gray-500">{user.role} - {user.assignedArea}</div>
                      </div>
                      {currentUser.id === user.id && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-emerald-200 hover:text-white rounded-lg bg-emerald-900 border border-emerald-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="mt-3 pt-2 border-t border-emerald-900 hidden md:flex items-center space-x-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-emerald-950 shadow-md shadow-amber-400/20'
                    : item.highlight
                    ? 'bg-emerald-800 text-amber-300 hover:bg-emerald-700 border border-emerald-700'
                    : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-950' : item.highlight ? 'text-amber-300' : 'text-emerald-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-800 px-4 py-3 space-y-2">
          <div className="p-2 bg-emerald-950 rounded-xl mb-2 text-xs flex justify-between items-center">
            <span className="text-emerald-300 font-semibold">বর্তমান ইউজার:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = INITIAL_USERS.find(u => u.id === e.target.value);
                if (found) onUserChange(found);
              }}
              className="bg-emerald-800 text-amber-300 font-bold px-2 py-1 rounded"
            >
              {INITIAL_USERS.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold ${
                    isActive ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-950 text-emerald-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
