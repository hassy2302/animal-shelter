"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [noticeNo, setNoticeNo] = useState("");
  const [state, setState] = useState("입양완료");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [overrides, setOverrides] = useState<Record<string, string> | null>(null);

  const headers = { "Content-Type": "application/json", "X-Admin-Key": key };

  async function handleLogin() {
    setAuthError(false);
    try {
      const res = await fetch(`${API_BASE}/api/admin/overrides`, { headers });
      if (res.ok) {
        const data = await res.json();
        setOverrides(data);
        setAuthed(true);
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    }
  }

  async function handleSet() {
    if (!noticeNo.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/override`, {
        method: "POST",
        headers,
        body: JSON.stringify({ notice_no: noticeNo.trim(), process_state: state }),
      });
      if (res.ok) {
        setMsg({ type: "ok", text: `${noticeNo} → ${state} 처리 완료` });
        setNoticeNo("");
        await refreshList();
      } else {
        setMsg({ type: "err", text: "처리 실패" });
      }
    } catch {
      setMsg({ type: "err", text: "네트워크 오류" });
    }
    setLoading(false);
  }

  async function handleDelete(no: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/override/${encodeURIComponent(no)}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setMsg({ type: "ok", text: `${no} 오버라이드 제거됨` });
        await refreshList();
      } else {
        setMsg({ type: "err", text: "제거 실패" });
      }
    } catch {
      setMsg({ type: "err", text: "네트워크 오류" });
    }
    setLoading(false);
  }

  async function refreshList() {
    const res = await fetch(`${API_BASE}/api/admin/overrides`, { headers });
    if (res.ok) setOverrides(await res.json());
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="bg-white dark:bg-[#292524] border border-[var(--border)] rounded-2xl p-8 w-full max-w-sm shadow-sm">
          <h1 className="text-xl font-extrabold text-[var(--text)] mb-6">🔒 관리자</h1>
          <input
            type="password"
            placeholder="관리자 키 입력"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm bg-[var(--bg)] text-[var(--text)] outline-none focus:border-brand-400 mb-3"
          />
          {authError && <p className="text-xs text-red-500 mb-3">키가 올바르지 않습니다</p>}
          <button
            onClick={handleLogin}
            className="w-full py-2.5 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors"
          >
            로그인
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)]">🐾 입양 상태 관리</h1>
        <Link href="/" className="text-sm text-brand-500 hover:text-brand-600 font-semibold transition-colors">← 서비스로 돌아가기</Link>
      </div>

      {/* 처리 폼 */}
      <div className="bg-white dark:bg-[#292524] border border-[var(--border)] rounded-2xl p-5 mb-6 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--muted)] mb-3">상태 오버라이드</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="공고 번호"
            value={noticeNo}
            onChange={(e) => setNoticeNo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSet()}
            className="flex-1 border border-[var(--border)] rounded-xl px-4 py-2 text-sm bg-[var(--bg)] text-[var(--text)] outline-none focus:border-brand-400"
          />
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border border-[var(--border)] rounded-xl px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] outline-none"
          >
            <option value="입양완료">입양완료</option>
            <option value="보호중">보호중</option>
          </select>
          <button
            onClick={handleSet}
            disabled={loading || !noticeNo.trim()}
            className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            적용
          </button>
        </div>
        {msg && (
          <p className={`text-xs font-semibold ${msg.type === "ok" ? "text-green-600" : "text-red-500"}`}>
            {msg.text}
          </p>
        )}
      </div>

      {/* 오버라이드 목록 */}
      <div className="bg-white dark:bg-[#292524] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--muted)] mb-3">
          현재 오버라이드 목록 ({Object.keys(overrides ?? {}).length}건)
        </h2>
        {overrides && Object.keys(overrides).length === 0 && (
          <p className="text-sm text-[var(--muted)]">오버라이드 없음</p>
        )}
        <div className="flex flex-col gap-2">
          {overrides && Object.entries(overrides).map(([no, ps]) => (
            <div key={no} className="flex items-center justify-between gap-2 bg-[#F8F7F5] dark:bg-[#3D3935] rounded-xl px-4 py-2.5">
              <div>
                <span className="text-xs font-mono text-[var(--text)]">{no}</span>
                <span className="ml-2 text-xs font-bold text-brand-500">{ps}</span>
              </div>
              <button
                onClick={() => handleDelete(no)}
                disabled={loading}
                className="text-xs text-red-400 hover:text-red-600 font-bold disabled:opacity-50 transition-colors"
              >
                제거
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
