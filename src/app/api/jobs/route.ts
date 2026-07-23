import { NextResponse } from "next/server";
import { jobStore } from "@/core/jobs/job-store";
import type { Job } from "@/core/jobs/job.types";

export async function GET() {
  const jobs = jobStore.getAll();
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const job: Job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: body.type,
      payload: body.payload ?? {},
      status: "queued",
      priority: body.priority ?? "normal",
      progress: 0,
      attempts: 0,
      maxAttempts: body.maxAttempts ?? 3,
      result: undefined,
      error: undefined,
      scheduledAt: undefined,
      startedAt: undefined,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jobStore.add(job);
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}