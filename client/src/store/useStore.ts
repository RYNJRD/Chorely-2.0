import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Family } from '../../shared/schema';

interface AppState {
  family: Family | null;
  currentUser: User | null;

  onboardingIntent: 'create' | 'join' | null;
  firebaseUid: string | null;
  pendingFamilyId: number | null;
  isDrawerOpen: boolean;
  isNavHidden: boolean;
  lastChatVisit: number; // timestamp
  setFamily: (family: Family | null) => void;
  setCurrentUser: (user: User | null) => void;

  setOnboardingIntent: (intent: 'create' | 'join' | null) => void;
  setFirebaseUid: (uid: string | null) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  setIsNavHidden: (isHidden: boolean) => void;
  setLastChatVisit: (timestamp: number) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      family: null,
      currentUser: null,

      onboardingIntent: null,
      firebaseUid: null,
      pendingFamilyId: null,
      setFamily: (family) => set({ family }),
      setCurrentUser: (user) => set({ currentUser: user }),

      setOnboardingIntent: (intent) => set({ onboardingIntent: intent }),
      setFirebaseUid: (uid) => set({ firebaseUid: uid }),
      setPendingFamilyId: (id) => set({ pendingFamilyId: id }),
      isDrawerOpen: false,
      setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      isNavHidden: false,
      setIsNavHidden: (isHidden) => set({ isNavHidden: isHidden }),
      lastChatVisit: 0,
      setLastChatVisit: (timestamp) => set({ lastChatVisit: timestamp }),
      logout: () => set({ family: null, currentUser: null, onboardingIntent: null, firebaseUid: null, pendingFamilyId: null, isDrawerOpen: false, isNavHidden: false, lastChatVisit: 0 }),
    }),
    {
      name: 'chore-app-storage',
    }
  )
);
