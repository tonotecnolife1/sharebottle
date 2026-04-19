import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Shared Zod schemas for API route inputs.
 *
 * Centralized so limits and patterns stay consistent across endpoints.
 */

// ═══════════════ Primitives ═══════════════

const castId = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "invalid cast id");

const customerId = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "invalid customer id");

/** Data URL for a base64-encoded image (jpeg/png/webp/gif). Capped at ~6MB of base64. */
const imageDataUrl = z
  .string()
  .min(20)
  .max(8_000_000)
  .regex(
    /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/,
    "invalid image data url",
  );

const shortText = z.string().min(1).max(4000);
const longText = z.string().min(1).max(10_000);

// ═══════════════ Chat types ═══════════════

const chatRole = z.enum(["user", "assistant"]);

const chatMessage = z.object({
  role: chatRole,
  content: z.string().max(20_000),
  images: z.array(imageDataUrl).max(4).optional(),
});

// ═══════════════ Per-route schemas ═══════════════

export const ruriMamaSchema = z.object({
  messages: z.array(chatMessage).min(1).max(40),
  customerId: customerId.optional(),
  hearingContext: z.record(z.string(), z.string().max(200)).optional(),
  castId,
  intent: z.enum(["follow", "serving", "strategy", "freeform"]),
  refineStep: z.enum(["apply"]).optional(),
  previousReply: z.string().max(20_000).optional(),
  refinementDirection: z.string().max(500).optional(),
  recentFeedback: z
    .object({
      helpful: z.array(z.string().max(500)).max(20),
      notHelpful: z.array(z.string().max(500)).max(20),
    })
    .optional(),
});

export const extractMemoSchema = z.object({
  imageBase64: imageDataUrl,
  customerId,
  castId,
});

export const extractBusinessCardSchema = z.object({
  imageBase64: imageDataUrl,
});

export const chatAiSchema = z.object({
  message: shortText,
  roomId: z.string().min(1).max(64),
  castId,
});

export const generateTemplateSchema = z.object({
  customerId,
  castId,
  category: z.enum(["thanks", "invite", "birthday", "seasonal"]),
});

export const suggestBottleSchema = z.object({
  customerId,
  castId,
});

// ═══════════════ Helper ═══════════════

/**
 * Parse & validate a JSON body against a Zod schema.
 * Returns the typed result or an error Response. Usage:
 *
 *   const parsed = await parseBody(req, schema);
 *   if (parsed instanceof NextResponse) return parsed;
 *   // parsed is now the typed, validated body
 */
export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<z.infer<T> | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    // Surface only the first issue path + code, not the full value (PII safety)
    const first = result.error.issues[0];
    return NextResponse.json(
      {
        error: "invalid_request",
        field: first?.path.join("."),
        code: first?.code,
      },
      { status: 400 },
    );
  }

  return result.data;
}
