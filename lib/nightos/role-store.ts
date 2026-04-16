"use client";

import { ROLE_STORAGE_KEY, VENUE_TYPE_STORAGE_KEY, type VenueType, type ClubRole } from "./constants";

export type NightosRole = "store" | "cast" | "customer" | "mama";

const CLUB_ROLE_KEY = "nightos.club-role";

/**
 * Read the currently-selected role from localStorage. Returns null on the
 * server (during SSR) or when no role is set.
 */
export function getRole(): NightosRole | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ROLE_STORAGE_KEY);
  if (raw === "store" || raw === "cast" || raw === "customer" || raw === "mama") return raw;
  return null;
}

export function setRole(role: NightosRole): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function clearRole(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ROLE_STORAGE_KEY);
}

// ── Venue type ──

export function getVenueType(): VenueType {
  if (typeof window === "undefined") return "club";
  const raw = window.localStorage.getItem(VENUE_TYPE_STORAGE_KEY);
  if (raw === "club" || raw === "cabaret") return raw;
  return "club";
}

export function setVenueType(type: VenueType): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VENUE_TYPE_STORAGE_KEY, type);
}

// ── Club role hierarchy ──

export function getClubRole(): ClubRole {
  if (typeof window === "undefined") return "help";
  const raw = window.localStorage.getItem(CLUB_ROLE_KEY);
  if (raw === "mama" || raw === "oneesan" || raw === "help") return raw;
  return "help";
}

export function setClubRole(role: ClubRole): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLUB_ROLE_KEY, role);
}
