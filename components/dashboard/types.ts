export interface Stats {
  totalUsers: number
  totalProjects: number
  totalMilestones: number
  totalAchievers: number
  activeProjects: number
  completedMilestones: number
}

export interface Project {
  _id: string
  title: string
  category: string
  targetAmount: number
  raisedAmount: number
  progress: number
  status: string
}

export interface Achiever {
  _id: string
  badge: string
  userId: { name: string; email: string }
  title: string
  awardedAt: string
}

export interface ProjectChartData {
  name: string
  raised: number
  target: number
  progress: number
}

export const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']


