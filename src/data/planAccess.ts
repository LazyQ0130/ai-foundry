export function isPlanOpen(planId: string, entitlements: string[], productEntitlements: string[]) {
  const stagesOpen = ['stage-1', 'stage-2', 'stage-3', 'stage-4'].every((id) => entitlements.includes(id))
  if (planId === 'all-access-projects') return stagesOpen && productEntitlements.includes('project-lab')
  if (planId === 'all-access') return stagesOpen
  return entitlements.includes(planId)
}
