export type EventType = 'social' | 'meeting' | 'reminder' | 'note' | 'other';

export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  type: EventType;
  imageUrl?: string;
  scheduledDate: Date;
  endDate?: Date;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  reminders: Date[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
  isAllDay?: boolean;
  location?: string;
  attachments?: string[];
  color?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ScheduleFormData {
  title: string;
  description: string;
  type: EventType;
  imageUrl?: string;
  scheduledDate: Date | null;
  endDate?: Date | null;
  platforms: string[];
  notes?: string;
  reminders: Date[];
  category: string;
  isAllDay?: boolean;
  location?: string;
  attachments?: string[];
  color?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CalendarFilters {
  types: EventType[];
  platforms: string[];
  categories: string[];
  searchQuery: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface CalendarExportOptions {
  includePastEvents: boolean;
  includeCompleted: boolean;
  includeDrafts: boolean;
  eventTypes: EventType[];
  categories: string[];
  format: 'json' | 'csv' | 'ics';
}

export interface CalendarImportOptions {
  file: File;
  format: 'json' | 'csv' | 'ics';
  mergeStrategy: 'skip' | 'overwrite' | 'merge';
  timezone: string;
}
