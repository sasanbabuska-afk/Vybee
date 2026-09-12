import { Activity, ActivityCategory } from '../../types';
import * as L from 'leaflet';

export const SPORTS_CATEGORIES: ActivityCategory[] = [
  'Football',
  'Basketball',
  'Tennis',
  'Running',
  'Gym',
  'Hiking',
  'Cycling'
];

export const GAMING_CATEGORIES: ActivityCategory[] = [
  'Gaming',
  'Board Games',
  'Chess',
  'Programming'
];

export const SOCIAL_CATEGORIES: ActivityCategory[] = [
  'Music',
  'Photography',
  'Art',
  'Movies',
  'Language Exchange',
  'Cooking',
  'Study',
  'Other'
];

export type MapQuickFilter = 'all' | 'now' | 'sports' | 'gaming' | 'social' | 'nearby';

export const RADIUS_OPTIONS = [
  { value: 0.5, label: '500 m', circleRadiusMeters: 500 },
  { value: 1, label: '1 km', circleRadiusMeters: 1000 },
  { value: 2, label: '2 km', circleRadiusMeters: 2000 },
  { value: 5, label: '5 km', circleRadiusMeters: 5000 },
  { value: 10, label: '10 km', circleRadiusMeters: 10000 },
  { value: 9999, label: 'All', circleRadiusMeters: 25000 }
];

/**
 * Checks if an activity is happening NOW or starting within the next ~3 hours
 */
export function isActivityNow(activity: Activity): boolean {
  if (!activity || !activity.startTime) return false;

  const dateLower = (activity.date || '').toLowerCase().trim();
  const isToday =
    dateLower === 'today' ||
    dateLower.includes('today') ||
    dateLower === new Date().toISOString().split('T')[0];

  if (!isToday) return false;

  try {
    const [hours, minutes] = activity.startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return true; // Fallback to true if today

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const activityStartMinutes = hours * 60 + minutes;
    const durationMinutes = (activity.durationHours || 2) * 60;
    const activityEndMinutes = activityStartMinutes + durationMinutes;

    // Ongoing right now
    if (currentMinutes >= activityStartMinutes - 15 && currentMinutes <= activityEndMinutes) {
      return true;
    }

    // Starting in the next 180 minutes (3 hours)
    if (activityStartMinutes > currentMinutes && activityStartMinutes - currentMinutes <= 180) {
      return true;
    }

    // If it's today generally, consider it "Now / Today"
    return true;
  } catch {
    return true;
  }
}

export interface ActivityCluster {
  id: string;
  lat: number;
  lng: number;
  activities: Activity[];
  isCluster: boolean;
}

/**
 * Fast & lightweight cluster calculation for Leaflet
 */
export function clusterActivities(
  activities: Activity[],
  map: L.Map,
  pixelRadius = 55
): ActivityCluster[] {
  if (!map || activities.length === 0) return [];

  const zoom = map.getZoom();
  const clusters: {
    latSum: number;
    lngSum: number;
    pixelX: number;
    pixelY: number;
    activities: Activity[];
  }[] = [];

  for (const activity of activities) {
    const latlng = L.latLng(activity.approximateLatitude, activity.approximateLongitude);
    const point = map.project(latlng, zoom);

    let merged = false;
    for (const cluster of clusters) {
      const dx = cluster.pixelX - point.x;
      const dy = cluster.pixelY - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= pixelRadius) {
        cluster.activities.push(activity);
        cluster.latSum += activity.approximateLatitude;
        cluster.lngSum += activity.approximateLongitude;
        // Recalculate average pixel center
        cluster.pixelX = (cluster.pixelX * (cluster.activities.length - 1) + point.x) / cluster.activities.length;
        cluster.pixelY = (cluster.pixelY * (cluster.activities.length - 1) + point.y) / cluster.activities.length;
        merged = true;
        break;
      }
    }

    if (!merged) {
      clusters.push({
        latSum: activity.approximateLatitude,
        lngSum: activity.approximateLongitude,
        pixelX: point.x,
        pixelY: point.y,
        activities: [activity]
      });
    }
  }

  return clusters.map((c, index) => {
    const count = c.activities.length;
    const isCluster = count > 1;
    const firstAct = c.activities[0];

    return {
      id: isCluster ? `cluster-${index}-${count}` : `activity-${firstAct.id}`,
      lat: c.latSum / count,
      lng: c.lngSum / count,
      activities: c.activities,
      isCluster
    };
  });
}
