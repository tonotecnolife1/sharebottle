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

// Team chat room messages ─ CRUD payloads ───────────────────────────

const roomId = z.string().min(1).max(64);

export const teamChatCreateSchema = z.object({
  roomId,
  content: shortText,
  threadParentId: z.string().min(1).max(64).optional(),
});

export const teamChatUpdateSchema = z.object({
  content: shortText,
});

// Signup / onboarding ─────────────────────────────────────────────

const displayName = z
  .string()
  .min(1, "名前を入力してください")
  .max(40, "40文字以内で入力してください");

export const signupSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません").max(200),
  password: z.string().min(8, "パスワードは8文字以上").max(200),
  name: displayName,
});

/**
 * Account-level role chosen at onboarding (migration 008).
 *
 * - `cast`        : creates a nightos_casts row with user_role=cast
 * - `store_staff` : creates a nightos_casts row with user_role=store_staff
 * - `store_owner` : creates a new nightos_stores + nightos_casts (owner)
 * - `customer`    : creates a customers row linked by auth_user_id
 */
export const accountRoleSchema = z.enum([
  "cast",
  "store_staff",
  "store_owner",
  "customer",
]);
export type AccountRole = z.infer<typeof accountRoleSchema>;

/**
 * Invite code shape: 8 chars, A-Z2-9 (no 0/O/1/I/L). The form normalises
 * (uppercase + strip whitespace/hyphens) before validating.
 */
const inviteCode = z
  .string()
  .regex(/^[A-Z2-9]{8}$/, "招待コードは8文字（A-Z2-9）です");

/**
 * Onboarding payload — discriminated by `role`.
 * Each branch has its own required fields.
 */
export const onboardingSchema = z.discriminatedUnion("role", [
  // Owner: brand-new store + own profile
  z.object({
    role: z.literal("store_owner"),
    name: displayName,
    venueType: z.enum(["club", "cabaret"]),
    newStoreName: z.string().min(1, "店舗名を入力してください").max(80),
  }),
  // Cast: join an existing store via invite code, club_role required
  z.object({
    role: z.literal("cast"),
    name: displayName,
    inviteCode,
    clubRole: z.enum(["mama", "oneesan", "help"]),
  }),
  // Store staff: join via invite code, no club_role
  z.object({
    role: z.literal("store_staff"),
    name: displayName,
    inviteCode,
  }),
  // Customer: just a display name; no store binding at signup time
  z.object({
    role: z.literal("customer"),
    name: displayName,
  }),
]);

export type OnboardingInput = z.infer<typeof onboardingSchema>;

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
