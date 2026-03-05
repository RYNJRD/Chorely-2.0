import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Family } from '@shared/schema';

interface AppState {
  family: Family | null;
  currentUser: User | null;
  onboardingIntent: 'create' | 'join' | null;
  firebaseUid: string | null;
  pendingFamilyId: number | null;
  setFamily: (family: Family | null) => void;
  setCurrentUser: (user: User | null) => void;
  setOnboardingIntent: (intent: 'create' | 'join' | null) => void;
  setFirebaseUid: (uid: string | null) => void;
  setPendingFamilyId: (id: number | null) => void;
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
      logout: () => set({ family: null, currentUser: null, onboardingIntent: null, firebaseUid: null, pendingFamilyId: null }),
    }),
    {
      name: 'chore-app-storage',
    }
  )
);
