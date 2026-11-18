const KEY = "flora_staff_unlock";

export const STAFF_PORTALS = ["/dokumen"] as const;

export type StaffPortal = (typeof STAFF_PORTALS)[number];

export function isStaffPortal(path: string): path is StaffPortal {
  return (STAFF_PORTALS as readonly string[]).includes(path);
}

export function unlockStaffPortal(path: StaffPortal) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, path);
}

export function clearStaffUnlock() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

export function staffPortalUnlocked(path: StaffPortal): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEY) === path;
}
