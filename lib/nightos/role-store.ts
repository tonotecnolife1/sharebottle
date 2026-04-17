"use client";

import {
  CAST_PERSONA_STORAGE_KEY,
  ROLE_STORAGE_KEY,
  VENUE_TYPE_STORAGE_KEY,
  type VenueType,
} from "./constants";

/** キャストアプリ内の人格。"cast" = あかり、"leader" = ゆき（リーダー） */
export type CastPersona = "cast" | "leader";

export type NightosRole = "store" | "cast" | "customer";

/**
 * Read the currently-selected role from localStorage. Returns null on the
 * server (during SSR) or when no role is set.
 */
export function getRole(): NightosRole | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ROLE_STORAGE_KEY);
  if (raw === "store" || raw === "cast" || raw === "customer") return raw;
  // Migrate legacy "mama" sessions → store role + leader persona
  if (raw === "mama") {
    window.localStorage.setItem(ROLE_STORAGE_KEY, "cast");
    window.localStorage.setItem(CAST_PERSONA_STORAGE_KEY, "leader");
    return "cast";
  }
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

// ── Cast persona ──

export function getCastPersona(): CastPersona {
  if (typeof window === "undefined") return "cast";
  const raw = window.localStorage.getItem(CAST_PERSONA_STORAGE_KEY);
  return raw === "leader" ? "leader" : "cast";
}

export function setCastPersona(persona: CastPersona): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CAST_PERSONA_STORAGE_KEY, persona);
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
