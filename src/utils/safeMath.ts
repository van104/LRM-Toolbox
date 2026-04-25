/**
 * 安全的数学表达式解析器
 * 用于替代 new Function() 执行动态表达式，防止代码注入
 */

const MATH_CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E
};

const MATH_FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
  sqrt: Math.sqrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  exp: Math.exp,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  pow: Math.pow
};

type Token = { type: string; value: string | number };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/\d/.test(char) || (char === '.' && /\d/.test(expr[i + 1]))) {
      let num = '';
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
        num += expr[i++];
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(num) });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let name = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        name += expr[i++];
      }
      tokens.push({ type: 'NAME', value: name.toLowerCase() });
      continue;
    }

    if (['+', '-', '*', '/', '%', '^', '(', ')'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
      continue;
    }

    throw new Error(`Invalid character: ${char}`);
  }

  return tokens;
}

function parse(tokens: Token[], variables?: Record<string, number>): number {
  let pos = 0;

  function parseExpression(): number {
    let left = parseTerm();

    while (pos < tokens.length) {
      const token = tokens[pos];
      if (token.type !== 'OPERATOR' || !['+', '-'].includes(token.value as string)) break;
      pos++;
      const right = parseTerm();
      left = token.value === '+' ? left + right : left - right;
    }

    return left;
  }

  function parseTerm(): number {
    let left = parsePower();

    while (pos < tokens.length) {
      const token = tokens[pos];
      if (token.type !== 'OPERATOR' || !['*', '/', '%'].includes(token.value as string)) break;
      pos++;
      const right = parsePower();
      if (token.value === '*') left = left * right;
      else if (token.value === '/') left = left / right;
      else left = left % right;
    }

    return left;
  }

  function parsePower(): number {
    let left = parseUnary();

    while (pos < tokens.length && tokens[pos].type === 'OPERATOR' && tokens[pos].value === '^') {
      pos++;
      const right = parseUnary();
      left = Math.pow(left, right);
    }

    return left;
  }

  function parseUnary(): number {
    if (pos < tokens.length && tokens[pos].type === 'OPERATOR' && tokens[pos].value === '-') {
      pos++;
      return -parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const token = tokens[pos];

    if (!token) throw new Error('Unexpected end of expression');

    if (token.type === 'NUMBER') {
      pos++;
      return token.value as number;
    }

    if (token.type === 'NAME') {
      const name = token.value as string;
      pos++;

      if (MATH_CONSTANTS[name] !== undefined) {
        return MATH_CONSTANTS[name];
      }

      if (variables && name in variables) {
        return variables[name];
      }

      if (MATH_FUNCTIONS[name]) {
        if (pos >= tokens.length || tokens[pos].type !== 'OPERATOR' || tokens[pos].value !== '(') {
          throw new Error(`Function ${name} requires parentheses`);
        }
        pos++;
        const arg = parseExpression();
        if (pos >= tokens.length || tokens[pos].type !== 'OPERATOR' || tokens[pos].value !== ')') {
          throw new Error('Missing closing parenthesis');
        }
        pos++;
        return MATH_FUNCTIONS[name](arg);
      }

      throw new Error(`Unknown identifier: ${name}`);
    }

    if (token.type === 'OPERATOR' && token.value === '(') {
      pos++;
      const result = parseExpression();
      if (pos >= tokens.length || tokens[pos].type !== 'OPERATOR' || tokens[pos].value !== ')') {
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

export function safeEvaluate(expr: string): number {
  const normalized = expr.replace(/×/g, '*').replace(/÷/g, '/');

  const tokens = tokenize(normalized);
  return parse(tokens);
}

/**
 * 安全计算带变量的数学表达式
 * @param expr 表达式，如 "x^2 + 2*x + 1"
 * @param vars 变量值，如 { x: 3 }
 */
export function safeEvaluateWithVars(expr: string, vars: Record<string, number>): number {
  const normalized = expr.replace(/×/g, '*').replace(/÷/g, '/');

  const tokens = tokenize(normalized);
  return parse(tokens, vars);
}

export function isSafeExpression(expr: string): boolean {
  try {
    safeEvaluate(expr);
    return true;
  } catch {
    return false;
  }
}
