'use client'

import { create } from 'zustand'
import type { UserProfile, Subscription, Generation } from '@/types'

interface AppState {
  language: 'hr' | 'en'
  setLanguage: (lang: 'hr' | 'en') => void
  profile: UserProfile | null
  setProfile: (p: UserProfile | null) => void
  subscription: Subscription | null
  setSubscription: (s: Subscription | null) => void
  generations: Generation[]
  setGenerations: (g: Generation[]) => void
  addGeneration: (g: Generation) => void
}

export const useAppStore = create<AppState>((set) => ({
  language: 'hr',
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') localStorage.setItem('rp-lang', lang)
    set({ language: lang })
  },
  profile: null,
  setProfile: (profile) => set({ profile }),
  subscription: null,
  setSubscription: (subscription) => set({ subscription }),
  generations: [],
  setGenerations: (generations) => set({ generations }),
  addGeneration: (g) => set((s) => ({ generations: [g, ...s.generations] })),
}))
