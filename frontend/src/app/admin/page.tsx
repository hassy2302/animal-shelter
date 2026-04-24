"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const SESSION_KEY = "admin_session";
const SESSION_TTL = 10 * 60 * 1000; // 10분

function saveSession(k: string) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ key: k, expiresAt: Date.now() + SESSION_TTL }));
}

function loadSession(): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { key: k, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { sessionStorage.removeItem(SESSION_KEY); return null; }
    return k;
  } catch { return null; }
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [noticeNo, setNoticeNo] = useState("");
  const [state, setState] = useState("입양완료");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [overrides, setOverrides] = useState<Record<string, string> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;
    setKey(saved);
    fetch(`${API_BASE}/api/admin/overrides`, { headers: { "Content-Type": "application/json", "X-Admin-Key": saved } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) { setOverrides(data); setAuthed(true); } else { sessionStorage.removeItem(SESSION_KEY); } })
      .catch(() => sessionStorage.removeItem(SESSION_KEY));
  }, []);

  function copyNoticeNo(no: string) {
    navigator.clipboard.writeText(no);
    setCopied(no);
    setTimeout(() => setCopied(null), 1500);
  }

  const headers = { "Content-Type": "application/json", "X-Admin-Key": key };

  async function handleLogin() {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/overrides`, { headers });
      if (res.ok) {
        const data = await res.json();
        saveSession(key);
        setOverrides(data);
        setAuthed(true);
      } else if (res.status === 429) {
        setAuthError("너무 많은 실패 시도입니다. 10분 후 다시 시도해주세요.");
      } else {
        setAuthError("키가 올바르지 않습니다.");
      }
    } catch {
      setAuthError("서버에 연결할 수 없어요.");
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
        setMsg({ type: "err", text: res.status >= 500 ? "서버 오류가 발생했어요. 잠시 후 다시 시도해주세요." : res.status === 401 ? "인증 키가 올바르지 않아요." : `처리 실패 (${res.status})` });
      }
    } catch {
      setMsg({ type: "err", text: navigator.onLine ? "서버에 연결할 수 없어요." : "인터넷 연결을 확인해주세요." });
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
        setMsg({ type: "err", text: res.status >= 500 ? "서버 오류가 발생했어요. 잠시 후 다시 시도해주세요." : `제거 실패 (${res.status})` });
      }
    } catch {
      setMsg({ type: "err", text: navigator.onLine ? "서버에 연결할 수 없어요." : "인터넷 연결을 확인해주세요." });
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
          {authError && <p className="text-xs text-red-500 mb-3">{authError}</p>}
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
                <span
                  onClick={() => copyNoticeNo(no)}
                  title="클릭하여 복사"
                  className="text-xs font-mono cursor-pointer select-none transition-colors text-[var(--text)] hover:text-brand-500"
                >
                  {copied === no ? "복사됨 ✓" : no}
                </span>
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
