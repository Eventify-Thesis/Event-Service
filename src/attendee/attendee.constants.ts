export const AttendeeErrorMessages = {
  TICKET_QUANTITY_EXCEEDED: 'Cannot create attendee: Ticket type has reached maximum quantity',
  TICKET_TYPE_NOT_FOUND: 'Ticket type not found',
  NEW_TICKET_TYPE_NOT_FOUND: 'New ticket type not found',
  ATTENDEE_NOT_FOUND: (id: number | string) => `Attendee #${id} not found`,
  ATTENDEE_NOT_FOUND_BY_PUBLIC_ID: (publicId: string) => `Attendee with public ID ${publicId} not found`,
  CREATE_FAILED: (error: string) => `Failed to create attendee: ${error}`,
  UPDATE_FAILED: (error: string) => `Failed to update attendee: ${error}`,
  MODIFY_FAILED: (error: string) => `Failed to modify attendee: ${error}`,
  FETCH_FAILED: (error: string) => `Failed to fetch attendee: ${error}`,
  FETCH_ALL_FAILED: (error: string) => `Failed to fetch attendees: ${error}`,
  CHECK_IN_FAILED: (error: string) => `Failed to check in/out attendee: ${error}`,
  EXPORT_FAILED: (error: string) => `Failed to export attendees: ${error}`,
  RESEND_TICKET_FAILED: (error: string) => `Failed to resend ticket: ${error}`,
} as const;

export const AttendeeSuccessMessages = {
  TICKET_RESENT: 'Ticket resent successfully',
} as const;
