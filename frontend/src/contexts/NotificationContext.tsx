"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export const NOTIFICATION_CATEGORIES = [
  { id: "🐹 햄스터", label: "🐹 햄스터" },
  { id: "설치류", label: "설치류 (래트·기니피그 등)" },
  { id: "🐰 토끼", label: "🐰 토끼" },
  { id: "🐱 고양이", label: "🐱 고양이" },
  { id: "🐶 강아지", label: "🐶 강아지" },
  { id: "🐢 거북이", label: "🐢 거북이" },
  { id: "🦔 고슴도치", label: "🦔 고슴도치" },
  { id: "🐦 새", label: "🐦 새" },
  { id: "기타", label: "기타" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface NotificationContextValue {
  isNative: boolean;
  isEnabled: boolean;
  categories: string[];
  isLoading: boolean;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  updateCategories: (cats: string[]) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  isNative: false,
  isEnabled: false,
  categories: [],
  isLoading: false,
  enable: async () => {},
  disable: async () => {},
  updateCategories: async () => {},
});

const STORAGE_KEY = "notification_prefs";

interface StoredPrefs {
  enabled: boolean;
  token: string;
  categories: string[];
}

function loadPrefs(): StoredPrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePrefs(prefs: StoredPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

function removePrefs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

async function postJson(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} 실패: ${res.status}`);
}

async function putJson(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} 실패: ${res.status}`);
}

async function deleteJson(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} 실패: ${res.status}`);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isNative, setIsNative] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const tokenRef = useRef<string>("");

  // Capacitor 환경 감지 및 초기화
  useEffect(() => {
    const cap = (window as any)?.Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    setIsNative(true);

    const prefs = loadPrefs();
    if (prefs?.enabled && prefs.token) {
      tokenRef.current = prefs.token;
      setIsEnabled(true);
      setCategories(prefs.categories ?? []);
    }
  }, []);

  const getToken = useCallback(async (): Promise<string> => {
    const cap = (window as any)?.Capacitor;
    const PushNotifications = cap?.Plugins?.PushNotifications;
    if (!PushNotifications) throw new Error("PushNotifications 플러그인 없음");

    // 권한 요청
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") throw new Error("알림 권한 거부됨");

    // 토큰 발급
    await PushNotifications.register();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("FCM 토큰 발급 시간 초과")), 10000);

      PushNotifications.addListener("registration", (token: { value: string }) => {
        clearTimeout(timer);
        resolve(token.value);
      });

      PushNotifications.addListener("registrationError", (err: unknown) => {
        clearTimeout(timer);
        reject(new Error(`FCM 등록 실패: ${err}`));
      });
    });
  }, []);

  const enable = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await postJson("/api/notifications/register", { token, categories: [] });
      tokenRef.current = token;
      setIsEnabled(true);
      setCategories([]);
      savePrefs({ enabled: true, token, categories: [] });
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  const disable = useCallback(async () => {
    setIsLoading(true);
    try {
      if (tokenRef.current) {
        await deleteJson("/api/notifications/unregister", { token: tokenRef.current });
      }
      tokenRef.current = "";
      setIsEnabled(false);
      setCategories([]);
      removePrefs();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategories = useCallback(async (cats: string[]) => {
    if (!tokenRef.current) return;
    setIsLoading(true);
    try {
      await putJson("/api/notifications/preferences", { token: tokenRef.current, categories: cats });
      setCategories(cats);
      const prefs = loadPrefs();
      if (prefs) savePrefs({ ...prefs, categories: cats });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ isNative, isEnabled, categories, isLoading, enable, disable, updateCategories }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
