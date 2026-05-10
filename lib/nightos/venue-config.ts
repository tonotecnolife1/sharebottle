import type { VenueType } from "./constants";

/**
 * Per-venue feature flags and UI labels.
 * All venue-specific decisions flow through this config so that
 * conditional logic never needs to be scattered across components.
 */
export interface VenueConfig {
  venueType: VenueType;

  features: {
    /** 同伴トラッキング — club のみ */
    douhan: boolean;
    /** クラブロール階層 (ママ/お姉さん/キャスト) — club のみ */
    clubRoleHierarchy: boolean;
    /** 担当制 — club のみ */
    managerAssignment: boolean;
    /** 指名管理・フリー→指名転換 — cabaret のみ */
    nomination: boolean;
    /** フリー入店のトラッキング — cabaret のみ */
    freeVisitTracking: boolean;
  };

  labels: {
    /** キャスト呼称 */
    castRole: string;
    /** 上位キャスト呼称 */
    seniorRole: string;
    /** 最上位ロール呼称 */
    topRole: string;
    /** 顧客との関係性ラベル */
    customerRelation: string;
    /** 主要KPIラベル */
    primaryKpi: string;
    /** チームページラベル */
    teamLabel: string;
  };
}

const CLUB_CONFIG: VenueConfig = {
  venueType: "club",
  features: {
    douhan: true,
    clubRoleHierarchy: true,
    managerAssignment: true,
    nomination: false,
    freeVisitTracking: false,
  },
  labels: {
    castRole: "キャスト",
    seniorRole: "お姉さん",
    topRole: "ママ",
    customerRelation: "担当",
    primaryKpi: "同伴数",
    teamLabel: "メンバー管理",
  },
};

const CABARET_CONFIG: VenueConfig = {
  venueType: "cabaret",
  features: {
    douhan: false,
    clubRoleHierarchy: false,
    managerAssignment: false,
    nomination: true,
    freeVisitTracking: true,
  },
  labels: {
    castRole: "キャスト",
    seniorRole: "先輩キャスト",
    topRole: "オーナー",
    customerRelation: "指名",
    primaryKpi: "指名本数",
    teamLabel: "チーム",
  },
};

export function getVenueConfig(type: VenueType): VenueConfig {
  return type === "club" ? CLUB_CONFIG : CABARET_CONFIG;
}
