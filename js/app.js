/**
 * MATH/OS - Frontend Engine & Calculation System
 * Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - Pure vanilla architecture (No eval, no external UI frameworks)
 * - Controlled mathematical tokenizer, recursive descent parser, and AST evaluator
 * - Separate independent state machines for NORMAL and SCIENTIFIC calculators
 * - Real DEG / RAD angle modes with floating-point compensation
 * - Precise mathematical formatting (no ugly trailing zeros or IEEE-754 drift)
 * - Robust error handling (division by zero, negative radicals, invalid factorials)
 * - Complete keyboard support & tactile UI feedback
 * - Future-ready calculation history architecture
 */

'use strict';

import { FORMULA_TOPICS, FORMULAS_DATA } from './formula-data.js';
import { apiRequest } from './services/api.js';
import { FormulaService } from './services/formulaService.js';
import { HistoryService } from './services/historyService.js';

/* ==========================================================================
   1. MATHEMATICAL ENGINE & SAFE EXPRESSION EVALUATOR
   ========================================================================== */

class MathEngine {
  /**
   * Evaluates a mathematical expression safely without using eval()
   * @param {string} expression - The formula string to evaluate
   * @param {string} angleMode - 'DEG' or 'RAD'
   * @returns {number} The evaluated numeric result
   */
  static evaluate(expression, angleMode = 'DEG') {
    if (!expression || typeof expression !== 'string') {
      throw new Error('Invalid expression');
    }

    // Clean & normalize expression tokens
    const sanitized = this.normalize(expression);
    const tokens = this.tokenize(sanitized);
    
    if (tokens.length === 0) {
      throw new Error('Invalid expression');
    }

    const parser = new ExpressionParser(tokens, angleMode);
    const result = parser.parse();

    if (!isFinite(result) || isNaN(result)) {
      throw new Error('Invalid calculation');
    }

    return this.cleanFloat(result);
  }

  /**
   * Normalizes human-readable mathematical symbols to internal parser tokens
   */
  static normalize(expr) {
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/log₁₀/g, 'log')
      .replace(/EXP/g, 'e+')
      .trim();
  }

  /**
   * Tokenizes an expression string into a structured stream of tokens
   */
  static tokenize(str) {
    const tokens = [];
    let i = 0;
    const len = str.length;

    while (i < len) {
      const ch = str[i];

      // Skip whitespace
      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      // Numbers (integers, decimals, scientific notation like 1.5e+3 or 2e-4)
      if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < len && /[0-9]/.test(str[i + 1]))) {
        let numStr = '';
        while (i < len && /[0-9.]/.test(str[i])) {
          numStr += str[i++];
        }
        // Check for scientific notation exponent (e.g., 2e+4, 1.5e-3)
        if (i < len && (str[i] === 'e' || str[i] === 'E')) {
          const next = str[i + 1];
          if (next === '+' || next === '-' || /[0-9]/.test(next)) {
            numStr += str[i++]; // 'e'
            if (str[i] === '+' || str[i] === '-') {
              numStr += str[i++];
            }
            while (i < len && /[0-9]/.test(str[i])) {
              numStr += str[i++];
            }
          }
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
        continue;
      }

      // Alphabetic tokens: functions & constants (sin, cos, tan, asin, acos, atan, ln, log, sqrt, abs, pi, e)
      if (/[a-zA-Z]/.test(ch)) {
        let ident = '';
        while (i < len && /[a-zA-Z0-9_]/.test(str[i])) {
          ident += str[i++];
        }
        ident = ident.toLowerCase();

        if (ident === 'pi') {
          tokens.push({ type: 'NUMBER', value: Math.PI });
        } else if (ident === 'e') {
          tokens.push({ type: 'NUMBER', value: Math.E });
        } else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'ln', 'log', 'sqrt', 'abs', 'fact', 'recip', 'sqr'].includes(ident)) {
          tokens.push({ type: 'FUNCTION', value: ident });
        } else {
          throw new Error('Invalid input');
        }
        continue;
      }

      // Operators & Parentheses
      if ('+-*/^%!()'.includes(ch)) {
        tokens.push({ type: 'OPERATOR', value: ch });
        i++;
        continue;
      }

      // If unrecognized character encountered
      throw new Error('Invalid input');
    }

    // Insert implicit multiplications (e.g. 2pi -> 2 * pi, 2(3) -> 2 * (3), (2)(3) -> (2) * (3), 5sin(30) -> 5 * sin(30))
    const expanded = [];
    for (let j = 0; j < tokens.length; j++) {
      const current = tokens[j];
      const next = tokens[j + 1];

      expanded.push(current);

      if (next) {
        const isCurrentVal = current.type === 'NUMBER' || (current.type === 'OPERATOR' && (current.value === ')' || current.value === '!'));
        const isNextVal = next.type === 'NUMBER' || next.type === 'FUNCTION' || (next.type === 'OPERATOR' && next.value === '(');

        if (isCurrentVal && isNextVal) {
          expanded.push({ type: 'OPERATOR', value: '*' });
        }
      }
    }

    return expanded;
  }

  /**
   * Factorial helper with overflow & domain validation
   */
  static factorial(n) {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Invalid factorial');
    }
    if (n > 170) {
      throw new Error('Infinity');
    }
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) {
      res *= i;
    }
    return res;
  }

  /**
   * Cleans floating point arithmetic artifacts (e.g. 0.1 + 0.2 -> 0.3)
   */
  static cleanFloat(num) {
    if (Math.abs(num) < 1e-15) return 0;
    // Standard precision limiter to remove IEEE 754 precision noise
    return parseFloat(num.toPrecision(14));
  }

  /**
   * Formats a numeric result cleanly for display (avoids redundant trailing zeroes)
   */
  static formatResult(val) {
    if (typeof val === 'string') return val;
    if (isNaN(val)) return 'Invalid expression';
    if (!isFinite(val)) return 'Infinity';

    const cleaned = this.cleanFloat(val);

    // Large or microscopic numbers format in scientific notation
    if (Math.abs(cleaned) >= 1e14 || (Math.abs(cleaned) > 0 && Math.abs(cleaned) < 1e-6)) {
      return cleaned.toExponential(6).replace(/\.?0+e/, 'e');
    }

    // Standard numbers: up to 10 decimal digits without trailing zeros
    const str = cleaned.toString();
    if (str.includes('.')) {
      return parseFloat(cleaned.toFixed(10)).toString();
    }
    return str;
  }
}

/**
 * Recursive Descent Expression Parser
 */
class ExpressionParser {
  constructor(tokens, angleMode = 'DEG') {
    this.tokens = tokens;
    this.pos = 0;
    this.angleMode = angleMode;
  }

  peek() {
    return this.tokens[this.pos];
  }

  get() {
    return this.tokens[this.pos++];
  }

