/**
 * Total Office Center (TOC) Commercial ERP - Formatting Utilities
 * Standard Bangladeshi Currency (BDT ৳) and Date/Time helpers
 */

export const formatBDT = (amount, showSymbol = true) => {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showSymbol ? `৳ ${formatted}` : formatted;
};

export const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('en-BD');
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};
