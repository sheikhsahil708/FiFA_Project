import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reminder {
  matchId: string;
  timeBeforeMinutes: number; // 15, 30, 60, 180, 24*60=1440
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

interface StoreState {
  favorites: string[];
  reminders: Reminder[];
  notifications: NotificationLog[];
  recentSearches: string[];
  toggleFavorite: (teamId: string) => void;
  isFavorite: (teamId: string) => boolean;
  addReminder: (matchId: string, timeBeforeMinutes: number) => void;
  removeReminder: (matchId: string) => void;
  getReminder: (matchId: string) => Reminder | undefined;
  addNotification: (title: string, body: string) => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  addSearchQuery: (query: string) => void;
  clearSearchQueries: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      favorites: [],
      reminders: [],
      notifications: [],
      recentSearches: [],
      
      toggleFavorite: (teamId) => set((state) => {
        const isFav = state.favorites.includes(teamId);
        return {
          favorites: isFav 
            ? state.favorites.filter((id) => id !== teamId)
            : [...state.favorites, teamId]
        };
      }),
      
      isFavorite: (teamId) => get().favorites.includes(teamId),
      
      addReminder: (matchId, timeBeforeMinutes) => set((state) => {
        const filtered = state.reminders.filter((r) => r.matchId !== matchId);
        return {
          reminders: [...filtered, { matchId, timeBeforeMinutes }]
        };
      }),
      
      removeReminder: (matchId) => set((state) => ({
        reminders: state.reminders.filter((r) => r.matchId !== matchId)
      })),
      
      getReminder: (matchId) => get().reminders.find((r) => r.matchId === matchId),
      
      addNotification: (title, body) => set((state) => ({
        notifications: [
          {
            id: Math.random().toString(36).substring(2, 9),
            title,
            body,
            timestamp: Date.now(),
            read: false
          },
          ...state.notifications
        ].slice(0, 50) // keep last 50 only
      })),
      
      markNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      addSearchQuery: (query) => set((state) => {
        const trimmed = query.trim();
        if (!trimmed) return {};
        const filtered = state.recentSearches.filter((q) => q !== trimmed);
        return {
          recentSearches: [trimmed, ...filtered].slice(0, 10) // Limit to 10
        };
      }),
      
      clearSearchQueries: () => set({ recentSearches: [] })
    }),
    {
      name: 'fifa-tracker-store',
    }
  )
);
