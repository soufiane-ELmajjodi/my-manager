import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from './logo.png'
import { useAuth } from '@/contexts/AuthContext';

import {
  Search,
  Plus,
  Moon,
  Sun,
  Download,
  RefreshCw,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  onExportClick: () => void;
  onRefreshClick: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  expiringCount: number;
}

export function Header({
  searchQuery,
  onSearchChange,
  onAddClick,
  onExportClick,
  onRefreshClick,
  isDark,
  onThemeToggle,
  expiringCount,
}: HeaderProps) {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="">
              <img src={logo} alt="Company Logo"
                className="h-10 w-10 rounded-full object-cover border-3 border-blue-600" />
            </div>
            <div>

              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                GPS Manager EBAROUTE
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  WELCOME TO GPS MANAGER EBAROUTE
                </p>
                {user && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                    <User className="h-2.5 w-2.5" />
                    {user.username}
                  </span>
                )}
              </div>
            </div>
            {expiringCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {expiringCount} expiring
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search clients, IMEI, GPS..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  'pl-10 pr-4 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
                  'focus-visible:ring-blue-500 focus-visible:border-blue-500',
                  'transition-all duration-200'
                )}
              />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onRefreshClick}
              className="h-10 w-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Export Button */}
            <Button
              variant="outline"
              onClick={onExportClick}
              className="h-10 px-3 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={onThemeToggle}
              className="h-10 w-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </Button>

            {/* Add Button */}
            <Button
              onClick={onAddClick}
              className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Client</span>
            </Button>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className="h-10 w-10 border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