  parse() {
    const result = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error('Invalid expression');
    }
    return result;
  }

  parseExpression() {
    return this.parseAdditionSubtraction();
  }

  parseAdditionSubtraction() {
    let left = this.parseMultiplicationDivision();

    while (this.pos < this.tokens.length) {
      const token = this.peek();
      if (token && token.type === 'OPERATOR' && (token.value === '+' || token.value === '-')) {
        this.get();
        const right = this.parseMultiplicationDivision();
        if (token.value === '+') {
          left = left + right;
        } else {
          left = left - right;
        }
      } else {
        break;
      }
    }
    return left;
  }

  parseMultiplicationDivision() {
    let left = this.parseExponentiation();

    while (this.pos < this.tokens.length) {
      const token = this.peek();
      if (token && token.type === 'OPERATOR' && (token.value === '*' || token.value === '/' || token.value === '%')) {
        this.get();
        const right = this.parseExponentiation();
        if (token.value === '*') {
          left = left * right;
        } else if (token.value === '/') {
          if (right === 0) {
            throw new Error('Cannot divide by zero');
          }
          left = left / right;
        } else if (token.value === '%') {
          if (right === 0) {
            throw new Error('Cannot divide by zero');
          }
          left = left % right;
        }
      } else {
        break;
      }
    }
    return left;
  }

  parseExponentiation() {
    let left = this.parseUnary();

    const token = this.peek();
    if (token && token.type === 'OPERATOR' && token.value === '^') {
      this.get();
      // Right-associative power
      const right = this.parseExponentiation();
      left = Math.pow(left, right);
    }
    return left;
  }

  parseUnary() {
    const token = this.peek();
    if (token && token.type === 'OPERATOR' && (token.value === '+' || token.value === '-')) {
      this.get();
      const operand = this.parseUnary();
      return token.value === '-' ? -operand : operand;
    }
    return this.parsePostfix();
  }

  parsePostfix() {
    let base = this.parsePrimary();

    while (this.pos < this.tokens.length) {
      const token = this.peek();
      if (token && token.type === 'OPERATOR' && token.value === '!') {
        this.get();
        base = MathEngine.factorial(base);
      } else if (token && token.type === 'OPERATOR' && token.value === '%') {
        // Postfix percentage: 50% = 0.5
        this.get();
        base = base / 100;
      } else {
        break;
      }
    }
    return base;
  }

  parsePrimary() {
    const token = this.get();
    if (!token) {
      throw new Error('Invalid expression');
    }

    // Number literal
    if (token.type === 'NUMBER') {
      return token.value;
    }

    // Parenthesized sub-expression
    if (token.type === 'OPERATOR' && token.value === '(') {
      const expr = this.parseExpression();
      const close = this.get();
      if (!close || close.type !== 'OPERATOR' || close.value !== ')') {
        throw new Error('Unclosed parenthesis');
      }
      return expr;
    }

    // Function calls
    if (token.type === 'FUNCTION') {
      const fnName = token.value;

      // Handle function arguments: either enclosed in parens or immediate primary operand
      let arg;
      const next = this.peek();
      if (next && next.type === 'OPERATOR' && next.value === '(') {
        this.get(); // consume '('
        arg = this.parseExpression();
        const close = this.get();
        if (!close || close.type !== 'OPERATOR' || close.value !== ')') {
          throw new Error('Unclosed parenthesis');
        }
      } else {
        arg = this.parsePrimary();
      }

      return this.evaluateFunction(fnName, arg);
    }

    throw new Error('Invalid expression');
  }

  evaluateFunction(fn, arg) {
    const degToRad = (deg) => (deg * Math.PI) / 180;
    const radToDeg = (rad) => (rad * 180) / Math.PI;

    switch (fn) {
      case 'sin': {
        const theta = this.angleMode === 'DEG' ? degToRad(arg) : arg;
        // Clean known exact DEG angles (0, 30, 90, 180, 270, 360)
        if (this.angleMode === 'DEG') {
          const mod = Math.abs(arg) % 360;
          if (mod === 0 || mod === 180) return 0;
          if (mod === 30 || mod === 150) return (arg < 0 ? -0.5 : 0.5);
          if (mod === 210 || mod === 330) return (arg < 0 ? 0.5 : -0.5);
          if (mod === 90) return arg > 0 ? 1 : -1;
          if (mod === 270) return arg > 0 ? -1 : 1;
        }
        return Math.sin(theta);
      }

      case 'cos': {
        const theta = this.angleMode === 'DEG' ? degToRad(arg) : arg;
        if (this.angleMode === 'DEG') {
          const mod = Math.abs(arg) % 360;
          if (mod === 90 || mod === 270) return 0;
          if (mod === 60 || mod === 300) return 0.5;
          if (mod === 120 || mod === 240) return -0.5;
          if (mod === 0) return 1;
          if (mod === 180) return -1;
        }
        return Math.cos(theta);
      }

      case 'tan': {
        if (this.angleMode === 'DEG') {
          const mod = Math.abs(arg) % 180;
          if (mod === 90) throw new Error('Invalid input');
          if (mod === 45) return (arg > 0 ? 1 : -1);
          if (mod === 135) return (arg > 0 ? -1 : 1);
          if (mod === 0) return 0;
        }
        const theta = this.angleMode === 'DEG' ? degToRad(arg) : arg;
        const res = Math.tan(theta);
        if (Math.abs(res) > 1e15) throw new Error('Invalid input');
        return res;
      }

      case 'asin': {
        if (arg < -1 || arg > 1) throw new Error('Invalid input');
        const rad = Math.asin(arg);
        return this.angleMode === 'DEG' ? radToDeg(rad) : rad;
      }

      case 'acos': {
        if (arg < -1 || arg > 1) throw new Error('Invalid input');
        const rad = Math.acos(arg);
        return this.angleMode === 'DEG' ? radToDeg(rad) : rad;
      }

      case 'atan': {
        const rad = Math.atan(arg);
        return this.angleMode === 'DEG' ? radToDeg(rad) : rad;
      }

      case 'ln': {
        if (arg <= 0) throw new Error('Invalid input');
        return Math.log(arg);
      }

      case 'log': {
        if (arg <= 0) throw new Error('Invalid input');
        return Math.log10(arg);
      }

      case 'sqrt': {
        if (arg < 0) throw new Error('Invalid input');
        return Math.sqrt(arg);
      }

      case 'sqr':
        return Math.pow(arg, 2);

      case 'recip': {
        if (arg === 0) throw new Error('Cannot divide by zero');
        return 1 / arg;
      }

      case 'abs':
        return Math.abs(arg);

      case 'fact':
        return MathEngine.factorial(arg);

      default:
        throw new Error('Invalid function');
    }
  }
}

/* ==========================================================================
   2. APPLICATION STATE & CONTROLLER
   ========================================================================== */

const MATH_OS_STATE = {
  currentView: 'home',
  
  // Persistent Calculation History Cache
  history: [],

  // Normal Calculator State
  normal: {
    expression: '',
    currentInput: '0',
    waitingForOperand: false,
    hasCalculated: false,
    lastResult: null,
    error: null
  },

  // Scientific Calculator State
  scientific: {
    expression: '',
    displayValue: '0',
    angleMode: 'DEG', // 'DEG' or 'RAD'
    isInv: false,     // Inverse trig state
    justEvaluated: false,
    lastResult: null,
    error: null
  },

  // Formula Library State
  formulas: {
    items: [...FORMULAS_DATA],
    selectedTopicId: null,
    selectedSubtopic: null,
    searchQuery: '',
    activeFilter: 'all',
    isLoading: false,
    dataSource: 'local' // 'local' | 'api'
  },

  // Backend System State
  apiStatus: 'checking' // 'online' | 'offline' | 'checking'
};

/* ==========================================================================
   3. NORMAL CALCULATOR CONTROLLER
   ========================================================================== */

