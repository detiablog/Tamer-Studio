import type { AssetMetadata, ChatMessageData } from "./types";

export class ChatConversation {
  readonly id: string;
  readonly messages: ChatMessageData[];
  readonly metadata: AssetMetadata;

  constructor(id: string, messages: ChatMessageData[], metadata: AssetMetadata) {
    this.id = id;
    this.messages = messages;
    this.metadata = metadata;
  }

  addMessage(message: ChatMessageData): ChatConversation {
    return new ChatConversation(this.id, [...this.messages, message], this.metadata);
  }

  getHistory(): ChatMessageData[] {
    return [...this.messages];
  }
}
