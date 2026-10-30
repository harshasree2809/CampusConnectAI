export const currentYear = new Date().getFullYear();
export const availableBatches = Array.from({length: 7}, (_, i) => currentYear + i);
export function canApply(user: any, opportunity: any) {
  return user.role === 'student' && user.isVerified && Date.parse(opportunity.deadline) > Date.now() && opportunity.eligibilityBatches.includes(user.graduationYear) && (opportunity.eligibleBranches.includes('All Branches') || opportunity.eligibleBranches.includes(user.department));
}
