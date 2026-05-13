import { z } from "zod";
const nullableString = z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null);
const StepActionSchema = z.enum([
    "CLICK",
    "FILL",
    "NAVIGATE",
    "WAIT",
    "ASSERT_TEXT",
    "ASSERT_API",
]);
const StepSourceSchema = z.enum(["RECORDED", "MANUAL", "MIXED"]);
const DiscoveryStepRequestSchema = z.object({
    stepId: z.string().uuid(),
    orderIndex: z.number().int(),
    action: StepActionSchema,
    source: StepSourceSchema,
    selector: nullableString,
    value: nullableString,
    expectedValue: nullableString,
    meta: z.record(z.string(), z.unknown()).default({}),
    optional: z.boolean().default(false),
    timeoutMs: z.number().int().positive().nullable().optional().transform((value) => value ?? null),
    retryCount: z.number().int().min(0).default(0),
});
export const DiscoveryStartRequestSchema = z.object({
    versionId: z.string().uuid(),
    webBaseUrl: z.string().url(),
    apiBaseUrl: z.string().url().nullable().optional().transform((value) => value ?? null),
    steps: z.array(DiscoveryStepRequestSchema).default([]),
});
