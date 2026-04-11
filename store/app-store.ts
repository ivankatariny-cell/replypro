import { create } from 'zustand'
import type { UserProfile, Subscription, Generation, Client, Property, Template, Favorite, Appointment } from '@/types'

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
  appendGenerations: (g: Generation[]) => void
  clients: Client[]
  setClients: (c: Client[]) => void
  addClient: (c: Client) => void
  updateClient: (id: string, data: Partial<Client>) => void
  removeClient: (id: string) => void
  properties: Property[]
  setProperties: (p: Property[]) => void
  addProperty: (p: Property) => void
  updateProperty: (id: string, data: Partial<Property>) => void
  removeProperty: (id: string) => void
  templates: Template[]
  setTemplates: (t: Template[]) => void
  favorites: Favorite[]
  setFavorites: (f: Favorite[]) => void
  addFavorite: (f: Favorite) => void
  removeFavorite: (id: string) => void
  appointments: Appointment[]
  setAppointments: (a: Appointment[]) => void
  addAppointment: (a: Appointment) => void
  updateAppointment: (id: string, data: Partial<Appointment>) => void
  removeAppointment: (id: string) => void
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
  appendGenerations: (g) => set((s) => ({ generations: [...s.generations, ...g] })),
  clients: [],
  setClients: (clients) => set({ clients }),
  addClient: (c) => set((s) => ({ clients: [c, ...s.clients] })),
  updateClient: (id, data) => set((s) => ({
    clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
  })),
  removeClient: (id) => set((s) => ({
    clients: s.clients.filter((c) => c.id !== id),
  })),
  properties: [],
  setProperties: (properties) => set({ properties }),
  addProperty: (p) => set((s) => ({ properties: [p, ...s.properties] })),
  updateProperty: (id, data) => set((s) => ({
    properties: s.properties.map((p) => (p.id === id ? { ...p, ...data } : p)),
  })),
  removeProperty: (id) => set((s) => ({
    properties: s.properties.filter((p) => p.id !== id),
  })),
  templates: [],
  setTemplates: (templates) => set({ templates }),
  favorites: [],
  setFavorites: (favorites) => set({ favorites }),
  addFavorite: (f) => set((s) => ({ favorites: [f, ...s.favorites] })),
  removeFavorite: (id) => set((s) => ({
    favorites: s.favorites.filter((f) => f.id !== id),
  })),
  appointments: [],
  setAppointments: (appointments) => set({ appointments }),
  addAppointment: (a) => set((s) => ({ appointments: [a, ...s.appointments] })),
  updateAppointment: (id, data) => set((s) => ({
    appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)),
  })),
  removeAppointment: (id) => set((s) => ({
    appointments: s.appointments.filter((a) => a.id !== id),
  })),
}))
