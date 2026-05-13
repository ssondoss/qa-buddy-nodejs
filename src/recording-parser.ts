import type { WorkflowStepRequest } from "./contracts/record.contract.js";

interface ScriptStatement {
  lineNumber: number;
  trimmed: string;
}

interface ParsedLocator {
  selector: string;
  strategy: string;
  value: string;
}

export const parseRecordingSteps = (script: string): WorkflowStepRequest[] => {
  const statements = script
    .split("\n")
    .map((raw, index) => ({
      lineNumber: index + 1,
      trimmed: raw.trim(),
    }))
    .filter(({ trimmed }) => isWorkflowStatement(trimmed));

  return statements.map((statement) => parseStatement(statement));
};

const isWorkflowStatement = (statement: string) => {
  if (!statement) {
    return false;
  }

  return !(
    statement.startsWith("import ") ||
    statement.startsWith("test(") ||
    statement === "});" ||
    statement === "}" ||
    statement === ");"
  );
};

const parseStatement = (statement: ScriptStatement): WorkflowStepRequest =>
  parseGoto(statement) ??
  parseLocatorAction(statement) ??
  parseExpectation(statement) ??
  parseWait(statement) ??
  createStep(statement, "WAIT", {
    value: statement.trimmed,
    meta: { unsupportedCode: true },
  });

const parseGoto = (statement: ScriptStatement): WorkflowStepRequest | null => {
  const match = statement.trimmed.match(/^await\s+page\.goto\((['"`])(.+?)\1\);?$/);

  if (!match) {
    return null;
  }

  return createStep(statement, "NAVIGATE", {
    value: match[2],
  });
};

const parseLocatorAction = (
  statement: ScriptStatement
): WorkflowStepRequest | null => {
  const match = statement.trimmed.match(
    /^await\s+(.+)\.(click|fill|hover|press|check|uncheck)\((.*)\);?$/
  );

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

const parseExpectation = (
  statement: ScriptStatement
): WorkflowStepRequest | null => {
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

const parseWait = (statement: ScriptStatement): WorkflowStepRequest | null => {
  const match = statement.trimmed.match(/^await\s+page\.(waitFor.+)\((.*)\);?$/);

  if (!match) {
    return null;
  }

  return createStep(statement, "WAIT", {
    value: `${match[1]}(${match[2]})`,
  });
};

const createStep = (
  statement: ScriptStatement,
  action: WorkflowStepRequest["action"],
  data: Partial<WorkflowStepRequest>
): WorkflowStepRequest => ({
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

interface LocatorSegment {
  value: string;
  strategy: string;
  type: "selector" | "modifier" | "position";
}

const methodToSegment = (method: string, args: string): LocatorSegment | null => {
  switch (method) {
    case "locator": {
      const m = args.match(/(['"`])(.+?)\1/);
      return m ? { value: m[2], strategy: "locator", type: "selector" } : null;
    }
    case "getByTestId": {
      const m = args.match(/(['"`])(.+?)\1/);
      return m ? { value: `[data-testid="${escapeSelectorValue(m[2])}"]`, strategy: "testId", type: "selector" } : null;
    }
    case "getByText": {
      const m = args.match(/(['"`])(.+?)\1/);
      return m ? { value: `text=${m[2]}`, strategy: "text", type: "selector" } : null;
    }
    case "getByRole": {
      const m = args.match(/(['"`])(.+?)\1(.*)/);
      if (!m) return null;
      const name = readNamedOption(m[3], "name");
      const exactMatch = m[3].match(/exact:\s*(true|false)/);
      const exact = exactMatch ? exactMatch[1] : null;
      let value = name ? `role=${m[2]}[name="${name}"]` : `role=${m[2]}`;
      if (exact !== null) value += `[exact="${exact}"]`;
      return { value, strategy: "role", type: "selector" };
    }
    case "getByLabel": {
      const m = args.match(/(['"`])(.+?)\1/);
      return m ? { value: `[aria-label="${m[2]}"]`, strategy: "label", type: "selector" } : null;
    }
    case "getByPlaceholder": {
      const m = args.match(/(['"`])(.+?)\1/);
      return m ? { value: `[placeholder="${m[2]}"]`, strategy: "placeholder", type: "selector" } : null;
    }
    case "getByAltText": {
      const m = args.match(/(['"`])(.+?)\1/);
      return m ? { value: `[alt="${m[2]}"]`, strategy: "altText", type: "selector" } : null;
    }
    case "getByTitle": {
      const m = args.match(/(['"`])(.+?)\1/);
      return m ? { value: `[title="${m[2]}"]`, strategy: "title", type: "selector" } : null;
    }
    case "filter": {
      const m = args.match(/hasText:\s*(['"`])(.+?)\1/);
      return m ? { value: `:has-text("${m[2]}")`, strategy: "filter", type: "modifier" } : null;
    }
    case "nth": {
      const m = args.match(/(\d+)/);
      return m ? { value: `nth=${m[1]}`, strategy: "nth", type: "position" } : null;
    }
    case "first":
      return { value: "nth=0", strategy: "nth", type: "position" };
    case "last":
      return { value: "nth=-1", strategy: "nth", type: "position" };
    default:
      return null;
  }
};

const parseLocator = (expression: string): ParsedLocator | undefined => {
  const selectorParts: string[] = [];
  let currentSelector: string | null = null;
  let lastStrategy = "locator";
  let lastValue = "";

  const methodRegex = /\.(\w+)\(([^)]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = methodRegex.exec(expression)) !== null) {
    const segment = methodToSegment(match[1], match[2].trim());
    if (!segment) continue;

    if (segment.type === "modifier") {
      if (currentSelector !== null) currentSelector += segment.value;
    } else if (segment.type === "position") {
      if (currentSelector !== null) {
        selectorParts.push(currentSelector);
        currentSelector = null;
      }
      selectorParts.push(segment.value);
    } else {
      if (currentSelector !== null) selectorParts.push(currentSelector);
      currentSelector = segment.value;
      lastStrategy = segment.strategy;
      lastValue = segment.value;
    }
  }

  if (currentSelector !== null) selectorParts.push(currentSelector);
  if (selectorParts.length === 0) return undefined;

  return {
    strategy: lastStrategy,
    value: lastValue,
    selector: selectorParts.join(" >> "),
  };
};

const readQuotedValue = (rawArgs: string): string | undefined => {
  const match = rawArgs.match(/(['"`])(.+?)\1/);
  return match?.[2];
};

const readNamedOption = (rawArgs: string, key: string): string | undefined => {
  const pattern = new RegExp(`${key}:\\s*(['"\`])(.+?)\\1`);
  const match = rawArgs.match(pattern);
  return match?.[2];
};

const escapeSelectorValue = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
