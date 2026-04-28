export const parseRecordingSteps = (script) => {
    const statements = script
        .split("\n")
        .map((raw, index) => ({
        lineNumber: index + 1,
        trimmed: raw.trim(),
    }))
        .filter(({ trimmed }) => isWorkflowStatement(trimmed));
    return statements.map((statement) => parseStatement(statement));
};
const isWorkflowStatement = (statement) => {
    if (!statement) {
        return false;
    }
    return !(statement.startsWith("import ") ||
        statement.startsWith("test(") ||
        statement === "});" ||
        statement === "}" ||
        statement === ");");
};
const parseStatement = (statement) => parseGoto(statement) ??
    parseLocatorAction(statement) ??
    parseExpectation(statement) ??
    parseWait(statement) ??
    createStep(statement, "WAIT", {
        value: statement.trimmed,
        meta: { unsupportedCode: true },
    });
const parseGoto = (statement) => {
    const match = statement.trimmed.match(/^await\s+page\.goto\((['"`])(.+?)\1\);?$/);
    if (!match) {
        return null;
    }
    return createStep(statement, "NAVIGATE", {
        value: match[2],
    });
};
const parseLocatorAction = (statement) => {
    const match = statement.trimmed.match(/^await\s+(.+)\.(click|fill|hover|press|check|uncheck)\((.*)\);?$/);
    if (!match) {
        return null;
    }
    const locator = parseLocator(match[1]);
    const originalAction = match[2];
    const rawArgs = match[3].trim();
    const quotedValue = readQuotedValue(rawArgs);
    if (originalAction === "fill" || originalAction === "press") {
        return createStep(statement, "FILL", {
            selector: locator?.selector,
            value: quotedValue ?? rawArgs,
            meta: {
                locator,
                originalAction,
            },
        });
    }
    if (originalAction === "check" || originalAction === "uncheck") {
        return createStep(statement, "FILL", {
            selector: locator?.selector,
            value: originalAction === "check" ? "true" : "false",
            meta: {
                locator,
                originalAction,
            },
        });
    }
    return createStep(statement, "CLICK", {
        selector: locator?.selector,
        meta: {
            locator,
            originalAction,
        },
    });
};
const parseExpectation = (statement) => {
    const match = statement.trimmed.match(/^await\s+expect\((.+)\)\.(.+);?$/);
    if (!match) {
        return null;
    }
    const locator = parseLocator(match[1]);
    return createStep(statement, "ASSERT_TEXT", {
        selector: locator?.selector,
        expectedValue: match[2],
        meta: {
            locator,
        },
    });
};
const parseWait = (statement) => {
    const match = statement.trimmed.match(/^await\s+page\.(waitFor.+)\((.*)\);?$/);
    if (!match) {
        return null;
    }
    return createStep(statement, "WAIT", {
        value: `${match[1]}(${match[2]})`,
    });
};
const createStep = (statement, action, data) => ({
    action,
    source: "RECORDED",
    selector: data.selector,
    value: data.value,
    expectedValue: data.expectedValue,
    optional: data.optional,
    timeoutMs: data.timeoutMs,
    retryCount: data.retryCount,
    meta: {
        sourceLine: statement.lineNumber,
        code: statement.trimmed,
        ...data.meta,
    },
});
const parseLocator = (expression) => {
    const testIdMatch = expression.match(/\.getByTestId\((['"`])(.+?)\1\)/);
    if (testIdMatch) {
        return {
            strategy: "testId",
            value: testIdMatch[2],
            selector: `[data-testid="${escapeSelectorValue(testIdMatch[2])}"]`,
        };
    }
    const textMatch = expression.match(/\.getByText\((['"`])(.+?)\1\)/);
    if (textMatch) {
        return {
            strategy: "text",
            value: textMatch[2],
            selector: `text=${textMatch[2]}`,
        };
    }
    const roleMatch = expression.match(/\.getByRole\((['"`])(.+?)\1(.*)\)/);
    if (roleMatch) {
        const role = roleMatch[2];
        const name = readNamedOption(roleMatch[3], "name");
        const selector = name ? `role=${role}[name="${name}"]` : `role=${role}`;
        return {
            strategy: "role",
            value: name ?? role,
            selector,
        };
    }
    const locatorMatch = expression.match(/\.locator\((['"`])(.+?)\1\)/);
    if (locatorMatch) {
        return {
            strategy: "locator",
            value: locatorMatch[2],
            selector: locatorMatch[2],
        };
    }
    return undefined;
};
const readQuotedValue = (rawArgs) => {
    const match = rawArgs.match(/(['"`])(.+?)\1/);
    return match?.[2];
};
const readNamedOption = (rawArgs, key) => {
    const pattern = new RegExp(`${key}:\\s*(['"\`])(.+?)\\1`);
    const match = rawArgs.match(pattern);
    return match?.[2];
};
const escapeSelectorValue = (value) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
