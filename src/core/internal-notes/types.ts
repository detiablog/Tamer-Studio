export interface InternalNote {
  id: string;
  ticketId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInternalNoteInput {
  ticketId: string;
  content: string;
  createdBy: string;
}

export interface UpdateInternalNoteInput {
  content: string;
}

export interface InternalNoteFilter {
  ticketId?: string;
  createdBy?: string;
  limit?: number;
  offset?: number;
}
