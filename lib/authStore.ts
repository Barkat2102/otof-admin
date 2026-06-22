'use client'

import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  adminEmail: string | null
  adminName: string | null
  adminRole: string | null
  setAuth: (isAuthenticated: boolean, email: string | null, name: string | null, role: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  adminEmail: null,
  adminName: null,
  adminRole: null,
  setAuth: (isAuthenticated, email, name, role) =>
    set({ isAuthenticated, adminEmail: email, adminName: name, adminRole: role }),
  logout: () =>
    set({ isAuthenticated: false, adminEmail: null, adminName: null, adminRole: null }),
}))
