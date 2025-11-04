export function getMonthsInRange(
  startMonth: string,
  endMonth: string
): string[] {
  const startDate = new Date(startMonth);
  const endDate = new Date(endMonth);
  const months = [];

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');

    months.push(`${year}-${month}`);

    currentDate.setMonth(currentDate.getMonth() + 1);

    if (currentDate.getMonth() === 0) {
      currentDate.setFullYear(currentDate.getFullYear());
    }
  }

  return months;
}
