import { BaseAIService } from "../base";
import type { ChatMessage, ChatOptions, ChatResponse } from "./types";
import { ChatConversation } from "../assets";

export class AIServiceChat extends BaseAIService {
  async complete(
    messages: ChatMessage[],
    options: ChatOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<ChatResponse> {
    const payload: Record<string, unknown> = {
      messages,
      systemPrompt: options.systemPrompt,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      topP: options.topP,
      stop: options.stop,
    };

    const result = await this.execute<{
      message: ChatMessage;
      conversationId: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }>("chat.complete", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Chat completion failed");
    }

    return {
      message: result.data.message,
      conversationId: result.data.conversationId,
      usage: {
        promptTokens: result.data.promptTokens,
        completionTokens: result.data.completionTokens,
        totalTokens: result.data.totalTokens,
      },
    };
  }

  async *stream(
    messages: ChatMessage[],
    options: ChatOptions = {},
    context: Record<string, unknown> = {},
  ): AsyncIterable<ChatResponse> {
    const payload: Record<string, unknown> = {
      messages,
      systemPrompt: options.systemPrompt,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      topP: options.topP,
      stop: options.stop,
      stream: true,
    };

    for await (const chunk of this.executeStream<{
      content?: string;
      conversationId: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }>("chat.stream", payload, context)) {
      if (chunk.success && chunk.data) {
        yield {
          message: { role: "assistant", content: chunk.data.content ?? "" },
          conversationId: chunk.data.conversationId,
          usage: {
            promptTokens: chunk.data.promptTokens,
            completionTokens: chunk.data.completionTokens,
            totalTokens: chunk.data.totalTokens,
          },
        };
      } else if (chunk.error) {
        throw new Error(chunk.error.message ?? "Chat streaming failed");
      }
    }
  }

  async getHistory(conversationId: string): Promise<ChatConversation> {
    const result = await this.execute<{ messages: Array<{ role: "user" | "assistant" | "system"; content: string; timestamp?: string; metadata?: Record<string, unknown> }> }>("chat.history", { conversationId }, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Failed to retrieve chat history");
    }

    return new ChatConversation(conversationId, result.data.messages.map((m) => ({
      ...m,
      timestamp: m.timestamp ?? new Date().toISOString(),
    })), {
      provider: "",
      model: "",
      prompt: "",
      credits: 0,
      cost: 0,
      currency: "USD",
      workspaceId: "",
      projectId: "",
      generationId: conversationId,
      createdAt: new Date().toISOString(),
    });
  }
}