const NormalCalcController = {
  dom: {},

  init() {
    this.dom = {
      history: document.getElementById('normalHistory'),
      display: document.getElementById('normalDisplay'),
      keypad: document.getElementById('normalKeypad')
    };

    if (!this.dom.keypad) return;

    // Attach Keypad Click Handler
    this.dom.keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-btn');
      if (!btn) return;

      if (btn.hasAttribute('data-norm-num')) {
        this.inputDigit(btn.getAttribute('data-norm-num'));
      } else if (btn.hasAttribute('data-norm-op')) {
        this.inputOperator(btn.getAttribute('data-norm-op'));
      } else if (btn.hasAttribute('data-norm-action')) {
        const action = btn.getAttribute('data-norm-action');
        this.handleAction(action);
      }
    });

    this.updateDisplay();
  },

  inputDigit(digit) {
    const state = MATH_OS_STATE.normal;
    state.error = null;

    if (state.hasCalculated || state.waitingForOperand) {
      state.currentInput = digit;
      state.waitingForOperand = false;
      state.hasCalculated = false;
    } else {
      state.currentInput = state.currentInput === '0' ? digit : state.currentInput + digit;
    }

    this.updateDisplay();
  },

  inputDecimal() {
    const state = MATH_OS_STATE.normal;
    state.error = null;

    if (state.hasCalculated || state.waitingForOperand) {
      state.currentInput = '0.';
      state.waitingForOperand = false;
      state.hasCalculated = false;
    } else if (!state.currentInput.includes('.')) {
      state.currentInput += '.';
    }

    this.updateDisplay();
  },

  inputOperator(op) {
    const state = MATH_OS_STATE.normal;
    state.error = null;

    const opSymbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    const displayOp = opSymbolMap[op] || op;

    if (state.hasCalculated) {
      // Chain previous result
      state.expression = `${state.currentInput} ${displayOp} `;
      state.hasCalculated = false;
      state.waitingForOperand = true;
    } else if (state.waitingForOperand) {
      // Replace trailing operator
      state.expression = state.expression.replace(/[\+\−\×\÷]\s*$/, `${displayOp} `);
    } else {
      state.expression += `${state.currentInput} ${displayOp} `;
      state.waitingForOperand = true;
    }

    this.updateDisplay();
  },

  handleAction(action) {
    const state = MATH_OS_STATE.normal;

    switch (action) {
      case 'clear':
        this.clear();
        break;
      case 'delete':
        this.deleteLast();
        break;
      case 'decimal':
        this.inputDecimal();
        break;
      case 'sign':
        this.toggleSign();
        break;
      case 'percent':
        this.calculatePercent();
        break;
      case 'equals':
        this.calculate();
        break;
    }
  },

  toggleSign() {
    const state = MATH_OS_STATE.normal;
    if (state.error || state.currentInput === '0') return;

    if (state.currentInput.startsWith('-')) {
      state.currentInput = state.currentInput.slice(1);
    } else {
      state.currentInput = '-' + state.currentInput;
    }
    this.updateDisplay();
  },

  calculatePercent() {
    const state = MATH_OS_STATE.normal;
    if (state.error) return;

    const val = parseFloat(state.currentInput);
    if (!isNaN(val)) {
      state.currentInput = MathEngine.formatResult(val / 100);
      this.updateDisplay();
    }
  },

  deleteLast() {
    const state = MATH_OS_STATE.normal;
    if (state.error || state.hasCalculated) {
      this.clear();
      return;
    }

    if (state.currentInput.length > 1) {
      state.currentInput = state.currentInput.slice(0, -1);
      if (state.currentInput === '-' || state.currentInput === '') {
        state.currentInput = '0';
      }
    } else {
      state.currentInput = '0';
    }

    this.updateDisplay();
  },

  clear() {
    const state = MATH_OS_STATE.normal;
    state.expression = '';
    state.currentInput = '0';
    state.waitingForOperand = false;
    state.hasCalculated = false;
    state.lastResult = null;
    state.error = null;
    this.updateDisplay();
  },

  calculate() {
    const state = MATH_OS_STATE.normal;
    if (state.error) return;

    let fullExpr = state.expression;
    if (!state.waitingForOperand) {
      fullExpr += state.currentInput;
    } else {
      // Remove dangling operator
      fullExpr = fullExpr.replace(/[\+\−\×\÷]\s*$/, '').trim();
    }

    if (!fullExpr) return;

    try {
      const rawResult = MathEngine.evaluate(fullExpr, 'DEG');
      const formatted = MathEngine.formatResult(rawResult);

      state.expression = fullExpr + ' =';
      state.currentInput = formatted;
      state.lastResult = rawResult;
      state.hasCalculated = true;
      state.waitingForOperand = false;
      state.error = null;

      // Update UI immediately (Never blocked by network)
      this.updateDisplay();

      // Asynchronously record calculation to history
      HistoryController.recordCalculation({
        expression: fullExpr,
        result: String(rawResult),
        formattedResult: formatted,
        type: 'normal',
        angleMode: null
      });
    } catch (err) {
      state.error = err.message || 'Invalid expression';
      this.updateDisplay();
    }
  },

  updateDisplay() {
    const state = MATH_OS_STATE.normal;
    if (!this.dom.display || !this.dom.history) return;

    this.dom.history.textContent = state.expression;

    if (state.error) {
      this.dom.display.textContent = state.error;
      this.dom.display.classList.add('has-error');
    } else {
      this.dom.display.textContent = state.currentInput;
      this.dom.display.classList.remove('has-error');
    }
  }
};

/* ==========================================================================
   4. SCIENTIFIC CALCULATOR CONTROLLER
   ========================================================================== */

