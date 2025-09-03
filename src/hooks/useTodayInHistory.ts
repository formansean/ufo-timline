import { useMemo } from 'react';
import { UFOEvent } from '@/types/event';

// Parse date string to get month and day - matches original date processing
const parseEventDate = (dateString: string) => {
  try {
    // Handle format: "Month Day, Year"
    const parts = dateString.split(' ');
    if (parts.length >= 3) {
      const month = parts[0];
      const day = parseInt(parts[1].replace(',', ''));
      const year = parseInt(parts[2]);
      
      return {
        month,
        day,
        year,
        monthNum: getMonthNumber(month),
        isValid: !isNaN(day) && !isNaN(year) && day > 0 && day <= 31
      };
    }
    return { month: '', day: 0, year: 0, monthNum: 0, isValid: false };
  } catch {
    return { month: '', day: 0, year: 0, monthNum: 0, isValid: false };
  }
};

// Convert month name to number
const getMonthNumber = (monthName: string): number => {
  const months: Record<string, number> = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };
  return months[monthName] || 0;
};

export const useTodayInHistory = (events: UFOEvent[]) => {
  const todaysEvents = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // JS months are 0-indexed
    const currentDay = today.getDate();

    return events
      .map(event => ({
        ...event,
        parsedDate: parseEventDate(event.date)
      }))
      .filter(event => 
        event.parsedDate.isValid &&
        event.parsedDate.monthNum === currentMonth &&
        event.parsedDate.day === currentDay
      )
      .sort((a, b) => {
        // Sort by year, most recent first
        return b.parsedDate.year - a.parsedDate.year;
      });
  }, [events]);

  // Get the most notable event for today (highest combined credibility + notoriety)
  const featuredEvent = useMemo(() => {
    if (todaysEvents.length === 0) return null;

    return todaysEvents.reduce((best, current) => {
      const currentScore = (parseFloat(current.credibility || '0') || 0) + 
                          (parseFloat(current.notoriety || '0') || 0);
      const bestScore = (parseFloat(best.credibility || '0') || 0) + 
                       (parseFloat(best.notoriety || '0') || 0);
      
      return currentScore > bestScore ? current : best;
    });
  }, [todaysEvents]);

  // Format today's date for display
  const todayFormatted = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric'
    });
  }, []);

  // Years ago calculation for featured event
  const yearsAgo = useMemo(() => {
    if (!featuredEvent) return 0;
    const currentYear = new Date().getFullYear();
    return currentYear - featuredEvent.parsedDate.year;
  }, [featuredEvent]);

  return {
    todaysEvents,
    featuredEvent,
    todayFormatted,
    yearsAgo,
    hasEventsToday: todaysEvents.length > 0
  };
};