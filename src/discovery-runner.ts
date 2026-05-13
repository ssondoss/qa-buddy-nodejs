import { chromium, type Page, type Response, type Locator } from "playwright";
import { config } from "./config.js";
import type {
  DiscoveredApiEntry,
  DiscoveryRunResponse,
  DiscoveryStartRequest,
  DiscoveryStepRequest,
  DiscoveryStepResult,
} from "./contracts/discovery.contract.js";

const API_RESOURCE_TYPES = new Set(["fetch", "xhr"]);

export const runDiscovery = async (
  request: DiscoveryStartRequest
): Promise<DiscoveryRunResponse> => {
  const orderedSteps = [...request.steps].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  const browser = await chromium.launch({ headless: config.executionHeadless });
  const context = await browser.newContext({ baseURL: request.webBaseUrl });
  const page = await context.newPage();
  const stepResults: DiscoveryStepResult[] = [];

  try {
    for (const step of orderedSteps) {
      if (isAssertionStep(step)) {
        stepResults.push({ stepId: step.stepId, apis: [] });
        continue;
      }

      const pendingResponses: Response[] = [];

      const responseListener = (response: Response) => {
        if (API_RESOURCE_TYPES.has(response.request().resourceType())) {
          pendingResponses.push(response);
        }
      };

      page.on("response", responseListener);

      try {
        await runStepAction(page, step, request.webBaseUrl);
        await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
      } catch {
        // continue to next step even if one fails
      }

      page.off("response", responseListener);

      const capturedApis: DiscoveredApiEntry[] = await Promise.all(
        pendingResponses.map(async (response) => ({
          url: response.url(),
          method: response.request().method(),
          requestBody: response.request().postData() ?? null,
          responseStatus: response.status(),
          responseBody: await response.text().catch(() => null),
        }))
      );

      stepResults.push({ stepId: step.stepId, apis: capturedApis });
    }
  } finally {
    await browser.close().catch(() => {});
  }

  return { stepResults };
};

const isAssertionStep = (step: DiscoveryStepRequest) =>
  step.action === "ASSERT_TEXT" || step.action === "ASSERT_API";

const runStepAction = async (
  page: Page,
  step: DiscoveryStepRequest,
  webBaseUrl: string
) => {
  const timeout = step.timeoutMs ?? 10_000;

  switch (step.action) {
    case "NAVIGATE": {
      const target = resolveUrl(step.value ?? step.selector, webBaseUrl);
      await page.goto(target, { waitUntil: "domcontentloaded", timeout });
      return;
    }
    case "CLICK": {
      const selector = requireSelector(step);
      await buildLocator(page, selector).click({ timeout });
      return;
    }
    case "FILL": {
      const selector = requireSelector(step);
      await buildLocator(page, selector).fill(step.value ?? "", { timeout });
      return;
    }
    case "WAIT": {
      if (step.selector) {
        await buildLocator(page, step.selector).waitFor({ state: "visible", timeout });
      } else {
        const waitMs = parsePositiveNumber(step.value) ?? timeout;
        await page.waitForTimeout(waitMs);
      }
      return;
    }
  }
};

const requireSelector = (step: DiscoveryStepRequest): string => {
  if (!step.selector) {
    throw new Error(`selector is required for ${step.action} step ${step.orderIndex}`);
  }
  return step.selector;
};

const buildLocator = (base: Page | Locator, selector: string): Locator => {
  const parts = selector.split(" >> ");
  let locator: Locator | null = null;

  for (const raw of parts) {
    const part = raw.trim();
    const parent: Page | Locator = locator ?? base;

    const nthMatch = part.match(/^nth=(-?\d+)$/);
    if (nthMatch && locator) {
      locator = locator.nth(parseInt(nthMatch[1]));
      continue;
    }

    const roleMatch = part.match(/^role=(\w+)(?:\[name="([^"]+)"\])?(?:\[exact="(true|false)"\])?$/);
    if (roleMatch) {
      const role = roleMatch[1] as Parameters<typeof parent.getByRole>[0];
      const name = roleMatch[2];
      const exact = roleMatch[3] === "true";
      locator = name ? parent.getByRole(role, { name, exact }) : parent.getByRole(role);
      continue;
    }

    const hasTextMatch = part.match(/^(.+):has-text\("(.+?)"\)$/);
    if (hasTextMatch) {
      locator = parent.locator(hasTextMatch[1]).filter({ hasText: hasTextMatch[2] });
      continue;
    }

    const testIdMatch = part.match(/^\[data-testid="(.+?)"\]$/);
    if (testIdMatch) {
      locator = parent.getByTestId(testIdMatch[1]);
      continue;
    }

    const textMatch = part.match(/^text=(.+)$/);
    if (textMatch) {
      locator = parent.getByText(textMatch[1]);
      continue;
    }

    const labelMatch = part.match(/^\[aria-label="(.+?)"\]$/);
    if (labelMatch) {
      locator = parent.getByLabel(labelMatch[1]);
      continue;
    }

    const placeholderMatch = part.match(/^\[placeholder="(.+?)"\]$/);
    if (placeholderMatch) {
      locator = parent.getByPlaceholder(placeholderMatch[1]);
      continue;
    }

    locator = parent.locator(part);
  }

  return locator ?? base.locator(selector);
};

const resolveUrl = (value: string | null | undefined, baseUrl: string) =>
  new URL(value || "", baseUrl).toString();

const parsePositiveNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }
  return undefined;
};