export type PortalRole = "fti" | "lpk" | "ys";

const STORAGE_KEY = "flora_active_portal";

export function setActivePortal(role: PortalRole) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, role);
}

export function getActivePortal(): PortalRole | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(STORAGE_KEY);
  if (v === "fti" || v === "lpk" || v === "ys") return v;
  return null;
}

/** Admin FTI — boleh unduh CV, KTP, KK, MCU, dll. */
export function isFtiAdmin(): boolean {
  return getActivePortal() === "fti";
}