const SciCalcController = {
  dom: {},

  init() {
    this.dom = {
      history: document.getElementById('sciHistory'),
      display: document.getElementById('sciDisplay'),
      keypad: document.getElementById('sciKeypad'),
      radBtn: document.getElementById('btnRadMode'),
      degBtn: document.getElementById('btnDegMode'),
      invBtn: document.getElementById('btnInvToggle'),
      sinBtn: document.getElementById('btnSin'),
      cosBtn: document.getElementById('btnCos'),
      tanBtn: document.getElementById('btnTan'),
      lnBtn: document.getElementById('btnLn'),
      logBtn: document.getElementById('btnLog'),
      sqrtBtn: document.getElementById('btnSqrt'),
      modeBadge: document.getElementById('activeModeBadge')
    };

    if (!this.dom.keypad) return;

    // Attach Keypad Click Handler
    this.dom.keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-btn');
      if (!btn) return;

      if (btn.hasAttribute('data-sci-num')) {
        this.inputDigit(btn.getAttribute('data-sci-num'));
      } else if (btn.hasAttribute('data-sci-op')) {
        this.inputOperator(btn.getAttribute('data-sci-op'));
      } else if (btn.hasAttribute('data-sci-fn')) {
        this.inputFunction(btn.getAttribute('data-sci-fn'));
      } else if (btn.hasAttribute('data-sci-const')) {
        this.inputConstant(btn.getAttribute('data-sci-const'));
      } else if (btn.hasAttribute('data-sci-action')) {
        const action = btn.getAttribute('data-sci-action');
        this.handleAction(action);
      }
    });

    this.updateModeUI();
    this.updateDisplay();
  },

  inputDigit(digit) {
    const state = MATH_OS_STATE.scientific;
    state.error = null;

    if (state.justEvaluated) {
      state.expression = digit;
      state.displayValue = digit;
      state.justEvaluated = false;
    } else {
      if (state.displayValue === '0' && state.expression === '') {
        state.expression = digit;
        state.displayValue = digit;
      } else {
        state.expression += digit;
        state.displayValue = this.extractCurrentToken(state.expression);
      }
    }

    this.updateDisplay();
  },

  inputDecimal() {
    const state = MATH_OS_STATE.scientific;
    state.error = null;

    if (state.justEvaluated) {
      state.expression = '0.';
      state.displayValue = '0.';
      state.justEvaluated = false;
    } else {
      const currentToken = this.extractCurrentToken(state.expression);
      if (!currentToken.includes('.')) {
        state.expression += '.';
        state.displayValue = currentToken + '.';
      }
    }

    this.updateDisplay();
  },

  inputOperator(op) {
    const state = MATH_OS_STATE.scientific;
    state.error = null;

    const opSymbolMap = { '+': ' + ', '-': ' − ', '*': ' × ', '/': ' ÷ ', '^': ' ^ ' };
    const displayOp = opSymbolMap[op] || ` ${op} `;

    if (state.justEvaluated && state.lastResult !== null) {
      state.expression = `${MathEngine.formatResult(state.lastResult)}${displayOp}`;
      state.justEvaluated = false;
    } else {
      state.expression += displayOp;
    }

    state.displayValue = opSymbolMap[op]?.trim() || op;
    this.updateDisplay();
  },

  inputFunction(fnName) {
    const state = MATH_OS_STATE.scientific;
    state.error = null;

    // Handle Inverse functions mapping when INV mode is active
    let activeFn = fnName;
    if (state.isInv) {
      const invMap = {
        sin: 'asin',
        cos: 'acos',
        tan: 'atan',
        ln: 'exp',
        log: 'pow10',
        sqrt: 'sqr'
      };
      if (invMap[fnName]) activeFn = invMap[fnName];
    }

    const fnDisplayMap = {
      sin: 'sin(',
      cos: 'cos(',
      tan: 'tan(',
      asin: 'asin(',
      acos: 'acos(',
      atan: 'atan(',
      ln: 'ln(',
      log: 'log(',
      sqrt: '√(',
      sqr: 'sqr(',
      recip: '1/(',
      abs: 'abs('
    };

    const token = fnDisplayMap[activeFn] || `${activeFn}(`;

    if (state.justEvaluated) {
      state.expression = token;
      state.justEvaluated = false;
    } else {
      state.expression += token;
    }

    state.displayValue = token;
    this.updateDisplay();
  },

  inputConstant(constName) {
    const state = MATH_OS_STATE.scientific;
    state.error = null;

    const symbol = constName === 'pi' ? 'π' : 'e';

    if (state.justEvaluated) {
      state.expression = symbol;
      state.justEvaluated = false;
    } else {
      state.expression += symbol;
    }

    state.displayValue = symbol;
    this.updateDisplay();
  },

  handleAction(action) {
    const state = MATH_OS_STATE.scientific;

    switch (action) {
      case 'clear':
        this.clear();
        break;
      case 'delete':
        this.deleteLast();
        break;
      case 'decimal':
        this.inputDecimal();
        break;
      case 'mode-rad':
        this.setAngleMode('RAD');
        break;
      case 'mode-deg':
        this.setAngleMode('DEG');
        break;
      case 'toggle-inv':
        this.toggleInv();
        break;
      case 'open-paren':
        this.inputParen('(');
        break;
      case 'close-paren':
        this.inputParen(')');
        break;
      case 'fact':
        this.inputFact();
        break;
      case 'exp':
        this.inputExp();
        break;
      case 'equals':
        this.calculate();
        break;
    }
  },

  inputParen(paren) {
    const state = MATH_OS_STATE.scientific;
    state.error = null;

    if (state.justEvaluated && paren === '(') {
      state.expression = '(';
      state.justEvaluated = false;
    } else {
      state.expression += paren;
    }

    state.displayValue = paren;
    this.updateDisplay();
  },

  inputFact() {
    const state = MATH_OS_STATE.scientific;
    state.error = null;
    state.expression += '!';
    state.displayValue = '!';
    state.justEvaluated = false;
    this.updateDisplay();
  },

  inputExp() {
    const state = MATH_OS_STATE.scientific;
    state.error = null;
    state.expression += 'e+';
    state.displayValue = 'e+';
    state.justEvaluated = false;
    this.updateDisplay();
  },

  setAngleMode(mode) {
    MATH_OS_STATE.scientific.angleMode = mode;
    this.updateModeUI();
  },

  toggleInv() {
    const state = MATH_OS_STATE.scientific;
    state.isInv = !state.isInv;
    this.updateInvUI();
  },

  updateModeUI() {
    const state = MATH_OS_STATE.scientific;
    if (this.dom.radBtn && this.dom.degBtn) {
      if (state.angleMode === 'RAD') {
        this.dom.radBtn.classList.add('is-active-mode');
        this.dom.degBtn.classList.remove('is-active-mode');
        if (this.dom.modeBadge) this.dom.modeBadge.textContent = 'RAD MODE';
      } else {
        this.dom.degBtn.classList.add('is-active-mode');
        this.dom.radBtn.classList.remove('is-active-mode');
        if (this.dom.modeBadge) this.dom.modeBadge.textContent = 'DEG MODE';
      }
    }
  },

  updateInvUI() {
    const state = MATH_OS_STATE.scientific;
    if (this.dom.invBtn) {
      if (state.isInv) {
        this.dom.invBtn.classList.add('is-active-toggle');
      } else {
        this.dom.invBtn.classList.remove('is-active-toggle');
      }
    }

    // Toggle button labels
    if (this.dom.sinBtn) this.dom.sinBtn.textContent = state.isInv ? 'sin⁻¹' : 'sin';
    if (this.dom.cosBtn) this.dom.cosBtn.textContent = state.isInv ? 'cos⁻¹' : 'cos';
    if (this.dom.tanBtn) this.dom.tanBtn.textContent = state.isInv ? 'tan⁻¹' : 'tan';
    if (this.dom.lnBtn) this.dom.lnBtn.textContent = state.isInv ? 'eˣ' : 'ln';
    if (this.dom.logBtn) this.dom.logBtn.textContent = state.isInv ? '10ˣ' : 'log';
    if (this.dom.sqrtBtn) this.dom.sqrtBtn.textContent = state.isInv ? 'x²' : '√x';
  },

  deleteLast() {
    const state = MATH_OS_STATE.scientific;
    if (state.error || state.justEvaluated) {
      this.clear();
      return;
    }

    if (state.expression.length > 0) {
      // Check for multi-character tokens like 'sin(', 'cos(', 'tan(', 'ln(', 'log(', '√('
      const multiTokens = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'log(', 'ln(', 'sqr(', 'abs(', '1/(', 'e+'];
      let deleted = false;
      for (const tok of multiTokens) {
        if (state.expression.endsWith(tok)) {
          state.expression = state.expression.slice(0, -tok.length);
          deleted = true;
          break;
        }
      }

      if (!deleted) {
        state.expression = state.expression.slice(0, -1);
      }

      state.displayValue = state.expression === '' ? '0' : this.extractCurrentToken(state.expression);
    } else {
      state.displayValue = '0';
    }

    this.updateDisplay();
  },

  clear() {
    const state = MATH_OS_STATE.scientific;
    state.expression = '';
    state.displayValue = '0';
    state.justEvaluated = false;
    state.lastResult = null;
    state.error = null;
    this.updateDisplay();
  },

  calculate() {
    const state = MATH_OS_STATE.scientific;
    if (state.error || !state.expression || state.justEvaluated) return;

    try {
      const exprToEval = state.expression;
      const rawResult = MathEngine.evaluate(exprToEval, state.angleMode);
      const formatted = MathEngine.formatResult(rawResult);

      state.lastResult = rawResult;
      state.displayValue = formatted;
      state.justEvaluated = true;
      state.error = null;

      // Update UI immediately (Never blocked by network)
      this.updateDisplay();

      // Asynchronously record calculation to history
      HistoryController.recordCalculation({
        expression: exprToEval,
        result: String(rawResult),
        formattedResult: formatted,
        type: 'scientific',
        angleMode: state.angleMode
      });
    } catch (err) {
      state.error = err.message || 'Invalid expression';
      this.updateDisplay();
    }
  },

  extractCurrentToken(expr) {
    if (!expr) return '0';
    const match = expr.match(/([0-9.]+|[\+\−\×\÷\^πe!]+|[a-z]+\(?|\(|\))$/i);
    return match ? match[0] : expr;
  },

  updateDisplay() {
    const state = MATH_OS_STATE.scientific;
    if (!this.dom.display || !this.dom.history) return;

    this.dom.history.textContent = state.expression;

    if (state.error) {
      this.dom.display.textContent = state.error;
      this.dom.display.classList.add('has-error');
    } else {
      this.dom.display.textContent = state.displayValue;
      this.dom.display.classList.remove('has-error');
    }
  }
};

/* ==========================================================================
   5. CALCULATION HISTORY CONTROLLER
   ========================================================================== */

