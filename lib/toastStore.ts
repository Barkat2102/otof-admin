'use client'

import { create } from 'zustand'

export type ToastType = 'login' | 'logout' | 'userCreated' | 'userUpdated' | 'userDeleted'

interface ToastState {
  visible: boolean
  type: ToastType
  name: string
  show: (type: ToastType, name?: string) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  type: 'login',
  name: '',
  show: (type, name = '') => set({ visible: true, type, name }),
  hide: () => set({ visible: false }),
}))
