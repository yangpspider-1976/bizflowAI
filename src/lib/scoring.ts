export const SCORE_AREAS = [
  { key: 'sns_presence', label: 'SNS Presence', max: 15 },
  { key: 'content_quality', label: 'Content Quality', max: 20 },
  { key: 'google_maps_visibility', label: 'Google Maps Visibility', max: 15 },
  { key: 'website_landing_flow', label: 'Website & Landing Flow', max: 15 },
  { key: 'ad_readiness', label: 'Ad Readiness', max: 15 },
  { key: 'inquiry_lead_flow', label: 'Inquiry & Lead Flow', max: 10 },
  { key: 'competitor_appeal', label: 'Competitor Appeal', max: 10 },
] as const

export const PACKAGE_MAP: Record<string, string> = {
  'SNS Presence': 'SNS Profile Optimization',
  'Content Quality': 'AI Content Manager',
  'Google Maps Visibility': 'Local Visibility Optimization',
  'Website & Landing Flow': 'Landing Flow Improvement',
  'Ad Readiness': 'Ad Readiness Setup',
  'Inquiry & Lead Flow': 'Inquiry Flow Automation',
  'Competitor Appeal': 'Positioning & Offer Improvement',
}

export function calculateGrade(totalScore: number): string {
  if (totalScore >= 85) return 'A'
  if (totalScore >= 70) return 'B'
  if (totalScore >= 55) return 'C'
  if (totalScore >= 40) return 'D'
  return 'E'
}

export function calculateLowestAreas(scores: Record<string, number>) {
  const ratios = SCORE_AREAS.map(area => ({
    area: area.label,
    score: scores[area.key] || 0,
    max: area.max,
    ratio: (scores[area.key] || 0) / area.max,
  }))
  return ratios.sort((a, b) => a.ratio - b.ratio).slice(0, 3)
}

export function calculateRecommendedPackage(
  totalScore: number,
  grade: string,
  lowestAreas: Array<{ area: string }>,
  adReadiness: number
): string {
  if (totalScore < 55) return 'Monthly Growth Support'
  if ((grade === 'A' || grade === 'B') && adReadiness >= 12) return 'AI Ads Optimizer'
  return PACKAGE_MAP[lowestAreas[0]?.area] || 'Monthly Growth Support'
}
