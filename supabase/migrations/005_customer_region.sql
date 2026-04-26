-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS customer region (005)
-- ───────────────────────────────────────────────────────────────
-- Adds the customer's "普段の活動エリア" (usual activity prefecture)
-- so さくらママ AI can reason about climate / season when suggesting
-- conversation topics or follow-up timing.
-- ═══════════════════════════════════════════════════════════════

alter table customers add column if not exists region text;
