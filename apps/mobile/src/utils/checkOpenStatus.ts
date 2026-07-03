export function isPlaceOpen(reportedHours: string | null | undefined): boolean {
  if (!reportedHours) return false;
  
  // Format is typically "9:00 PM – 4:00 AM" or "9:00 PM to 4:00 AM"
  const parts = reportedHours.split(/\s*[-–—]\s*|\s+to\s+/i).map(s => s.trim());
  if (parts.length !== 2) return false;

  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes; // returns minutes since midnight
  };

  const openMins = parseTime(parts[0]);
  const closeMins = parseTime(parts[1]);

  if (openMins === null || closeMins === null) return false;

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  if (openMins < closeMins) {
    // e.g. 9:00 AM to 5:00 PM (540 to 1020)
    return currentMins >= openMins && currentMins <= closeMins;
  } else {
    // e.g. 9:00 PM to 4:00 AM (1260 to 240)
    // It's open if it's after 9PM OR before 4AM
    return currentMins >= openMins || currentMins <= closeMins;
  }
}
