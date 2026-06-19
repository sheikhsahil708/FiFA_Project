'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, LayoutDashboard, Calendar, Users, Layers, Activity, 
  GitFork, Search, Bell, Menu, X, Trash2, Heart, Clock, MapPin, Tv
} from 'lucide-react';
import { useStore, NotificationLog } from '@/store/useStore';
import { getTeams } from '@/services/teams';
import { getMatches } from '@/services/matches';
import { Team, Match } from '@/services/api';

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { 
    favorites, 
    notifications, 
    markNotificationsAsRead, 
    clearNotifications,
    recentSearches,
    addSearchQuery,
    clearSearchQueries
  } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [isNotificationsOpen]);

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification("Notifications Enabled!", {
          body: "You will receive alerts for matches you set reminders for.",
          icon: "https://img.icons8.com/color/96/football.png"
        });
      }
    }
  };

  // Fetch data for instant global search suggestions
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: getTeams,
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: getMatches,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Matches', path: '/matches', icon: Calendar },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Groups', path: '/groups', icon: Layers },
    { name: 'Live Center', path: '/live', icon: Activity },
    { name: 'Bracket', path: '/bracket', icon: GitFork },
    { name: 'Venues', path: '/venues', icon: MapPin },
    { name: 'Streams', path: '/streams', icon: Tv },
  ];

  // Perform search matching
  const filteredTeams = searchQuery.trim() 
    ? teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.fifaCode.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
    : [];

  const filteredMatches = searchQuery.trim()
    ? matches.filter(m => 
        m.homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.awayTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.stadiumCity.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredGroups = searchQuery.trim() && 'groups'.includes(searchQuery.toLowerCase())
    ? ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H', 'Group I', 'Group J', 'Group K', 'Group L']
    : searchQuery.trim() && searchQuery.toLowerCase().startsWith('group ')
      ? [searchQuery.toUpperCase()]
      : [];

  const hasSuggestions = filteredTeams.length > 0 || filteredMatches.length > 0 || filteredGroups.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchQuery(searchQuery);
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (query: string) => {
    addSearchQuery(query);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-25 hidden w-64 border-r border-white/5 bg-[#0b0e14]/90 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-white/5">
          <Trophy className="h-6 w-6 text-brand-blue" />
          <span className="text-lg font-bold tracking-wider text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            WORLD CUP 2026
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-blue/10 text-brand-blue border-l-2 border-brand-blue' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Favorite Teams quick list */}
        {mounted && favorites.length > 0 && (
          <div className="p-4 border-t border-white/5">
            <h3 className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Heart className="h-3 w-3 text-brand-crimson fill-brand-crimson" />
              Favorites
            </h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {favorites.map(favId => {
                const team = teams.find(t => t.id === favId);
                if (!team) return null;
                return (
                  <Link
                    key={team.id}
                    href={`/teams?id=${team.id}`}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/5"
                  >
                    <img src={team.flag} alt={team.name} className="w-5 h-3.5 object-cover rounded" />
                    <span className="truncate">{team.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500">FIFA World Cup 2026 Live Tracker</p>
        </div>
      </aside>

      {/* Navbar - Desktop & Mobile Header */}
      <header className="fixed top-0 right-0 z-20 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#07090e]/85 backdrop-blur-md px-4 md:px-6 lg:w-[calc(100%-16rem)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <h1 className="text-base font-bold text-white capitalize md:text-lg hidden sm:block">
            {menuItems.find(item => item.path === pathname)?.name || 'FIFA World Cup 2026'}
          </h1>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end max-w-xl">
          {/* Mobile Search Toggle */}
          {!isMobileSearchOpen && (
            <button
              onClick={() => {
                setIsMobileSearchOpen(true);
                setIsSearchFocused(true);
              }}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white sm:hidden cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Global Search Bar */}
          <div 
            ref={searchContainerRef} 
            className={
              isMobileSearchOpen 
                ? "absolute inset-x-0 top-0 h-16 bg-[#07090e] px-4 flex items-center gap-3 z-30 lg:relative lg:inset-auto lg:h-auto lg:bg-transparent lg:px-0 lg:flex-1 lg:max-w-md"
                : "relative w-full max-w-md hidden sm:block"
            }
          >
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                placeholder="Search teams, matches, groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                autoFocus={isMobileSearchOpen}
                className="w-full rounded-full bg-white/5 border border-white/10 py-1.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 outline-none transition-all focus:border-brand-blue/50 focus:bg-white/10"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            </form>
            
            {isMobileSearchOpen && (
              <button 
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setIsSearchFocused(false);
                  setSearchQuery('');
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Suggestions dropdown */}
            {(isSearchFocused || isMobileSearchOpen) && (searchQuery.trim() || recentSearches.length > 0) && (
              <div className="absolute top-full right-0 mt-2 w-full rounded-2xl border border-white/10 bg-[#0d121f] p-4 shadow-2xl backdrop-blur-2xl max-h-[70vh] overflow-y-auto z-40">
                {searchQuery.trim() ? (
                  hasSuggestions ? (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {/* Teams Section */}
                      {filteredTeams.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Teams</h4>
                          <div className="space-y-1">
                            {filteredTeams.map(team => (
                              <button
                                key={team.id}
                                onClick={() => handleSuggestionClick(team.name)}
                                className="flex items-center gap-3 w-full rounded-lg px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-white/5"
                              >
                                <img src={team.flag} alt={team.name} className="w-5 h-3.5 object-cover rounded" />
                                <span>{team.name} ({team.fifaCode})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matches Section */}
                      {filteredMatches.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Matches</h4>
                          <div className="space-y-1">
                            {filteredMatches.map(match => (
                              <button
                                key={match.id}
                                onClick={() => handleSuggestionClick(`${match.homeTeamName} vs ${match.awayTeamName}`)}
                                className="flex flex-col w-full rounded-lg px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-white/5"
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="font-medium">{match.homeTeamName} vs {match.awayTeamName}</span>
                                  <span className="text-[10px] text-gray-500">{match.group}</span>
                                </div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" /> {match.stadiumCity}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Groups Section */}
                      {filteredGroups.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Groups</h4>
                          <div className="space-y-1">
                            {filteredGroups.map(group => (
                              <button
                                key={group}
                                onClick={() => handleSuggestionClick(group)}
                                className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-white/5"
                              >
                                <Layers className="h-3.5 w-3.5 text-brand-blue" />
                                <span>{group} Standings</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-gray-400 py-2">No results matching &quot;{searchQuery}&quot;</p>
                  )
                ) : (
                  // Recent Searches
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Recent Searches</h4>
                      <button onClick={clearSearchQueries} className="text-[10px] text-brand-crimson hover:underline">Clear All</button>
                    </div>
                    {mounted && recentSearches.length > 0 ? (
                      <div className="space-y-1">
                        {recentSearches.map(q => (
                          <button
                            key={q}
                            onClick={() => {
                              setSearchQuery(q);
                            }}
                            className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-left text-xs text-gray-300 hover:bg-white/5"
                          >
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span>{q}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 italic py-1">No search history</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (!isNotificationsOpen) {
                  markNotificationsAsRead();
                }
              }}
              className="relative rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {mounted && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-crimson text-[9px] font-bold text-white ring-2 ring-[#07090e]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-2xl border border-white/10 bg-[#0d121f] p-4 shadow-2xl backdrop-blur-2xl z-40">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <h3 className="text-sm font-semibold text-white">Match Alerts</h3>
                  <button 
                    onClick={clearNotifications}
                    className="text-gray-400 hover:text-brand-crimson transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Browser Notification Controls */}
                <div className="border-b border-white/5 pb-2.5 mb-2.5">
                  {notificationPermission === 'granted' ? (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 text-[11px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="font-semibold">✓ Browser Alerts Active</span>
                    </div>
                  ) : notificationPermission === 'denied' ? (
                    <div className="flex flex-col gap-1 rounded-xl bg-brand-crimson/10 border border-brand-crimson/20 py-2 px-3 text-[10px] text-brand-crimson">
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                        ⚠ Notifications Blocked
                      </span>
                      <span className="text-gray-400 font-medium text-[9px] leading-relaxed">Please enable notifications in your browser settings.</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-300 py-2 px-3 text-xs font-bold transition-all cursor-pointer glow-btn"
                    >
                      <Bell className="h-3.5 w-3.5" />
                      Enable Browser Notifications
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 py-1">
                  {mounted && notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className="rounded-xl bg-white/5 p-2.5 border border-white/[0.02]">
                        <p className="text-xs font-semibold text-white">{notif.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{notif.body}</p>
                        <span className="text-[9px] text-gray-500 block mt-1">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Bell className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No recent notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          <aside className="fixed inset-y-0 left-0 w-64 bg-[#0a0d13] p-4 flex flex-col justify-between border-r border-white/5">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-brand-blue" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">WORLD CUP 2026</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                        isActive 
                          ? 'bg-brand-blue/10 text-brand-blue' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {mounted && favorites.length > 0 && (
                <div className="mt-8">
                  <h3 className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Favorites</h3>
                  <div className="space-y-1">
                    {favorites.map(favId => {
                      const team = teams.find(t => t.id === favId);
                      if (!team) return null;
                      return (
                        <Link
                          key={team.id}
                          href={`/teams?id=${team.id}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/5"
                        >
                          <img src={team.flag} alt={team.name} className="w-5 h-3.5 object-cover rounded" />
                          <span>{team.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-4 text-center">
              <p className="text-[10px] text-gray-500">FIFA World Cup 2026</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
export default Navigation;
