import { Activity } from '../types';

export interface CountdownResult {
  targetDate: Date;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isPast: boolean;
  isOngoing: boolean;
  isImminent: boolean; // < 1 hour away
  compactTicker: string; // e.g. "3h.25m.22sc"
  formattedReadable: string; // e.g. "3 hours 25 mins"
  statusBadgeText: string;
}

export interface ActivityReminderConfig {
  activityId: string;
  leadMinutes: number; // 15, 60, 180, 1440
  enabled: boolean;
  notes?: string;
  checklist?: { id: string; text: string; done: boolean }[];
  lastTriggered?: string;
}

const REMINDERS_STORAGE_KEY = 'nova_activity_reminders_v1';

/**
 * Parse an activity date string and time string into a concrete JavaScript Date object.
 */
export function parseActivityDateTime(dateStr: string, startTimeStr: string): Date {
  const now = new Date();
  const target = new Date();

  // Parse time part (e.g. "20:30", "19:00", "7:00 PM")
  let hours = 18;
  let minutes = 0;

  if (startTimeStr) {
    const isPM = startTimeStr.toLowerCase().includes('pm');
    const isAM = startTimeStr.toLowerCase().includes('am');
    const cleanTime = startTimeStr.replace(/(am|pm)/i, '').trim();
    const parts = cleanTime.split(':').map(p => parseInt(p, 10));

    if (!isNaN(parts[0])) {
      hours = parts[0];
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
    }
    if (parts.length > 1 && !isNaN(parts[1])) {
      minutes = parts[1];
    }
  }

  target.setHours(hours, minutes, 0, 0);

  const cleanDate = dateStr.trim().toLowerCase();

  if (cleanDate === 'today') {
    // If today and time has passed by more than 4 hours, leave as today or adjust
    return target;
  } else if (cleanDate === 'tomorrow') {
    target.setDate(target.getDate() + 1);
    return target;
  } else {
    // Check for weekday names
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = weekdays.indexOf(cleanDate);

    if (dayIndex !== -1) {
      const currentDay = now.getDay();
      let diff = dayIndex - currentDay;
      if (diff <= 0) {
        diff += 7; // Next occurrence
      }
      target.setDate(now.getDate() + diff);
      return target;
    }

    // Try parsing ISO or custom date like "2026-08-18"
    const parsedCustom = new Date(dateStr);
    if (!isNaN(parsedCustom.getTime())) {
      parsedCustom.setHours(hours, minutes, 0, 0);
      return parsedCustom;
    }
  }

  return target;
}

/**
 * Calculates real-time countdown details for any activity
 */
export function calculateActivityCountdown(activity: {
  date: string;
  startTime: string;
  durationHours?: number;
}): CountdownResult {
  const targetDate = parseActivityDateTime(activity.date, activity.startTime);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);

  const durationMs = (activity.durationHours || 2) * 60 * 60 * 1000;
  const isOngoing = totalSeconds <= 0 && Math.abs(diffMs) < durationMs;
  const isPast = totalSeconds <= 0 && !isOngoing;

  if (totalSeconds <= 0) {
    if (isOngoing) {
      return {
        targetDate,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isPast: false,
        isOngoing: true,
        isImminent: true,
        compactTicker: 'LIVE NOW',
        formattedReadable: 'Happening right now!',
        statusBadgeText: 'Ongoing squad'
      };
    }
    return {
      targetDate,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isPast: true,
      isOngoing: false,
      isImminent: false,
      compactTicker: '00h.00m.00sc',
      formattedReadable: 'Completed',
      statusBadgeText: 'Past activity'
    };
  }

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  // Format as "3h.25m.22sc" or "2d 03h.25m.22sc"
  let compactTicker = '';
  if (days > 0) {
    compactTicker = `${days}d ${hours}h.${pad(minutes)}m.${pad(seconds)}sc`;
  } else if (hours > 0) {
    compactTicker = `${hours}h.${pad(minutes)}m.${pad(seconds)}sc`;
  } else {
    compactTicker = `${minutes}m.${pad(seconds)}sc`;
  }

  let formattedReadable = '';
  if (days > 0) {
    formattedReadable = `${days} day${days > 1 ? 's' : ''} ${hours}h`;
  } else if (hours > 0) {
    formattedReadable = `${hours} hr ${minutes} min`;
  } else {
    formattedReadable = `${minutes} min ${seconds} sec`;
  }

  return {
    targetDate,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isPast: false,
    isOngoing: false,
    isImminent: totalSeconds < 3600, // less than 60 mins
    compactTicker,
    formattedReadable,
    statusBadgeText: days > 0 ? `In ${days} day${days > 1 ? 's' : ''}` : `Starts in ${compactTicker}`
  };
}

/**
 * Generate Google Calendar direct link for adding the activity
 */
export function getGoogleCalendarUrl(activity: Activity): string {
  const start = parseActivityDateTime(activity.date, activity.startTime);
  const end = new Date(start.getTime() + (activity.durationHours || 2) * 60 * 60 * 1000);

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const datesParam = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
  const title = encodeURIComponent(`[NOVA Squad] ${activity.title} (${activity.category})`);
  const details = encodeURIComponent(
    `${activity.description}\n\n📍 Meeting Venue: ${activity.locationName}\n👥 Max Squad: ${activity.maxParticipants} players\n⚡ NOVA Real-Life Activities`
  );
  const location = encodeURIComponent(activity.locationName);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
}

/**
 * Generates and triggers download of an .ics calendar file for Apple/Outlook/Desktop calendars
 */
export function downloadActivityIcs(activity: Activity): void {
  const start = parseActivityDateTime(activity.date, activity.startTime);
  const end = new Date(start.getTime() + (activity.durationHours || 2) * 60 * 60 * 1000);

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NOVA Real Life Squad//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:nova-activity-${activity.id}@novasquad.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:[NOVA] ${activity.title}`,
    `DESCRIPTION:${activity.description.replace(/\n/g, '\\n')} - Organized on NOVA Squad Finder`,
    `LOCATION:${activity.locationName}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${activity.title} starts in 30 minutes!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `nova-${activity.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reminder Settings Local Persistence
 */
export function getSavedReminders(): Record<string, ActivityReminderConfig> {
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveActivityReminder(reminder: ActivityReminderConfig): void {
  try {
    const existing = getSavedReminders();
    existing[reminder.activityId] = reminder;
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save reminder', e);
  }
}

export function deleteActivityReminder(activityId: string): void {
  try {
    const existing = getSavedReminders();
    delete existing[activityId];
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to delete reminder', e);
  }
}

/**
 * Browser Notification dispatcher with gentle audio fallback
 */
export async function triggerNotificationAlert(title: string, body: string): Promise<boolean> {
  try {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
        return true;
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico'
          });
          return true;
        }
      }
    }
  } catch (e) {
    console.warn('Browser notification not supported in iframe', e);
  }
  return false;
}
