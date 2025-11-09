// Tier priority for sorting (higher number = higher priority)
const TIER_PRIORITY: Record<string, number> = {
  national: 6,
  legendary: 5,
  professional: 4,
  regular: 3,
  amateur: 2,
  beginner: 1,
};

export function getTierPriority(tier: string | null | undefined): number {
  if (!tier) return 0;
  return TIER_PRIORITY[tier.toLowerCase()] || 0;
}

export function sortTeamsByTierAndPoints(teams: any[]): any[] {
  return [...teams].sort((a, b) => {
    const tierA = getTierPriority(a.tier || a.school?.tier);
    const tierB = getTierPriority(b.tier || b.school?.tier);
    
    // First sort by tier (higher priority first)
    if (tierB !== tierA) {
      return tierB - tierA;
    }
    
    // Then by points
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    
    // Then by wins
    return b.wins - a.wins;
  });
}

export function sortTeamsByPoints(teams: any[]): any[] {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.wins - a.wins;
  });
}

