'use client'

import mixpanel from 'mixpanel-browser'

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || ''
let initialized = false

export const initMixpanel = () => {
  if (initialized || !TOKEN || typeof window === 'undefined') return
  mixpanel.init(TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  })
  initialized = true
}

export const track = (event: string, props?: Record<string, unknown>) => {
  if (!TOKEN || typeof window === 'undefined') return
  try {
    initMixpanel()
    mixpanel.track(event, { ...props, timestamp: new Date().toISOString() })
  } catch {}
}

export const identifyAdmin = (email: string, name?: string) => {
  if (!TOKEN || typeof window === 'undefined') return
  try {
    initMixpanel()
    mixpanel.identify(email)
    mixpanel.people.set({ $email: email, $name: name || email, role: 'admin' })
  } catch {}
}