const HistoryController = {
  dom: {},
  lastRecordedTimestamp: 0,
  lastRecordedSignature: '',

  init() {
    this.dom = {
      headerBtn: document.getElementById('headerHistoryBtn'),
      counterBadge: document.getElementById('historyCounterBadge'),
      drawerCount: document.getElementById('historyDrawerCount'),
      overlay: document.getElementById('historyOverlay'),
      drawer: document.getElementById('historyDrawer'),
      closeBtn: document.getElementById('historyCloseBtn'),
      clearBtn: document.getElementById('historyClearBtn'),
      listContainer: document.getElementById('historyListContainer')
    };

    if (!this.dom.drawer) return;

    // Open/Close Handlers
    if (this.dom.headerBtn) {
      this.dom.headerBtn.addEventListener('click', () => this.open());
    }

    if (this.dom.closeBtn) {
      this.dom.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.dom.overlay) {
      this.dom.overlay.addEventListener('click', () => this.close());
    }

    // Clear All Handler
    if (this.dom.clearBtn) {
      this.dom.clearBtn.addEventListener('click', () => this.clearAll());
    }

    // Delegated actions inside history drawer (delete, copy)
    if (this.dom.listContainer) {
      this.dom.listContainer.addEventListener('click', (e) => {
        // 1. Delete button
        const delBtn = e.target.closest('[data-delete-history]');
        if (delBtn) {
          const id = delBtn.getAttribute('data-delete-history');
          this.deleteItem(id);
          return;
        }

        // 2. Copy button
        const copyBtn = e.target.closest('[data-copy-history]');
        if (copyBtn) {
          const text = copyBtn.getAttribute('data-copy-history');
          this.copyText(text, copyBtn);
          return;
        }
      });
    }

    // ESC key closes drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Load initial history from backend
    this.loadHistory();
  },

  isOpen() {
    return this.dom.drawer && this.dom.drawer.classList.contains('is-active');
  },

  open() {
    if (!this.dom.drawer || !this.dom.overlay) return;
    this.dom.drawer.classList.add('is-active');
    this.dom.overlay.classList.add('is-active');
    this.dom.drawer.setAttribute('aria-hidden', 'false');
    this.dom.overlay.setAttribute('aria-hidden', 'false');
    this.render();
  },

  close() {
    if (!this.dom.drawer || !this.dom.overlay) return;
    this.dom.drawer.classList.remove('is-active');
    this.dom.overlay.classList.remove('is-active');
    this.dom.drawer.setAttribute('aria-hidden', 'true');
    this.dom.overlay.setAttribute('aria-hidden', 'true');
  },

  async loadHistory() {
    try {
      const res = await HistoryService.getCalculationHistory(50);
      if (res && res.success && Array.isArray(res.data)) {
        MATH_OS_STATE.history = res.data.map(item => ({
          id: item._id || item.id,
          expression: item.expression,
          result: item.result,
          formattedResult: item.formattedResult || item.result,
          type: item.type,
          angleMode: item.angleMode,
          createdAt: item.createdAt || new Date().toISOString()
        }));
      }
    } catch (err) {
      console.warn('[MATH/OS History] Note: Operating with local history state.', err.message);
    }
    this.render();
  },

  async recordCalculation(calc) {
    // Duplicate prevention (debounce / signature check)
    const signature = `${calc.type}:${calc.expression}:${calc.result}`;
    const now = Date.now();
    if (this.lastRecordedSignature === signature && (now - this.lastRecordedTimestamp) < 400) {
      return;
    }
    this.lastRecordedSignature = signature;
    this.lastRecordedTimestamp = now;

    const tempId = 'temp_' + now;
    const localRecord = {
      id: tempId,
      expression: calc.expression,
      result: calc.result,
      formattedResult: calc.formattedResult,
      type: calc.type,
      angleMode: calc.angleMode,
      createdAt: new Date().toISOString()
    };

    // Optimistically prepend to state
    MATH_OS_STATE.history.unshift(localRecord);
    this.render();

    // Asynchronously persist to MongoDB via backend REST API
    try {
      const res = await HistoryService.saveCalculation(calc);
      if (res && res.success && res.data) {
        const serverId = res.data._id || res.data.id;
        const target = MATH_OS_STATE.history.find(r => r.id === tempId);
        if (target && serverId) {
          target.id = serverId;
          target.createdAt = res.data.createdAt || target.createdAt;
          this.render();
        }
      }
    } catch (err) {
      console.warn('[MATH/OS History] Note: Saved calculation to client session only.', err.message);
    }
  },

  async deleteItem(id) {
    if (!id) return;

    // Optimistic deletion
    MATH_OS_STATE.history = MATH_OS_STATE.history.filter(item => item.id !== id);
    this.render();

    // Backend sync
    if (!id.startsWith('temp_')) {
      try {
        await HistoryService.deleteCalculation(id);
      } catch (err) {
        console.warn('[MATH/OS History] Failed to delete record from backend:', err.message);
      }
    }
  },

  async clearAll() {
    if (MATH_OS_STATE.history.length === 0) return;

    // Optimistic clear
    MATH_OS_STATE.history = [];
    this.render();

    // Backend sync
    try {
      await HistoryService.clearCalculationHistory();
    } catch (err) {
      console.warn('[MATH/OS History] Failed to clear history on backend:', err.message);
    }
  },

  copyText(text, btnEl) {
    if (!text || !btnEl) return;
    const originalHTML = btnEl.innerHTML;

    const showCopied = () => {
      btnEl.innerHTML = `<span>Copied ✓</span>`;
      btnEl.classList.add('is-copied');
      setTimeout(() => {
        btnEl.innerHTML = originalHTML;
        btnEl.classList.remove('is-copied');
      }, 1500);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(showCopied).catch(() => {
        this.fallbackCopy(text, showCopied);
      });
    } else {
      this.fallbackCopy(text, showCopied);
    }
  },

  fallbackCopy(text, callback) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (e) {}
    document.body.removeChild(textArea);
  },

  formatTime(isoString) {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Just now';
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      const secs = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${mins}:${secs}`;
    } catch {
      return 'Just now';
    }
  },

  render() {
    const count = MATH_OS_STATE.history.length;

    if (this.dom.counterBadge) {
      this.dom.counterBadge.textContent = count;
    }
    if (this.dom.drawerCount) {
      this.dom.drawerCount.textContent = count;
    }

    if (!this.dom.listContainer) return;

    if (count === 0) {
      this.dom.listContainer.innerHTML = `
        <div class="history-empty-state">
          <div class="history-empty-icon">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="history-empty-title">NO CALCULATIONS YET</h4>
          <p class="history-empty-desc">Your completed calculations will appear here.</p>
        </div>
      `;
      return;
    }

    this.dom.listContainer.innerHTML = MATH_OS_STATE.history.map(item => `
      <article class="history-card" data-history-id="${item.id}">
        <div class="history-card-top">
          <div class="history-tags">
            <span class="history-type-tag">${item.type}</span>
            ${item.angleMode ? `<span class="history-mode-tag">${item.angleMode}</span>` : ''}
          </div>
          <span class="history-time">${this.formatTime(item.createdAt)}</span>
        </div>
        <div class="history-expr-box">${this.escapeHTML(item.expression)}</div>
        <div class="history-result-box">
          <span class="history-equal">=</span>
          <span>${this.escapeHTML(item.formattedResult || item.result)}</span>
        </div>
        <div class="history-card-actions">
          <button type="button" class="history-action-btn" data-copy-history="${this.escapeAttr(item.formattedResult || item.result)}" title="Copy Result">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </button>
          <button type="button" class="history-action-btn is-delete" data-delete-history="${item.id}" title="Delete Record">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </article>
    `).join('');
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};

/* ==========================================================================
   6. FORMULA LIBRARY CONTROLLER
   ========================================================================== */

const FormulaLibraryController = {
  dom: {},

  init() {
    this.dom = {
      breadcrumbs: document.getElementById('formulaBreadcrumbs'),
      title: document.getElementById('formulaTitle'),
      subtitle: document.getElementById('formulaSubtitle'),
      headerBtn: document.getElementById('formulaHeaderActionBtn'),
      headerBtnText: document.getElementById('formulaHeaderBtnText'),
      searchInput: document.getElementById('formulaSearchInput'),
      searchClear: document.getElementById('formulaSearchClear'),
      filterChips: document.getElementById('formulaFilterChips'),
      statusBar: document.getElementById('formulaStatusBar'),
      resultsCount: document.getElementById('formulaResultsCount'),
      viewToggleArea: document.getElementById('formulaViewToggleArea'),
      contentArea: document.getElementById('formulaContentArea'),
      countBadge: document.getElementById('formulaCountBadge')
    };

    if (!this.dom.contentArea) return;

    this.renderFilterChips();
    this.bindEvents();
    this.render();

    // Fetch formulas from Express / MongoDB API
    this.loadFormulas();
  },

  async loadFormulas() {
    MATH_OS_STATE.formulas.isLoading = true;
    try {
      const res = await FormulaService.getAllFormulas();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        MATH_OS_STATE.formulas.items = res.data;
        MATH_OS_STATE.formulas.dataSource = res.source || 'api';
      }
    } catch (err) {
      console.warn('[MATH/OS Formula Library] Using local formulas fallback:', err.message);
    } finally {
      MATH_OS_STATE.formulas.isLoading = false;
      this.render();
    }
  },

  bindEvents() {
    // Search input
    if (this.dom.searchInput) {
      let debounceTimer = null;
      this.dom.searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        MATH_OS_STATE.formulas.searchQuery = query;
        if (this.dom.searchClear) {
          if (query.length > 0) {
            this.dom.searchClear.classList.add('is-visible');
          } else {
            this.dom.searchClear.classList.remove('is-visible');
          }
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.render();
        }, 120);
      });
    }

    // Search clear
    if (this.dom.searchClear) {
      this.dom.searchClear.addEventListener('click', () => {
        MATH_OS_STATE.formulas.searchQuery = '';
        if (this.dom.searchInput) {
          this.dom.searchInput.value = '';
          this.dom.searchInput.focus();
        }
        this.dom.searchClear.classList.remove('is-visible');
        this.render();
      });
    }

    // Header Back button
    if (this.dom.headerBtn) {
      this.dom.headerBtn.addEventListener('click', (e) => {
        const state = MATH_OS_STATE.formulas;
        if (state.selectedSubtopic) {
          e.preventDefault();
          state.selectedSubtopic = null;
          this.render();
        } else if (state.selectedTopicId) {
          e.preventDefault();
          state.selectedTopicId = null;
          state.selectedSubtopic = null;
          state.activeFilter = 'all';
          this.updateFilterChipsUI();
          this.render();
        } else if (state.searchQuery) {
          e.preventDefault();
          state.searchQuery = '';
          if (this.dom.searchInput) this.dom.searchInput.value = '';
          if (this.dom.searchClear) this.dom.searchClear.classList.remove('is-visible');
          this.render();
        }
      });
    }

    // Delegated click handlers inside contentArea (topics, subtopics, tags, copy buttons)
    this.dom.contentArea.addEventListener('click', (e) => {
      // 1. Copy Button
      const copyBtn = e.target.closest('[data-copy-formula]');
      if (copyBtn) {
        const formulaText = copyBtn.getAttribute('data-copy-formula');
        this.copyFormula(formulaText, copyBtn);
        return;
      }

      // 2. Topic Card Click
      const topicCard = e.target.closest('[data-topic-id]');
      if (topicCard) {
        const topicId = topicCard.getAttribute('data-topic-id');
        this.selectTopic(topicId);
        return;
      }

      // 3. Subtopic selector button
      const subtopicBtn = e.target.closest('[data-subtopic-name]');
      if (subtopicBtn) {
        const subtopicName = subtopicBtn.getAttribute('data-subtopic-name');
        this.selectSubtopic(subtopicName === 'all' ? null : subtopicName);
        return;
      }

      // 4. Tag Badge Click
      const tagBadge = e.target.closest('[data-tag-keyword]');
      if (tagBadge) {
        const keyword = tagBadge.getAttribute('data-tag-keyword');
        this.searchByKeyword(keyword);
        return;
      }

      // 5. Reset button in Empty State
      const resetBtn = e.target.closest('[data-formula-reset]');
      if (resetBtn) {
        this.resetFilters();
        return;
      }
    });
  },

  renderFilterChips() {
    if (!this.dom.filterChips) return;

    const chips = [
      { id: 'all', label: 'ALL DOMAINS' },
      ...FORMULA_TOPICS.map(t => ({ id: t.id, label: t.shortCode || t.title.toUpperCase() }))
    ];

    this.dom.filterChips.innerHTML = chips.map(chip => `
      <button type="button" class="filter-chip ${MATH_OS_STATE.formulas.activeFilter === chip.id ? 'is-active' : ''}" data-filter-id="${chip.id}" role="tab">
        ${chip.label}
      </button>
    `).join('');

    // Attach click listeners to chips
    const chipBtns = this.dom.filterChips.querySelectorAll('.filter-chip');
    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterId = btn.getAttribute('data-filter-id');
        MATH_OS_STATE.formulas.activeFilter = filterId;
        
        if (filterId !== 'all') {
          MATH_OS_STATE.formulas.selectedTopicId = filterId;
          MATH_OS_STATE.formulas.selectedSubtopic = null;
        } else {
          MATH_OS_STATE.formulas.selectedTopicId = null;
          MATH_OS_STATE.formulas.selectedSubtopic = null;
        }

        chipBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        this.render();
      });
    });
  },

  selectTopic(topicId) {
    MATH_OS_STATE.formulas.selectedTopicId = topicId;
    MATH_OS_STATE.formulas.selectedSubtopic = null;
    MATH_OS_STATE.formulas.activeFilter = topicId;
    MATH_OS_STATE.formulas.searchQuery = '';
    if (this.dom.searchInput) this.dom.searchInput.value = '';
    if (this.dom.searchClear) this.dom.searchClear.classList.remove('is-visible');
    this.updateFilterChipsUI();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  selectSubtopic(subtopicName) {
    MATH_OS_STATE.formulas.selectedSubtopic = subtopicName;
    this.render();
  },

  searchByKeyword(keyword) {
    MATH_OS_STATE.formulas.searchQuery = keyword;
    if (this.dom.searchInput) {
      this.dom.searchInput.value = keyword;
      this.dom.searchInput.focus();
    }
    if (this.dom.searchClear) {
      this.dom.searchClear.classList.add('is-visible');
    }
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  resetFilters() {
    MATH_OS_STATE.formulas.searchQuery = '';
    MATH_OS_STATE.formulas.selectedTopicId = null;
    MATH_OS_STATE.formulas.selectedSubtopic = null;
    MATH_OS_STATE.formulas.activeFilter = 'all';
    if (this.dom.searchInput) this.dom.searchInput.value = '';
    if (this.dom.searchClear) this.dom.searchClear.classList.remove('is-visible');
    this.updateFilterChipsUI();
    this.render();
  },

  updateFilterChipsUI() {
    if (!this.dom.filterChips) return;
    const chips = this.dom.filterChips.querySelectorAll('.filter-chip');
    chips.forEach(c => {
      if (c.getAttribute('data-filter-id') === MATH_OS_STATE.formulas.activeFilter) {
        c.classList.add('is-active');
      } else {
        c.classList.remove('is-active');
      }
    });
  },

  copyFormula(text, buttonEl) {
    if (!text || !buttonEl) return;

    const performFeedback = () => {
      const originalHTML = buttonEl.innerHTML;
      buttonEl.innerHTML = `
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>Copied ✓</span>
      `;
      buttonEl.classList.add('is-copied');

      setTimeout(() => {
        buttonEl.innerHTML = originalHTML;
        buttonEl.classList.remove('is-copied');
      }, 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(performFeedback)
        .catch(() => this.fallbackCopy(text, performFeedback));
    } else {
      this.fallbackCopy(text, performFeedback);
    }
  },

  fallbackCopy(text, callback) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  },

  render() {
    const state = MATH_OS_STATE.formulas;
    const query = (state.searchQuery || '').trim().toLowerCase();

    // 1. Check if Search is Active
    if (query.length > 0) {
      this.renderSearchResults(query);
      return;
    }

    // 2. Check if specific Topic is selected
    if (state.selectedTopicId) {
      this.renderTopicDetail(state.selectedTopicId, state.selectedSubtopic);
      return;
    }

    // 3. Otherwise, render Root Topics Grid
    this.renderTopicsGrid();
  },

  renderTopicsGrid() {
    const topics = FORMULA_TOPICS;
    const allFormulas = MATH_OS_STATE.formulas.items;

    // Update Breadcrumbs
    if (this.dom.breadcrumbs) {
      this.dom.breadcrumbs.innerHTML = `
        <span class="breadcrumb-link" data-view-target="home">MATH/OS</span>
        <span aria-hidden="true">/</span>
        <span class="active-crumb">FORMULAS</span>
      `;
    }

    // Update Titles & Buttons
    if (this.dom.title) this.dom.title.textContent = 'FORMULA LIBRARY';
    if (this.dom.subtitle) {
      this.dom.subtitle.textContent = `Structured reference catalog across ${topics.length} mathematical and engineering disciplines.`;
    }
    if (this.dom.headerBtnText) this.dom.headerBtnText.textContent = 'Back to Overview';
    if (this.dom.countBadge) this.dom.countBadge.textContent = `${topics.length} DISCIPLINES`;

    // Status Bar
    const totalFormulas = allFormulas.length;
    if (this.dom.resultsCount) {
      this.dom.resultsCount.innerHTML = `Index: <strong>${topics.length}</strong> Topics · <strong>${totalFormulas}</strong> Formulas Cataloged`;
    }
    if (this.dom.viewToggleArea) {
      this.dom.viewToggleArea.innerHTML = '';
    }

    // Render Grid Cards
    const gridHTML = `
      <div class="formula-library-grid">
        ${topics.map(topic => {
          const topicFormulas = allFormulas.filter(f => 
            (f.topicId === topic.id) || (f.topic && f.topic.toLowerCase() === topic.title.toLowerCase())
          );
          const sampleEquation = topic.sampleEquation || (topicFormulas[0] ? topicFormulas[0].formula : '');
          return `
            <article class="formula-module-card" data-topic-id="${topic.id}" tabindex="0" role="button" aria-label="Browse ${topic.title}">
              <div class="module-header">
                <div>
                  <h3 class="module-title">${topic.title}</h3>
                  <p class="module-desc">${topic.description || ''}</p>
                </div>
                <span class="module-code">${topic.code}</span>
              </div>
              <div class="formula-equation-box" style="font-size: 0.8125rem; padding: 10px 12px;">
                ${this.escapeHTML(sampleEquation)}
              </div>
              <div class="module-meta-stats">
                <span class="module-meta-pill"><strong>${topic.subtopics.length}</strong> subtopics</span>
                <span>·</span>
                <span class="module-meta-pill"><strong>${topicFormulas.length}</strong> formulas</span>
              </div>
              <ul class="module-topics-list">
                ${topic.subtopics.slice(0, 4).map(sub => `<li class="module-topic-tag">${sub}</li>`).join('')}
                ${topic.subtopics.length > 4 ? `<li class="module-topic-tag">+${topic.subtopics.length - 4} more</li>` : ''}
              </ul>
            </article>
          `;
        }).join('')}
      </div>
    `;

    if (this.dom.contentArea) {
      this.dom.contentArea.innerHTML = gridHTML;
    }
  },

  renderTopicDetail(topicId, selectedSubtopic) {
    const topic = FORMULA_TOPICS.find(t => t.id === topicId);
    if (!topic) {
      this.resetFilters();
      return;
    }

    const allFormulas = MATH_OS_STATE.formulas.items;
    let topicFormulas = allFormulas.filter(f => 
      (f.topicId === topicId) || (f.topic && f.topic.toLowerCase() === topic.title.toLowerCase())
    );

    if (selectedSubtopic) {
      topicFormulas = topicFormulas.filter(f => 
        (f.subtopic && f.subtopic.toLowerCase() === selectedSubtopic.toLowerCase())
      );
    }

    // Update Breadcrumbs
    if (this.dom.breadcrumbs) {
      this.dom.breadcrumbs.innerHTML = `
        <span class="breadcrumb-link" data-view-target="home">MATH/OS</span>
        <span aria-hidden="true">/</span>
        <span class="breadcrumb-link" id="crumbToFormulas">FORMULAS</span>
        <span aria-hidden="true">/</span>
        ${selectedSubtopic ? `
          <span class="breadcrumb-link" id="crumbToTopic">${topic.title.toUpperCase()}</span>
          <span aria-hidden="true">/</span>
          <span class="active-crumb">${selectedSubtopic.toUpperCase()}</span>
        ` : `
          <span class="active-crumb">${topic.title.toUpperCase()}</span>
        `}
      `;

      // Attach breadcrumb listeners
      const crumbFormulas = document.getElementById('crumbToFormulas');
      if (crumbFormulas) {
        crumbFormulas.addEventListener('click', () => this.resetFilters());
      }
      const crumbTopic = document.getElementById('crumbToTopic');
      if (crumbTopic) {
        crumbTopic.addEventListener('click', () => this.selectSubtopic(null));
      }
    }

    // Update Titles & Buttons
    if (this.dom.title) this.dom.title.textContent = `${topic.title.toUpperCase()}`;
    if (this.dom.subtitle) {
      this.dom.subtitle.textContent = topic.description || `Formulas and analytical properties for ${topic.title}.`;
    }
    if (this.dom.headerBtnText) this.dom.headerBtnText.textContent = 'Back to Domains';
    if (this.dom.countBadge) this.dom.countBadge.textContent = `${topic.code}`;

    // Status Bar
    if (this.dom.resultsCount) {
      this.dom.resultsCount.innerHTML = `Showing <strong>${topicFormulas.length}</strong> formulas in <strong>${topic.title}</strong>${selectedSubtopic ? ` · <em>${selectedSubtopic}</em>` : ''}`;
    }
    if (this.dom.viewToggleArea) {
      this.dom.viewToggleArea.innerHTML = `
        <button type="button" class="btn-secondary" id="btnBackToTopics" style="padding: 4px 10px; font-size: 0.75rem;">
          ← All Topics
        </button>
      `;
      const btnBack = document.getElementById('btnBackToTopics');
      if (btnBack) btnBack.addEventListener('click', () => this.resetFilters());
    }

    // Subtopic Selector Navigation Bar
    const subtopicBarHTML = `
      <div class="subtopics-nav-bar" role="tablist">
        <button type="button" class="subtopic-btn ${!selectedSubtopic ? 'is-active' : ''}" data-subtopic-name="all">
          All (${allFormulas.filter(f => (f.topicId === topicId) || (f.topic && f.topic.toLowerCase() === topic.title.toLowerCase())).length})
        </button>
        ${topic.subtopics.map(sub => {
          const count = allFormulas.filter(f => 
            ((f.topicId === topicId) || (f.topic && f.topic.toLowerCase() === topic.title.toLowerCase())) &&
            (f.subtopic && f.subtopic.toLowerCase() === sub.toLowerCase())
          ).length;
          return `
            <button type="button" class="subtopic-btn ${selectedSubtopic === sub ? 'is-active' : ''}" data-subtopic-name="${sub}">
              ${sub} ${count > 0 ? `(${count})` : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;

    // Render Formula Cards
    const formulasHTML = topicFormulas.length > 0 ? `
      <div class="formula-cards-grid">
        ${topicFormulas.map(formula => this.createFormulaCardHTML(formula)).join('')}
      </div>
    ` : this.createEmptyStateHTML(`No formulas cataloged under this subtopic yet.`);

    if (this.dom.contentArea) {
      this.dom.contentArea.innerHTML = subtopicBarHTML + formulasHTML;
    }
  },

  renderSearchResults(query) {
    const terms = query.split(/\s+/).filter(Boolean);
    const allFormulas = MATH_OS_STATE.formulas.items;
    
    const results = allFormulas.filter(item => {
      const targetStr = [
        item.title,
        item.formula,
        item.description,
        item.subtopic,
        item.topic,
        ...(item.tags || [])
      ].join(' ').toLowerCase();

      return terms.every(term => targetStr.includes(term));
    });

    // Update Breadcrumbs
    if (this.dom.breadcrumbs) {
      this.dom.breadcrumbs.innerHTML = `
        <span class="breadcrumb-link" data-view-target="home">MATH/OS</span>
        <span aria-hidden="true">/</span>
        <span class="breadcrumb-link" id="crumbToFormulas">FORMULAS</span>
        <span aria-hidden="true">/</span>
        <span class="active-crumb">SEARCH: "${this.escapeHTML(query)}"</span>
      `;
      const crumbFormulas = document.getElementById('crumbToFormulas');
      if (crumbFormulas) {
        crumbFormulas.addEventListener('click', () => this.resetFilters());
      }
    }

    if (this.dom.title) this.dom.title.textContent = 'SEARCH RESULTS';
    if (this.dom.subtitle) {
      this.dom.subtitle.textContent = `Search matches for query keyword "${query}".`;
    }
    if (this.dom.headerBtnText) this.dom.headerBtnText.textContent = 'Clear Search';
    if (this.dom.countBadge) this.dom.countBadge.textContent = `${results.length} MATCHES`;

    // Status Bar
    if (this.dom.resultsCount) {
      this.dom.resultsCount.innerHTML = `Found <strong>${results.length}</strong> formulas matching "<strong>${this.escapeHTML(query)}</strong>"`;
    }
    if (this.dom.viewToggleArea) {
      this.dom.viewToggleArea.innerHTML = `
        <button type="button" class="btn-secondary" id="btnClearSearchAction" style="padding: 4px 10px; font-size: 0.75rem;">
          Reset Search
        </button>
      `;
      const btnClear = document.getElementById('btnClearSearchAction');
      if (btnClear) btnClear.addEventListener('click', () => this.resetFilters());
    }

    if (results.length === 0) {
      if (this.dom.contentArea) {
        this.dom.contentArea.innerHTML = this.createEmptyStateHTML(`No formulas matched your search query "${this.escapeHTML(query)}". Try searching for trigonometric functions, integrals, matrices, or calculus laws.`);
      }
    } else {
      if (this.dom.contentArea) {
        this.dom.contentArea.innerHTML = `
          <div class="formula-cards-grid">
            ${results.map(formula => this.createFormulaCardHTML(formula)).join('')}
          </div>
        `;
      }
    }
  },

  createFormulaCardHTML(formula) {
    const id = formula._id || formula.id || 'form';
    return `
      <article class="formula-card" id="formula-${id}">
        <div class="formula-card-header">
          <div>
            <div class="formula-card-path">${formula.topic} · ${formula.subtopic}</div>
            <h3 class="formula-card-title">${formula.title}</h3>
          </div>
        </div>

        <div class="formula-equation-box" aria-label="Equation">
          ${this.escapeHTML(formula.formula)}
        </div>

        <p class="formula-description">
          ${this.escapeHTML(formula.description || '')}
        </p>

        ${formula.example ? `
          <div class="formula-example-box">
            <span class="formula-example-label">EXAMPLE / APPLICATION</span>
            <span>${this.escapeHTML(formula.example)}</span>
          </div>
        ` : ''}

        <div class="formula-card-footer">
          <div class="formula-tags-list" aria-label="Tags">
            ${(formula.tags || []).map(tag => `
              <span class="formula-tag-badge" data-tag-keyword="${tag}" title="Filter by tag: ${tag}">#${tag}</span>
            `).join('')}
          </div>

          <button type="button" class="btn-copy-formula" data-copy-formula="${this.escapeAttr(formula.formula)}" title="Copy formula to clipboard">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Formula</span>
          </button>
        </div>
      </article>
    `;
  },

  createEmptyStateHTML(message) {
    return `
      <div class="formula-empty-state">
        <div class="empty-state-icon">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="empty-state-title">No Formulas Found</h3>
        <p class="empty-state-desc">${message}</p>
        <button type="button" class="btn-primary" data-formula-reset="true" style="padding: 8px 18px; font-size: 0.8125rem;">
          Reset Filters
        </button>
      </div>
    `;
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  escapeAttr(str) {
    if (!str) return '';
    return String(str)
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

/* ==========================================================================
   7. NAVIGATION & GLOBAL EVENT CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('[data-view-target]');
  const viewSections = document.querySelectorAll('[data-view-section]');
  const brandLogo = document.getElementById('brandLogo');

  /**
   * Switches the active view section
   */
  function switchView(viewId) {
    if (!viewId) return;

    const targetSection = document.querySelector(`[data-view-section="${viewId}"]`);
    if (!targetSection) return;

    MATH_OS_STATE.currentView = viewId;

    // 1. Update View Visibility
    viewSections.forEach(section => {
      if (section.getAttribute('data-view-section') === viewId) {
        section.classList.add('is-active');
      } else {
        section.classList.remove('is-active');
      }
    });

    // 2. Update Top Navigation Active States
    navItems.forEach(item => {
      const target = item.getAttribute('data-view-target');
      if (target === viewId) {
        item.classList.add('is-active');
        item.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      }
    });

    // 3. Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4. Update Document Title
    const viewTitleMap = {
      home: 'MATH/OS · Mathematical Utility',
      normal: 'NORMAL · Basic Calculator · MATH/OS',
      calculator: 'CALCULATOR · Scientific Calculator · MATH/OS',
      formulas: 'FORMULAS · Formula Library · MATH/OS'
    };

    if (viewTitleMap[viewId]) {
      document.title = viewTitleMap[viewId];
    }
  }

  // Bind click event to navigation triggers
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view-target');
      switchView(targetView);
    });
  });

  // Brand click returns to Home
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('home');
    });
  }

  // Initialize Calculator, History, and Formula Controllers
  NormalCalcController.init();
  SciCalcController.init();
  HistoryController.init();
  FormulaLibraryController.init();

  // Asynchronous Backend Health Status Check
  async function checkBackendHealth() {
    const beacon = document.getElementById('systemStatusBeacon');
    const statusText = document.getElementById('systemStatusText');

    try {
      const res = await apiRequest('/health');
      if (res && res.success) {
        MATH_OS_STATE.apiStatus = 'online';
        if (beacon) {
          beacon.className = 'status-beacon is-online';
        }
        if (statusText) {
          statusText.textContent = 'API ONLINE';
        }
      } else {
        throw new Error('API offline');
      }
    } catch {
      MATH_OS_STATE.apiStatus = 'offline';
      if (beacon) {
        beacon.className = 'status-beacon is-offline';
      }
      if (statusText) {
        statusText.textContent = 'LOCAL READY';
      }
    }
  }

  checkBackendHealth();

  // ==========================================
  // KEYBOARD SUPPORT CONTROLLER
  // ==========================================
  window.addEventListener('keydown', (e) => {
    // Ignore input if user is in an input field
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      return;
    }

    // Ignore if history drawer is open
    if (HistoryController.isOpen() && e.key !== 'Escape') {
      return;
    }

    const currentView = MATH_OS_STATE.currentView;

    // 1. View Navigation shortcuts when on Overview or Formulas
    if (currentView === 'home' || currentView === 'formulas') {
      if (e.key === '0' || e.key === 'Escape') switchView('home');
      else if (e.key === '1') switchView('normal');
      else if (e.key === '2') switchView('calculator');
      else if (e.key === '3') switchView('formulas');
      return;
    }

    // 2. Normal Calculator Keyboard Handlers
    if (currentView === 'normal') {
      if (e.key >= '0' && e.key <= '9') {
        NormalCalcController.inputDigit(e.key);
      } else if (e.key === '.') {
        NormalCalcController.inputDecimal();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        NormalCalcController.inputOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        NormalCalcController.calculate();
      } else if (e.key === 'Backspace') {
        NormalCalcController.deleteLast();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        NormalCalcController.clear();
      } else if (e.key === '%') {
        NormalCalcController.calculatePercent();
      }
      return;
    }

    // 3. Scientific Calculator Keyboard Handlers
    if (currentView === 'calculator') {
      if (e.key >= '0' && e.key <= '9') {
        SciCalcController.inputDigit(e.key);
      } else if (e.key === '.') {
        SciCalcController.inputDecimal();
      } else if (['+', '-', '*', '/', '^'].includes(e.key)) {
        SciCalcController.inputOperator(e.key);
      } else if (e.key === '(' || e.key === ')') {
        SciCalcController.inputParen(e.key);
      } else if (e.key === '!') {
        SciCalcController.inputFact();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        SciCalcController.calculate();
      } else if (e.key === 'Backspace') {
        SciCalcController.deleteLast();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        SciCalcController.clear();
      }
      return;
    }
  });

  // Tactile button click feedback
  const previewButtons = document.querySelectorAll('.calc-btn');
  previewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.transform = 'scale(0.96)';
      setTimeout(() => {
        btn.style.transform = '';
      }, 100);
    });
  });

  // Check initial hash route
  const initialHash = window.location.hash.replace('#', '').toLowerCase();
  if (['home', 'normal', 'calculator', 'formulas'].includes(initialHash)) {
    switchView(initialHash);
  } else {
    switchView('home');
  }
});
