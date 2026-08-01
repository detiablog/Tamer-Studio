import { db } from "@/lib/db";
import { assetRecognition } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type RecognitionType = "character" | "brand" | "object" | "scene" | "face" | "text" | "logo";

export class RecognitionService {
  async recognizeAsset(userId: string, data: { assetId: string; recognitionType: RecognitionType; label: string; confidence: number; boundingBox?: Record<string, number>; metadata?: Record<string, unknown> }) {
    const id = generateId("arec");
    return db.insert(assetRecognition).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listRecognitions(userId: string, filters?: { assetId?: string; recognitionType?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(assetRecognition.userId, userId)];
    if (filters?.assetId) conditions.push(eq(assetRecognition.assetId, filters.assetId));
    if (filters?.recognitionType) conditions.push(eq(assetRecognition.recognitionType, filters.recognitionType));
    if (filters?.search) conditions.push(like(assetRecognition.label, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetRecognition).where(where).orderBy(desc(assetRecognition.confidence)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetRecognition).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async deleteRecognition(id: string) {
    await db.delete(assetRecognition).where(eq(assetRecognition.id, id));
  }

  async getRecognitionsByAsset(assetId: string) {
    return db.select().from(assetRecognition).where(eq(assetRecognition.assetId, assetId)).orderBy(desc(assetRecognition.confidence));
  }

  async autoRecognize(userId: string, assetId: string, metadata: Record<string, unknown>) {
    const recognitions: string[] = [];

    if (metadata.character) {
      await this.recognizeAsset(userId, { assetId, recognitionType: "character", label: metadata.character as string, confidence: 85 });
      recognitions.push("character");
    }
    if (metadata.brand) {
      await this.recognizeAsset(userId, { assetId, recognitionType: "brand", label: metadata.brand as string, confidence: 80 });
      recognitions.push("brand");
    }
    if (metadata.objects && Array.isArray(metadata.objects)) {
      for (const obj of metadata.objects as Array<{ label: string; confidence?: number }>) {
        await this.recognizeAsset(userId, { assetId, recognitionType: "object", label: obj.label, confidence: obj.confidence || 70 });
      }
      recognitions.push("objects");
    }

    return recognitions;
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(assetRecognition).where(eq(assetRecognition.userId, userId));
    const byType = await db.select({ recognitionType: assetRecognition.recognitionType, count: sql<number>`count(*)` }).from(assetRecognition).where(eq(assetRecognition.userId, userId)).groupBy(assetRecognition.recognitionType);
    return { totalRecognitions: Number(total?.count ?? 0), byType };
  }
}

export const recognitionService = new RecognitionService();
