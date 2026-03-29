import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${API_BASE}/api/animals/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "데이터 로드 실패" }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
