import { z } from "zod";

export const draftSchema = z.object({
  version: z.literal(1),
  title: z.string().max(200),
  headerHtml: z.string().optional(),
  contentHtml: z.string(),
  footerHtml: z.string().optional(),
  settings: z.object({
    paperSize: z.enum(["a4", "letter", "legal"]),
    orientation: z.enum(["portrait", "landscape"]),
    margin: z.enum(["compact", "normal", "wide"]),
    showHeaderFooter: z.boolean().optional(),
    fontFamily: z.string().max(180),
    fontSize: z.number().min(8).max(72),
    lineHeight: z.number().min(0.8).max(3),
    textColor: z.string().regex(/^#[0-9a-f]{6}$/i),
    accentColor: z.string().regex(/^#[0-9a-f]{6}$/i),
    alignment: z.enum(["left", "center", "right"]),
  }),
  updatedAt: z.string(),
});

export type StoredDraft = z.infer<typeof draftSchema>;
