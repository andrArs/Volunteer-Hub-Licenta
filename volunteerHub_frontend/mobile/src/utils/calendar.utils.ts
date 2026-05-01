import * as Calendar from "expo-calendar";
import { Alert, Platform } from "react-native";
import { EventResponse } from "../types/event";

async function getDefaultCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  if (Platform.OS === "ios") {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    return defaultCal?.id ?? null;
  }

  const primary = calendars.find((c) => c.isPrimary) ?? calendars[0];
  return primary?.id ?? null;
}

async function createCalendarEvent(
  calendarId: string,
  event: EventResponse,
  startDate: Date,
  endDate: Date
): Promise<void> {
  try {
    await Calendar.createEventAsync(calendarId, {
      title: event.title,
      location: event.address ?? event.locationName,
      startDate,
      endDate,
      notes: event.description,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    Alert.alert("Added to calendar!", `"${event.title}" is now in your calendar.`);
  } catch {
    Alert.alert("Error", "Could not add event to calendar.");
  }
}

export async function removeEventFromCalendar(event: EventResponse): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") return;

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) return;

  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  const matches = await Calendar.getEventsAsync([calendarId], startDate, endDate);
  const found = matches.find((e) => e.title === event.title);
  if (!found) return;

  Alert.alert(
    "Remove from calendar?",
    `Do you want to remove "${event.title}" from your calendar?`,
    [
      { text: "Keep it", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await Calendar.deleteEventAsync(found.id);
          } catch {
            Alert.alert("Error", "Could not remove event from calendar.");
          }
        },
      },
    ]
  );
}

export function addEventToCalendar(event: EventResponse): void {
  Alert.alert(
    "Add to calendar?",
    `Do you want to add "${event.title}" to your calendar?`,
    [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => doAddEventToCalendar(event) },
    ]
  );
}

async function doAddEventToCalendar(event: EventResponse): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission required",
      "Allow calendar access in Settings to add events."
    );
    return;
  }

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) {
    Alert.alert("Error", "No calendar found on this device.");
    return;
  }

  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  const conflicts = await Calendar.getEventsAsync([calendarId], startDate, endDate);

  if (conflicts.length > 0) {
    const conflictTitle = conflicts[0].title;
    Alert.alert(
      "Calendar conflict",
      `You already have "${conflictTitle}" at this time. Add anyway?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, add it",
          onPress: () => createCalendarEvent(calendarId, event, startDate, endDate),
        },
      ]
    );
  } else {
    await createCalendarEvent(calendarId, event, startDate, endDate);
  }
}
