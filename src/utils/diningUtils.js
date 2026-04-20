// Parse "7:00 AM - 8:00 PM" or "7:00 AM – 8:00 PM" (em dash) into minutes since midnight
function toMinutes(h, m, period) {
  let hr = parseInt(h, 10);
  if (period.toUpperCase() === 'PM' && hr !== 12) hr += 12;
  if (period.toUpperCase() === 'AM' && hr === 12) hr = 0;
  return hr * 60 + parseInt(m, 10);
}

// Returns true (open), false (closed), or null (hours unknown)
export function isHallOpen(hoursStr) {
  if (!hoursStr) return null;
  const match = hoursStr.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-\u2013\u2014]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );
  if (!match) return null;
  const open  = toMinutes(match[1], match[2], match[3]);
  const close = toMinutes(match[4], match[5], match[6]);
  const now   = new Date();
  const cur   = now.getHours() * 60 + now.getMinutes();
  return cur >= open && cur < close;
}

// "Mon Apr 21" style date label for the page header
export function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

// ISO date string for today: "2026-04-20"
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// Last N days as [{ dateStr, dayAbbr }], oldest first
export function lastNDays(n = 7) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateStr: d.toISOString().split('T')[0],
      dayAbbr: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
    });
  }
  return days;
}
