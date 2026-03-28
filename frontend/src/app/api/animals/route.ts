import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.toString();
  const res = await fetch(`${API_BASE}/api/animals?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "데이터 로드 실패" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
