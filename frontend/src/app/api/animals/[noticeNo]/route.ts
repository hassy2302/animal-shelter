import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ noticeNo: string }> }
) {
  const { noticeNo } = await params;
  const res = await fetch(
    `${API_BASE}/api/animals/by-notice/${encodeURIComponent(noticeNo)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "동물을 찾을 수 없습니다" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
