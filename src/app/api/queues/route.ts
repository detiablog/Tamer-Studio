import { NextResponse } from "next/server";
import { jobStore } from "@/core/jobs/job-store";

export async function GET() {
  const stats = jobStore.getStats();
  const queue = jobStore.getQueue();
  const deadLetter = jobStore.getDeadLetter();

  const queues = [
    {
      id: "video-processing",
      name: "Video Processing",
      depth: queue.filter((j) => j.type === "video.generate").length,
      throughput: "2.1/min",
      avgWait: "45s",
      status: "Healthy",
      failed: deadLetter.filter((j) => j.type === "video.generate").length,
    },
    {
      id: "image-generation",
      name: "Image Generation",
      depth: queue.filter((j) => j.type === "image.generate").length,
      throughput: "5.4/min",
      avgWait: "1m 20s",
      status: "Healthy",
      failed: deadLetter.filter((j) => j.type === "image.generate").length,
    },
    {
      id: "audio-generation",
      name: "Audio Generation",
      depth: queue.filter((j) => j.type === "audio.generate").length,
      throughput: "0.8/min",
      avgWait: "2m",
      status: "Degraded",
      failed: deadLetter.filter((j) => j.type === "audio.generate").length,
    },
    {
      id: "script-generation",
      name: "Script Generation",
      depth: queue.filter((j) => j.type === "text.generate").length,
      throughput: "0/min",
      avgWait: "—",
      status: "Idle",
      failed: deadLetter.filter((j) => j.type === "text.generate").length,
    },
    {
      id: "media-processing",
      name: "Media Processing",
      depth: queue.filter((j) => j.type === "media.process").length,
      throughput: "3.2/min",
      avgWait: "1m 10s",
      status: "Healthy",
      failed: deadLetter.filter((j) => j.type === "media.process").length,
    },
  ];

  return NextResponse.json({ queues, stats });
}