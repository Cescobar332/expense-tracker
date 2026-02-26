'use client';

import {
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  Heart,
  Film,
  BookOpen,
  Shirt,
  Package,
  PiggyBank,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  Heart,
  Film,
  BookOpen,
  Shirt,
  Package,
  PiggyBank,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export function getCategoryIcon(
  iconName?: string | null,
  fallbackName?: string | null,
  type?: string,
): React.ReactNode {
  if (iconName && ICON_MAP[iconName]) {
    const Icon = ICON_MAP[iconName];
    return <Icon className="w-5 h-5" />;
  }
  if (fallbackName) {
    return fallbackName[0]?.toUpperCase() || '?';
  }
  if (type === 'INCOME') return 'I';
  if (type === 'EXPENSE') return 'G';
  return '?';
}

export function getIconComponent(iconName: string): LucideIcon | null {
  return ICON_MAP[iconName] || null;
}
