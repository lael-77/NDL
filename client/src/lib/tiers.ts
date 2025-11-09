// Tier definitions and utilities
export const TIERS = ['beginner', 'amateur', 'regular', 'professional', 'legendary', 'national'] as const;
export type Tier = typeof TIERS[number];

export const TIER_DISPLAY_NAMES: Record<Tier, string> = {
  beginner: 'Beginner',
  amateur: 'Amateur',
  regular: 'Regular',
  professional: 'Professional',
  legendary: 'Legendary',
  national: 'National',
};

export const TIER_COLORS: Record<Tier, { text: string; bg: string; border: string; glow: string }> = {
  beginner: {
    text: 'text-gray-500',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    glow: 'shadow-[0_0_20px_rgba(100,116,139,0.3)]',
  },
  amateur: {
    text: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'shadow-[0_0_25px_rgba(59,130,246,0.4)]',
  },
  regular: {
    text: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]',
  },
  professional: {
    text: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
  },
  legendary: {
    text: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    glow: 'shadow-[0_0_30px_rgba(251,146,60,0.4)]',
  },
  national: {
    text: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
  },
};

export function getTierColor(tier: string | null | undefined): string {
  if (!tier) return TIER_COLORS.beginner.text + ' ' + TIER_COLORS.beginner.bg + ' ' + TIER_COLORS.beginner.border;
  const normalizedTier = tier.toLowerCase() as Tier;
  const colors = TIER_COLORS[normalizedTier] || TIER_COLORS.beginner;
  return `${colors.text} ${colors.bg} ${colors.border}`;
}

export function getTierGlow(tier: string | null | undefined): string {
  if (!tier) return TIER_COLORS.beginner.glow;
  const normalizedTier = tier.toLowerCase() as Tier;
  return TIER_COLORS[normalizedTier]?.glow || TIER_COLORS.beginner.glow;
}

export function getTierDisplayName(tier: string | null | undefined): string {
  if (!tier) return 'Beginner';
  const normalizedTier = tier.toLowerCase() as Tier;
  return TIER_DISPLAY_NAMES[normalizedTier] || tier;
}

