/**
 * 安全的逻辑表达式解析器
 * 用于真值表计算，防止代码注入
 */

type Token = { type: string; value: string };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/[A-Z]/.test(char)) {
      let name = '';
      while (i < expr.length && /[A-Z]/.test(expr[i])) {
        name += expr[i++];
      }
      tokens.push({ type: 'VAR', value: name });
      continue;
    }

    if (char === '!' && expr[i + 1] !== '=') {
      tokens.push({ type: 'NOT', value: '!' });
      i++;
      continue;
    }

    if (char === '&' && expr[i + 1] === '&') {
      tokens.push({ type: 'AND', value: '&&' });
      i += 2;
      continue;
    }

    if (char === '|' && expr[i + 1] === '|') {
      tokens.push({ type: 'OR', value: '||' });
      i += 2;
      continue;
    }

    if (char === '^') {
      tokens.push({ type: 'XOR', value: '^' });
      i++;
      continue;
    }

    if (char === '-' && expr[i + 1] === '>') {
      tokens.push({ type: 'IMPLIES', value: '->' });
      i += 2;
      continue;
    }

    if (char === '<' && expr[i + 1] === '-' && expr[i + 2] === '>') {
      tokens.push({ type: 'IFF', value: '<->' });
      i += 3;
      continue;
    }

    if (['(', ')'].includes(char)) {
      tokens.push({ type: 'PAREN', value: char });
      i++;
      continue;
    }

    throw new Error(`Invalid character: ${char}`);
  }

  return tokens;
}

function parse(tokens: Token[], context: Record<string, boolean>): boolean {
  let pos = 0;

  function parseExpression(): boolean {
    return parseIff();
  }

  function parseIff(): boolean {
    let left = parseImplies();

    while (pos < tokens.length && tokens[pos].type === 'IFF') {
      pos++;
      const right = parseImplies();
      left = left === right;
    }

    return left;
  }

  function parseImplies(): boolean {
    let left = parseOr();

    while (pos < tokens.length && tokens[pos].type === 'IMPLIES') {
      pos++;
      const right = parseOr();
      left = !left || right;
    }

    return left;
  }

  function parseOr(): boolean {
    let left = parseXor();

    while (pos < tokens.length && tokens[pos].type === 'OR') {
      pos++;
      const right = parseXor();
      left = left || right;
    }

    return left;
  }

  function parseXor(): boolean {
    let left = parseAnd();

    while (pos < tokens.length && tokens[pos].type === 'XOR') {
      pos++;
      const right = parseAnd();
      left = left !== right;
    }

    return left;
  }

  function parseAnd(): boolean {
    let left = parseNot();

    while (pos < tokens.length && tokens[pos].type === 'AND') {
      pos++;
      const right = parseNot();
      left = left && right;
    }

    return left;
  }

  function parseNot(): boolean {
    if (pos < tokens.length && tokens[pos].type === 'NOT') {
      pos++;
      return !parseNot();
    }
    return parsePrimary();
  }

  function parsePrimary(): boolean {
    const token = tokens[pos];

    if (!token) throw new Error('Unexpected end of expression');

    if (token.type === 'VAR') {
      pos++;
      if (!(token.value in context)) {
        throw new Error(`Unknown variable: ${token.value}`);
      }
      return context[token.value];
    }

    if (token.type === 'PAREN' && token.value === '(') {
      pos++;
      const result = parseExpression();
      if (pos >= tokens.length || tokens[pos].type !== 'PAREN' || tokens[pos].value !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      pos++;
      return result;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  const result = parseExpression();

  if (pos < tokens.length) {
    throw new Error('Unexpected tokens at end of expression');
  }

  return result;
}

export function evaluateLogic(expr: string, context: Record<string, boolean>): boolean {
  const tokens = tokenize(expr);
  return parse(tokens, context);
}

export function extractVariables(expr: string): string[] {
  const vars = new Set<string>();
  const regex = /[A-Z]+/g;
  let match;
  while ((match = regex.exec(expr)) !== null) {
    if (match[0].length === 1) {
      vars.add(match[0]);
    } else {
      for (const char of match[0]) {
        vars.add(char);
      }
    }
  }
  return Array.from(vars).sort();
}
