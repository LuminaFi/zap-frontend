import { DirectionType } from "../app/account/types";

export const getFilterDisplayText = (
  direction: DirectionType,
  hasDateFilter: boolean
) => {
  if (direction !== 'all' || hasDateFilter) {
    if (direction === 'from') return 'From Me';
    if (direction === 'to') return 'To Me';
    return 'Custom';
  }
  return 'All';
};