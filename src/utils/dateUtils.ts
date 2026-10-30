export function getDeadlineInfo(deadlineIso: string): {
  isExpired: boolean;
  isUrgent24h: boolean;
  isUrgent48h: boolean;
  hoursRemaining: number;
  formattedText: string;
} {
  const deadlineDate = new Date(deadlineIso);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return {
      isExpired: true,
      isUrgent24h: false,
      isUrgent48h: false,
      hoursRemaining: 0,
      formattedText: 'Deadline Expired',
    };
  }

  if (diffMs <= 24 * 3600000) {
    return {
      isExpired: false,
      isUrgent24h: true,
      isUrgent48h: true,
      hoursRemaining: Math.max(1, diffHours),
      formattedText: `Closes in ${Math.max(1, diffHours)}h!`,
    };
  }

  if (diffMs <= 48 * 3600000) {
    return {
      isExpired: false,
      isUrgent24h: false,
      isUrgent48h: true,
      hoursRemaining: diffHours,
      formattedText: `Closes in ~1 day`,
    };
  }

  return {
    isExpired: false,
    isUrgent24h: false,
    isUrgent48h: false,
    hoursRemaining: diffHours,
    formattedText: `Closes in ${diffDays} days`,
  };
}

export function formatDateSimple(dateIso: string): string {
  try {
    const d = new Date(dateIso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateIso;
  }
}
