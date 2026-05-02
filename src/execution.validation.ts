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

export const ExecutionStepRequestSchema = z.object({
  stepId: z.string().uuid(),
  orderIndex: z.number().int().positive(),
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

export const ExecutionStartRequestSchema = z.object({
  executionId: z.string().uuid(),
  workflowId: z.string().uuid(),
  workflowVersionId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  workflowName: z.string().min(1),
  workflowDescription: nullableString,
  environmentName: z.string().min(1),
  webBaseUrl: z.string().url(),
  apiBaseUrl: z.string().url().nullable().optional().transform((value) => value ?? null),
  steps: z.array(ExecutionStepRequestSchema).default([]),
});
