// Dynamic date generator for demo data
// Ensures demo tasks always show relative to current date

export function getDemoDate(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get date X days ago
export function getDemoPastDate(daysAgo) {
  return getDemoDate(-Math.abs(daysAgo));
}

// Helper to get date X days in future
export function getDemoFutureDate(daysAhead) {
  return getDemoDate(Math.abs(daysAhead));
}