import { chromium } from "playwright";
import { config } from "./config.js";
export const runExecution = async (request) => {
    const startedAt = new Date();
    const log = [
        `Execution ${request.executionId} started for ${request.workflowName}`,
        `Environment: ${request.environmentName}`,
    ];
    const orderedSteps = [...request.steps].sort((left, right) => left.orderIndex - right.orderIndex);
    const stepResults = [];
    let browser = null;
    let page = null;
    let stoppedByFailure = false;
    let errorMessage = null;
    try {
        browser = await chromium.launch({ headless: config.executionHeadless });
        const context = await browser.newContext({ baseURL: request.webBaseUrl });
        page = await context.newPage();
        for (const step of orderedSteps) {
            if (stoppedByFailure) {
                stepResults.push(skipStep(step));
                continue;
            }
            const result = await runStep({ request, page }, step);
            stepResults.push(result);
            if (result.status === "FAILED" && !step.optional) {
                stoppedByFailure = true;
                errorMessage = result.errorMessage;
            }
        }
    }
    catch (error) {
        errorMessage = errorToMessage(error);
        log.push(errorMessage);
        for (const step of orderedSteps.slice(stepResults.length)) {
            stepResults.push(skipStep(step));
        }
    }
    finally {
        await browser?.close().catch((error) => {
            log.push(`Browser close failed: ${errorToMessage(error)}`);
        });
    }
    const finishedAt = new Date();
    const status = stepResults.some((result, index) => result.status === "FAILED" && !orderedSteps[index]?.optional)
        ? "FAILED"
        : errorMessage
            ? "FAILED"
            : "PASSED";
    log.push(`Execution finished with status ${status}`);
    return {
        status,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        errorMessage,
        log: log.join("\n"),
        stepResults,
    };
};
const runStep = async (context, step) => {
    const startedAt = new Date();
    const log = [`Running ${step.action} step ${step.orderIndex}`];
    let status = "PASSED";
    let errorMessage = null;
    try {
        await retry(step, log, () => runStepAction(context, step, log));
        log.push("Step passed");
    }
    catch (error) {
        status = "FAILED";
        errorMessage = errorToMessage(error);
        log.push(`Step failed: ${errorMessage}`);
    }
    const screenshotUrl = await captureAndUploadScreenshot(context, step, log);
    const finishedAt = new Date();
    return {
        stepId: step.stepId,
        orderIndex: step.orderIndex,
        status,
        errorMessage,
        screenshotUrl,
        log: log.join("\n"),
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
    };
};
const runStepAction = async ({ request, page }, step, log) => {
    const timeout = step.timeoutMs ?? 10_000;
    switch (step.action) {
        case "NAVIGATE": {
            const target = resolveUrl(step.value ?? step.selector, request.webBaseUrl);
            log.push(`Navigating to ${target}`);
            await page.goto(target, { waitUntil: "domcontentloaded", timeout });
            return;
        }
        case "CLICK": {
            const selector = requireValue(step.selector, "selector", step);
            log.push(`Clicking ${selector}`);
            await page.locator(selector).click({ timeout });
            return;
        }
        case "FILL": {
            const selector = requireValue(step.selector, "selector", step);
            log.push(`Filling ${selector}`);
            await page.locator(selector).fill(step.value ?? "", { timeout });
            return;
        }
        case "WAIT":
            await runWait(page, step, timeout, log);
            return;
        case "ASSERT_TEXT":
            await runTextAssertion(page, step, timeout, log);
            return;
        case "ASSERT_API":
            await runApiAssertion(request, step, log);
            return;
    }
};
const runWait = async (page, step, timeout, log) => {
    if (step.selector) {
        log.push(`Waiting for selector ${step.selector}`);
        await page.locator(step.selector).waitFor({ state: "visible", timeout });
        return;
    }
    const waitMs = parsePositiveNumber(step.value) ?? timeout;
    log.push(`Waiting ${waitMs}ms`);
    await page.waitForTimeout(waitMs);
};
const runTextAssertion = async (page, step, timeout, log) => {
    const expectedText = requireValue(step.expectedValue ?? step.value, "expectedValue", step);
    const text = step.selector
        ? await page.locator(step.selector).textContent({ timeout })
        : await page.locator("body").textContent({ timeout });
    log.push(`Asserting text contains ${expectedText}`);
    if (!text?.includes(expectedText)) {
        throw new Error(`Expected text "${expectedText}" was not found`);
    }
};
const runApiAssertion = async (request, step, log) => {
    const meta = step.meta ?? {};
    const method = readString(meta.method)?.toUpperCase() ?? "GET";
    const rawUrl = readString(meta.url) ??
        readString(meta.path) ??
        step.value ??
        step.selector ??
        "";
    const target = resolveUrl(rawUrl, request.apiBaseUrl ?? request.webBaseUrl);
    const headers = readStringRecord(meta.headers);
    const body = buildRequestBody(meta.body, headers);
    const response = await fetch(target, { method, headers, body });
    const responseText = await response.text();
    const expectedStatus = readNumber(meta.expectedStatus) ?? parsePositiveNumber(step.expectedValue);
    const expectedBody = readString(meta.expectedBodyContains) ??
        (expectedStatus ? null : step.expectedValue);
    log.push(`${method} ${target} -> ${response.status}`);
    if (expectedStatus !== undefined && response.status !== expectedStatus) {
        throw new Error(`Expected API status ${expectedStatus}, got ${response.status}`);
    }
    if (expectedStatus === undefined && !response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    if (expectedBody && !responseText.includes(expectedBody)) {
        throw new Error(`Expected API response to contain "${expectedBody}"`);
    }
};
const retry = async (step, log, action) => {
    const attempts = step.retryCount + 1;
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            await action();
            return;
        }
        catch (error) {
            lastError = error;
            if (attempt < attempts) {
                log.push(`Attempt ${attempt} failed, retrying`);
            }
        }
    }
    throw lastError;
};
const captureAndUploadScreenshot = async ({ request, page }, step, log) => {
    try {
        const screenshot = await page.screenshot({ fullPage: true });
        const formData = new FormData();
        formData.append("stepId", step.stepId);
        formData.append("file", new Blob([new Uint8Array(screenshot)], { type: "image/png" }), `${step.stepId}.png`);
        const response = await fetch(buildScreenshotUploadUrl(request.executionId), {
            method: "POST",
            headers: {
                [config.integrationSecretHeader]: config.executionSecret,
            },
            body: formData,
        });
        if (!response.ok) {
            log.push(`Screenshot upload failed with status ${response.status}`);
            return null;
        }
        const payload = await response.json().catch(() => null);
        const screenshotUrl = readScreenshotUrl(payload);
        log.push("Screenshot uploaded");
        return screenshotUrl;
    }
    catch (error) {
        log.push(`Screenshot capture/upload failed: ${errorToMessage(error)}`);
        return null;
    }
};
const skipStep = (step) => ({
    stepId: step.stepId,
    orderIndex: step.orderIndex,
    status: "SKIPPED",
    errorMessage: null,
    screenshotUrl: null,
    log: "Skipped because a previous non-optional step failed",
    startedAt: null,
    finishedAt: null,
    durationMs: null,
});
const buildScreenshotUploadUrl = (executionId) => {
    const encodedExecutionId = encodeURIComponent(executionId);
    const path = config.executionScreenshotPath
        .replace(":executionId", encodedExecutionId)
        .replace("{executionId}", encodedExecutionId);
    return new URL(path, config.springBaseUrl).toString();
};
const resolveUrl = (value, baseUrl) => new URL(value || "", baseUrl).toString();
const requireValue = (value, field, step) => {
    if (!value) {
        throw new Error(`${field} is required for ${step.action} step ${step.orderIndex}`);
    }
    return value;
};
const parsePositiveNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        return value;
    }
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }
    return undefined;
};
const readString = (value) => typeof value === "string" && value.trim() ? value : undefined;
const readNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : undefined;
const readStringRecord = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    return Object.fromEntries(Object.entries(value)
        .filter((entry) => typeof entry[1] === "string"));
};
const buildRequestBody = (value, headers) => {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === "string") {
        return value;
    }
    const hasContentType = Object.keys(headers).some((header) => header.toLowerCase() === "content-type");
    if (!hasContentType) {
        headers["Content-Type"] = "application/json";
    }
    return JSON.stringify(value);
};
const readScreenshotUrl = (payload) => {
    if (!payload || typeof payload !== "object") {
        return null;
    }
    const maybePayload = payload;
    if (typeof maybePayload.data?.screenshotUrl === "string") {
        return maybePayload.data.screenshotUrl;
    }
    if (typeof maybePayload.data?.url === "string") {
        return maybePayload.data.url;
    }
    if (typeof maybePayload.screenshotUrl === "string") {
        return maybePayload.screenshotUrl;
    }
    if (typeof maybePayload.url === "string") {
        return maybePayload.url;
    }
    return null;
};
const errorToMessage = (error) => error instanceof Error ? error.message : String(error);
