const { normalizeText, requestRecordToText } = require("../common/request-utils");

const SIGNATURE_RULES = [
  { token: "SQL_TAUTOLOGY", pattern: /\b(?:or|and)\b\s+(?:['"]?\d+['"]?\s*=\s*['"]?\d+|['"][^'"]+['"]\s*=\s*['"][^'"]+['"])/i },
  { token: "SQL_UNION_SELECT", pattern: /\bunion\b(?:[\s\S]{0,20})\bselect\b/i },
  { token: "SQL_SCHEMA_ACCESS", pattern: /\binformation_schema\b|\bpg_sleep\b|\bxp_cmdshell\b/i },
  { token: "SQL_TIME_DELAY", pattern: /\bsleep\s*\(\s*\d+\s*\)/i },
  { token: "SQL_DROP_TABLE", pattern: /\bdrop\s+table\b/i },
  { token: "SQL_COMMENT_SEQUENCE", pattern: /--|\/\*|\*\/|#/ },
  { token: "XSS_SCRIPT_TAG", pattern: /<\s*script\b|%3cscript/i },
  { token: "XSS_EVENT_HANDLER", pattern: /\bonerror=|\bonload=|\bonclick=|\bonmouseover=/i },
  { token: "XSS_JS_SCHEME", pattern: /javascript:|document\.cookie|alert\s*\(/i },
  { token: "PATH_TRAVERSAL", pattern: /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\\|%252e%252e%252f/i },
  { token: "SYSTEM_FILE_TARGET", pattern: /etc\/passwd|boot\.ini|win\.ini|system32/i },
  { token: "COMMAND_CHAIN", pattern: /(?:;\s*|&&\s*|\|\|\s*|\|\s*|`\s*)(?:cat|ls|whoami|uname|curl|wget|powershell|cmd\.exe|bash|sh|ping)\b/i },
  { token: "COMMAND_KEYWORD", pattern: /\b(?:cat|ls|whoami|uname|curl|wget|powershell|cmd\.exe|bash|sh|ping)\b/i },
  { token: "SUSPICIOUS_ENCODING", pattern: /%3c|%3e|%27|%22|%2f|%5c|%252f|%255c/i }
];

function bucketizeCount(prefix, count, thresholds) {
  const tokens = [];
  thresholds.forEach((threshold) => {
    if (count >= threshold) {
      tokens.push(`${prefix}_${threshold}`);
    }
  });
  return tokens;
}

function tokenizePlainText(text) {
  const tokens = normalizeText(text)
    .split(/[^a-z0-9_.$-]+/)
    .filter((token) => token.length >= 2 && token.length <= 32);

  return tokens.slice(0, 200);
}

function extractTokens(record) {
  const rawText = requestRecordToText(record);
  const tokens = [];

  tokens.push(`METHOD_${record.method}`);

  if (record.query) {
    tokens.push("HAS_QUERY");
  }

  if (record.body) {
    tokens.push("HAS_BODY");
  }

  if ((record.headers["content-type"] || "").includes("application/json")) {
    tokens.push("JSON_BODY");
  }

  const specialCharacterCount = (rawText.match(/['"<>=;|`$()%{}[\]\\]/g) || []).length;
  tokens.push(...bucketizeCount("SPECIALS", specialCharacterCount, [2, 5, 10]));
  tokens.push(...bucketizeCount("URL_LENGTH", record.url.length, [20, 40, 80]));
  tokens.push(...bucketizeCount("BODY_LENGTH", record.body.length, [20, 80, 160]));

  SIGNATURE_RULES.forEach((rule) => {
    if (rule.pattern.test(rawText)) {
      tokens.push(rule.token);
    }
  });

  tokens.push(...tokenizePlainText(record.path));
  tokens.push(...tokenizePlainText(record.query));
  tokens.push(...tokenizePlainText(record.body));

  Object.entries(record.headers).forEach(([key, value]) => {
    tokens.push(`HEADER_${key}`);
    tokens.push(...tokenizePlainText(`${key} ${value}`));
  });

  return tokens;
}

module.exports = {
  extractTokens,
  SIGNATURE_RULES
};
