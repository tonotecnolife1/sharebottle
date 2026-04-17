"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCastId } from "@/lib/nightos/auth";
import {
  deleteScreenshot,
  getCustomerContext,
  saveScreenshot,
  updateCastMemo,
  type CastMemoInput,
} from "@/lib/nightos/supabase-queries";
import type {
  LineScreenshot,
  MemoExtractionResult,
} from "@/types/nightos";

export async function updateCastMemoAction(args: {
  customerId: string;
  input: CastMemoInput;
}) {
  const castId = await getCurrentCastId();
  const memo = await updateCastMemo({
    castId,
    customerId: args.customerId,
    input: args.input,
  });
  // Invalidate the customer card and home screens so updated values show up.
  revalidatePath(`/cast/customers/${args.customerId}`);
  revalidatePath("/cast/home");
  return { ok: true as const, memo };
}

export type MemoFieldKey = "last_topic" | "service_tips" | "next_topics";

/**
 * Apply selected fields from a vision-extracted memo update.
 *
 * Loads the current memo, replaces only the picked fields with the
 * extracted values, then saves both the updated memo and a record of
 * the screenshot in the history.
 */
export async function applyMemoUpdateAction(args: {
  customerId: string;
  imageData: string;
  mediaType: string;
  extraction: MemoExtractionResult;
  fieldsToApply: MemoFieldKey[];
}) {
  const castId = await getCurrentCastId();
  const context = await getCustomerContext(castId, args.customerId);
  const currentMemo = context?.memo;

  const pick = (key: MemoFieldKey, fallback: string | null) =>
    args.fieldsToApply.includes(key) ? args.extraction[key] : fallback;

  const input: CastMemoInput = {
    last_topic: pick("last_topic", currentMemo?.last_topic ?? null),
    service_tips: pick("service_tips", currentMemo?.service_tips ?? null),
    next_topics: pick("next_topics", currentMemo?.next_topics ?? null),
  };

  const memo = await updateCastMemo({
    castId,
    customerId: args.customerId,
    input,
  });

  // Record the screenshot in history regardless of which fields were applied,
  // so the cast can revisit it later.
  const screenshot: LineScreenshot = await saveScreenshot({
    customerId: args.customerId,
    castId,
    imageData: args.imageData,
    mediaType: args.mediaType,
    extracted: args.extraction,
    appliedFields: args.fieldsToApply,
  });

  revalidatePath(`/cast/customers/${args.customerId}`);
  revalidatePath("/cast/home");
  return { ok: true as const, memo, screenshot };
}

export async function deleteScreenshotAction(args: {
  id: string;
  customerId: string;
}) {
  await deleteScreenshot(args.id);
  revalidatePath(`/cast/customers/${args.customerId}`);
  return { ok: true as const };
}
