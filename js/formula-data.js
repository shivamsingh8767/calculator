/**
 * MATH/OS - Formula Knowledge Dataset
 * Structured for future MongoDB/Express API synchronization
 * 
 * Schema:
 * {
 *   id: string (stable unique identifier),
 *   topicId: string,
 *   topic: string,
 *   subtopic: string,
 *   title: string,
 *   formula: string,
 *   description: string,
 *   tags: string[],
 *   example?: string
 * }
 */

export const FORMULA_TOPICS = [
  {
    id: "algebra",
    code: "01",
    title: "Algebra",
    description: "Polynomials, equations, indices, logarithms, and combinatorial series.",
    subtopics: [
      "Basic Algebra",
      "Laws of Indices",
      "Logarithms",
      "Quadratic Equations",
      "Sequences & Series",
      "Binomial Theorem",
      "Permutations & Combinations"
    ]
  },
  {
    id: "trigonometry",
    code: "02",
    title: "Trigonometry",
    description: "Circular functions, angle sum identities, and inverse trigonometric mappings.",
    subtopics: [
      "Basic Identities",
      "Compound Angles",
      "Multiple Angles",
      "Half Angles",
      "Product to Sum",
      "Sum to Product",
      "Inverse Trigonometry",
      "General Solutions"
    ]
  },
  {
    id: "coordinate-geometry",
    code: "03",
    title: "Coordinate Geometry",
    description: "Cartesian geometry, conic sections, circles, and locus equations.",
    subtopics: [
      "Straight Lines",
      "Distance & Section Formula",
      "Circle",
      "Parabola",
      "Ellipse",
      "Hyperbola"
    ]
  },
  {
    id: "differential-calculus",
    code: "04",
    title: "Differential Calculus",
    description: "Limits, rates of change, differentiation rules, and curve optimization.",
    subtopics: [
      "Limits",
      "Basic Differentiation",
      "Product Rule",
      "Quotient Rule",
      "Chain Rule",
      "Higher Order Derivatives",
      "Applications of Derivatives"
    ]
  },
  {
    id: "integral-calculus",
    code: "05",
    title: "Integral Calculus",
    description: "Antiderivatives, integration techniques, definite integrals, and area under curves.",
    subtopics: [
      "Basic Integration",
      "Standard Integrals",
      "Integration by Substitution",
      "Integration by Parts",
      "Definite Integrals",
      "Properties of Definite Integrals"
    ]
  },
  {
    id: "differential-equations",
    code: "06",
    title: "Differential Equations",
    description: "Ordinary and linear differential equations, integrating factors, and ODE systems.",
    subtopics: [
      "First Order Differential Equations",
      "Variable Separable",
      "Linear Differential Equations",
      "Exact Differential Equations",
      "Higher Order Differential Equations"
    ]
  },
  {
    id: "matrices",
    code: "07",
    title: "Matrices & Determinants",
    description: "Linear transformations, matrix inversions, eigenvalues, and rank analysis.",
    subtopics: [
      "Matrix Operations",
      "Determinants",
      "Adjoint",
      "Inverse of Matrix",
      "Rank",
      "Eigenvalues",
      "Eigenvectors"
    ]
  },
  {
    id: "vector-algebra",
    code: "08",
    title: "Vector Algebra",
    description: "Spatial vectors, dot and cross products, directional derivatives, and vector calculus.",
    subtopics: [
      "Vector Basics",
      "Dot Product",
      "Cross Product",
      "Scalar Triple Product",
      "Vector Equations",
      "Gradient",
      "Divergence",
      "Curl"
    ]
  },
  {
    id: "probability-statistics",
    code: "09",
    title: "Probability & Statistics",
    description: "Statistical distributions, expectation, variance, conditional probability, and Bayes rule.",
    subtopics: [
      "Basic Probability",
      "Conditional Probability",
      "Bayes Theorem",
      "Random Variables",
      "Mean",
      "Variance",
      "Standard Deviation",
      "Probability Distributions"
    ]
  },
  {
    id: "complex-numbers",
    code: "10",
    title: "Complex Numbers",
    description: "Argand plane, polar representation, Euler's formula, and root calculations.",
    subtopics: [
      "Basic Complex Numbers",
      "Modulus & Argument",
      "Polar Form",
      "Euler Form",
      "De Moivre's Theorem",
      "Roots of Complex Numbers"
    ]
  },
  {
    id: "fourier-series",
    code: "11",
    title: "Fourier Series",
    description: "Harmonic decomposition of periodic waveforms, orthogonality, and half-range series.",
    subtopics: [
      "Fourier Coefficients",
      "Fourier Series",
      "Even & Odd Functions",
      "Half Range Series"
    ]
  },
  {
    id: "laplace-transform",
    code: "12",
    title: "Laplace Transform",
    description: "s-domain continuous transform pairs, shifting theorems, and IVP solutions.",
    subtopics: [
      "Basic Laplace Transforms",
      "Properties",
      "Inverse Laplace Transform",
      "Shifting Theorems",
      "Derivatives",
      "Applications to Differential Equations"
    ]
  },
  {
    id: "numerical-methods",
    code: "13",
    title: "Numerical Methods",
    description: "Iterative root finding, numerical integration, error quantification, and interpolation.",
    subtopics: [
      "Errors",
      "Bisection Method",
      "Newton-Raphson Method",
      "Secant Method",
      "Newton Forward Interpolation",
      "Newton Backward Interpolation",
      "Numerical Integration"
    ]
  },
  {
    id: "engineering-math",
    code: "14",
    title: "Engineering Mathematics",
    description: "Applied higher mathematics encompassing core foundational engineering syllabi.",
    subtopics: [
      "Engineering Mathematics I",
      "Engineering Mathematics II",
      "Engineering Mathematics III"
    ]
  }
];

export const FORMULAS_DATA = [
  // ==========================================
  // 01. ALGEBRA
  // ==========================================
  {
    id: "alg-quad-formula",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Quadratic Equations",
    title: "Quadratic Formula",
    formula: "x = (-b ± √(b² - 4ac)) / (2a)",
    description: "Yields the roots of any quadratic equation of the standard form ax² + bx + c = 0.",
    tags: ["quadratic", "roots", "discriminant", "algebra"],
    example: "For x² - 5x + 6 = 0 (a=1, b=-5, c=6): x = (5 ± √(25 - 24))/2 = (5 ± 1)/2 ⇒ x = 3 or x = 2."
  },
  {
    id: "alg-indices-mult",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Laws of Indices",
    title: "Product of Powers",
    formula: "aᵐ · aⁿ = aᵐ⁺ⁿ",
    description: "When multiplying terms with the same base, their exponents are added together.",
    tags: ["indices", "exponents", "powers", "multiplication"],
    example: "2³ · 2⁴ = 2³⁺⁴ = 2⁷ = 128."
  },
  {
    id: "alg-indices-div",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Laws of Indices",
    title: "Quotient of Powers",
    formula: "aᵐ / aⁿ = aᵐ⁻ⁿ",
    description: "When dividing terms with the same non-zero base, the divisor exponent is subtracted.",
    tags: ["indices", "exponents", "powers", "division"],
    example: "5⁵ / 5² = 5⁵⁻² = 5³ = 125."
  },
  {
    id: "alg-indices-power",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Laws of Indices",
    title: "Power of a Power",
    formula: "(aᵐ)ⁿ = aᵐⁿ",
    description: "Raising an exponential expression to a power multiplies the exponents.",
    tags: ["indices", "powers", "exponents"],
    example: "(3²)³ = 3²ˣ³ = 3⁶ = 729."
  },
  {
    id: "alg-log-product",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Logarithms",
    title: "Logarithm Product Rule",
    formula: "log_b(xy) = log_b(x) + log_b(y)",
    description: "The logarithm of a product equals the sum of the logarithms of the factors.",
    tags: ["log", "logarithm", "product", "algebra"],
    example: "log₁₀(100 · 1000) = log₁₀(100) + log₁₀(1000) = 2 + 3 = 5."
  },
  {
    id: "alg-log-quotient",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Logarithms",
    title: "Logarithm Quotient Rule",
    formula: "log_b(x / y) = log_b(x) - log_b(y)",
    description: "The logarithm of a quotient equals the difference of the numerator and denominator logarithms.",
    tags: ["log", "logarithm", "quotient", "algebra"],
    example: "log₂(16 / 4) = log₂(16) - log₂(4) = 4 - 2 = 2."
  },
  {
    id: "alg-log-change-base",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Logarithms",
    title: "Change of Base Formula",
    formula: "log_b(x) = ln(x) / ln(b) = log_k(x) / log_k(b)",
    description: "Converts logarithms between arbitrary mathematical bases.",
    tags: ["log", "change of base", "natural log"],
    example: "log₂(8) = ln(8) / ln(2) = 2.0794 / 0.6931 = 3."
  },
  {
    id: "alg-ap-nth",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Sequences & Series",
    title: "Arithmetic Progression (n-th Term)",
    formula: "aₙ = a + (n - 1)d",
    description: "Calculates the n-th value in an arithmetic sequence with first term a and common difference d.",
    tags: ["AP", "arithmetic progression", "series", "sequence"],
    example: "For a = 3, d = 4: a₁₀ = 3 + (10 - 1)·4 = 3 + 36 = 39."
  },
  {
    id: "alg-ap-sum",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Sequences & Series",
    title: "Sum of First n Terms (AP)",
    formula: "Sₙ = (n / 2) · [2a + (n - 1)d] = (n / 2) · (a + l)",
    description: "The total summation of the first n terms of an arithmetic progression.",
    tags: ["AP", "summation", "series"],
    example: "Sum of first 10 integers (a=1, d=1): S₁₀ = (10/2)·(1 + 10) = 5·11 = 55."
  },
  {
    id: "alg-gp-nth",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Sequences & Series",
    title: "Geometric Progression (n-th Term)",
    formula: "aₙ = a · rⁿ⁻¹",
    description: "Finds the n-th term of a geometric sequence with initial term a and common ratio r.",
    tags: ["GP", "geometric progression", "series", "sequence"],
    example: "For a = 2, r = 3: a₅ = 2 · 3⁴ = 2 · 81 = 162."
  },
  {
    id: "alg-gp-sum",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Sequences & Series",
    title: "Sum of Geometric Series",
    formula: "Sₙ = a(1 - rⁿ) / (1 - r)  [r ≠ 1]",
    description: "Calculates the finite sum of n terms in a geometric sequence.",
    tags: ["GP", "geometric series", "sum"],
    example: "For a = 1, r = 2, n = 4: S₄ = 1·(1 - 16)/(1 - 2) = -15 / -1 = 15."
  },
  {
    id: "alg-binomial-gen",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Binomial Theorem",
    title: "Binomial Theorem Expansion",
    formula: "(a + b)ⁿ = ∑ ₍r=₀₎ⁿ ⁿCᵣ · aⁿ⁻ʳ · bʳ",
    description: "Algebraic expansion of powers of a binomial sum using combination coefficients.",
    tags: ["binomial", "combinations", "expansion"],
    example: "(x + y)² = ²C₀ x² + ²C₁ xy + ²C₂ y² = x² + 2xy + y²."
  },
  {
    id: "alg-perm-comb",
    topicId: "algebra",
    topic: "Algebra",
    subtopic: "Permutations & Combinations",
    title: "Permutations & Combinations",
    formula: "ⁿPᵣ = n! / (n - r)!   |   ⁿCᵣ = n! / [r!(n - r)!]",
    description: "Permutations measure ordered arrangements; combinations measure unordered selections.",
    tags: ["combinations", "permutations", "factorial", "counting"],
    example: "⁵C₂ = 5! / (2! · 3!) = 120 / (2 · 6) = 10."
  },

  // ==========================================
  // 02. TRIGONOMETRY
  // ==========================================
  {
    id: "trig-pythagorean-1",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Basic Identities",
    title: "Pythagorean Identity (Sine & Cosine)",
    formula: "sin²(θ) + cos²(θ) = 1",
    description: "Primary trigonometric identity deriving directly from the unit circle geometry.",
    tags: ["sin", "cos", "pythagorean", "unit circle", "identity"],
    example: "For θ = 30°: sin(30°) = 0.5, cos(30°) = √3/2. (0.5)² + (√3/2)² = 0.25 + 0.75 = 1."
  },
  {
    id: "trig-pythagorean-2",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Basic Identities",
    title: "Pythagorean Identity (Secant & Tangent)",
    formula: "1 + tan²(θ) = sec²(θ)",
    description: "Relates the tangent and secant functions across real angle domains.",
    tags: ["tan", "sec", "identity"],
    example: "For θ = 45°: 1 + tan²(45°) = 1 + 1² = 2 = (√2)² = sec²(45°)."
  },
  {
    id: "trig-pythagorean-3",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Basic Identities",
    title: "Pythagorean Identity (Cotangent & Cosecant)",
    formula: "1 + cot²(θ) = csc²(θ)",
    description: "Relates the cotangent and cosecant trigonometric ratios.",
    tags: ["cot", "csc", "identity"],
    example: "For θ = 45°: 1 + 1² = 2 = csc²(45°)."
  },
  {
    id: "trig-compound-sin-add",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Compound Angles",
    title: "Sine Addition Formula",
    formula: "sin(A + B) = sin(A)cos(B) + cos(A)sin(B)",
    description: "Expands the sine of the sum of two distinct angle measures.",
    tags: ["sin", "compound angle", "addition"],
    example: "sin(75°) = sin(45°+30°) = sin45°cos30° + cos45°sin30° = (√6 + √2)/4."
  },
  {
    id: "trig-compound-sin-sub",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Compound Angles",
    title: "Sine Subtraction Formula",
    formula: "sin(A - B) = sin(A)cos(B) - cos(A)sin(B)",
    description: "Expands the sine of the difference of two distinct angles.",
    tags: ["sin", "compound angle", "subtraction"],
    example: "sin(15°) = sin(45°-30°) = (√6 - √2)/4."
  },
  {
    id: "trig-compound-cos-add",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Compound Angles",
    title: "Cosine Addition Formula",
    formula: "cos(A + B) = cos(A)cos(B) - sin(A)sin(B)",
    description: "Calculates the cosine of an angle sum with opposite internal sign.",
    tags: ["cos", "compound angle", "addition"],
    example: "cos(60°+30°) = cos60°cos30° - sin60°sin30° = (1/2)(√3/2) - (√3/2)(1/2) = 0."
  },
  {
    id: "trig-compound-cos-sub",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Compound Angles",
    title: "Cosine Subtraction Formula",
    formula: "cos(A - B) = cos(A)cos(B) + sin(A)sin(B)",
    description: "Calculates the cosine of the difference of two angle measures.",
    tags: ["cos", "compound angle", "subtraction"],
    example: "cos(45°-45°) = cos²45° + sin²45° = 1 = cos(0°)."
  },
  {
    id: "trig-compound-tan-add",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Compound Angles",
    title: "Tangent Addition Formula",
    formula: "tan(A + B) = [tan(A) + tan(B)] / [1 - tan(A)tan(B)]",
    description: "Evaluates the tangent of compound angle sums.",
    tags: ["tan", "compound angle"],
    example: "tan(45°+45°) = (1 + 1) / (1 - 1) = 2/0 (undefined, as tan 90° is infinite)."
  },
  {
    id: "trig-double-sin",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Multiple Angles",
    title: "Double Angle (Sine)",
    formula: "sin(2θ) = 2 sin(θ) cos(θ)",
    description: "Expresses sine of double angle as product of single-angle sine and cosine.",
    tags: ["double angle", "sin"],
    example: "For θ = 30°: sin(60°) = 2 sin(30°) cos(30°) = 2 · (1/2) · (√3/2) = √3/2."
  },
  {
    id: "trig-double-cos",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Multiple Angles",
    title: "Double Angle (Cosine)",
    formula: "cos(2θ) = cos²(θ) - sin²(θ) = 2cos²(θ) - 1 = 1 - 2sin²(θ)",
    description: "Triple algebraic forms for expressing the cosine of a doubled angle.",
    tags: ["double angle", "cos"],
    example: "cos(60°) = 2cos²(30°) - 1 = 2(3/4) - 1 = 1.5 - 1 = 0.5."
  },
  {
    id: "trig-half-angles",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Half Angles",
    title: "Half Angle Formulas",
    formula: "sin(θ/2) = ±√[(1 - cos θ)/2]   |   cos(θ/2) = ±√[(1 + cos θ)/2]",
    description: "Computes half angle trigonometric values from known full cosine values.",
    tags: ["half angle", "roots"],
    example: "sin(45°) = √[(1 - cos 90°)/2] = √(1/2) = 1/√2."
  },
  {
    id: "trig-product-to-sum",
    topicId: "trigonometry",
    topic: "Trigonometry",
    subtopic: "Product to Sum",
    title: "Product to Sum Transformation",
    formula: "2 sin(A)cos(B) = sin(A + B) + sin(A - B)",
    description: "Transforms products of trigonometric functions into additive terms for simpler integration.",
    tags: ["product to sum", "calculus helper"]
  },

  // ==========================================
  // 03. COORDINATE GEOMETRY
  // ==========================================
  {
    id: "geo-distance-formula",
    topicId: "coordinate-geometry",
    topic: "Coordinate Geometry",
    subtopic: "Distance & Section Formula",
    title: "Distance Formula in 2D",
    formula: "d = √[(x₂ - x₁)² + (y₂ - y₁)²]",
    description: "Euclidean distance between points P(x₁, y₁) and Q(x₂, y₂) in the 2D Cartesian plane.",
    tags: ["distance", "cartesian", "euclidean"],
    example: "Between (0,0) and (3,4): d = √(3² + 4²) = √(9+16) = √25 = 5."
  },
  {
    id: "geo-line-slope-intercept",
    topicId: "coordinate-geometry",
    topic: "Coordinate Geometry",
    subtopic: "Straight Lines",
    title: "Slope-Intercept Form",
    formula: "y = mx + c   [where m = (y₂ - y₁) / (x₂ - x₁)]",
    description: "Standard equation of a non-vertical line with gradient m and y-intercept c.",
    tags: ["straight line", "gradient", "slope"],
    example: "For slope m = 2, intercept c = -1: y = 2x - 1."
  },
  {
    id: "geo-circle-std",
    topicId: "coordinate-geometry",
    topic: "Coordinate Geometry",
    subtopic: "Circle",
    title: "Standard Equation of a Circle",
    formula: "(x - h)² + (y - k)² = r²",
    description: "Equation of a circle centered at point (h, k) with radial distance r.",
    tags: ["circle", "conics", "radius"],
    example: "Circle at center (2, -3) with radius 5: (x - 2)² + (y + 3)² = 25."
  },
  {
    id: "geo-parabola-std",
    topicId: "coordinate-geometry",
    topic: "Coordinate Geometry",
    subtopic: "Parabola",
    title: "Standard Parabola",
    formula: "y² = 4ax   [Focus at (a, 0), Directrix x = -a]",
    description: "Right-opening parabola with vertex positioned at origin (0,0).",
    tags: ["parabola", "conics", "focus"],
    example: "For a = 2: y² = 8x with focus at (2,0)."
  },

  // ==========================================
  // 04. DIFFERENTIAL CALCULUS
  // ==========================================
  {
    id: "calc-diff-power",
    topicId: "differential-calculus",
    topic: "Differential Calculus",
    subtopic: "Basic Differentiation",
    title: "Power Rule of Differentiation",
    formula: "d/dx [xⁿ] = n · xⁿ⁻¹",
    description: "Differentiates polynomial monomial terms for all real exponents n.",
    tags: ["derivative", "power rule", "calculus"],
    example: "d/dx [x³] = 3x²;  d/dx [x⁻¹] = -1x⁻² = -1/x²."
  },
  {
    id: "calc-diff-sin",
    topicId: "differential-calculus",
    topic: "Differential Calculus",
    subtopic: "Basic Differentiation",
    title: "Derivative of Sine",
    formula: "d/dx [sin(x)] = cos(x)",
    description: "First derivative of the standard sine trigonometric function.",
    tags: ["derivative", "trig", "sine"],
    example: "Slope of sin(x) at x=0 is cos(0) = 1."
  },
  {
    id: "calc-diff-cos",
    topicId: "differential-calculus",
    topic: "Differential Calculus",
    subtopic: "Basic Differentiation",
    title: "Derivative of Cosine",
    formula: "d/dx [cos(x)] = -sin(x)",
    description: "First derivative of the standard cosine trigonometric function.",
    tags: ["derivative", "trig", "cosine"],
    example: "Slope of cos(x) at x=0 is -sin(0) = 0."
  },
  {
    id: "calc-diff-tan",
    topicId: "differential-calculus",
    topic: "Differential Calculus",
    subtopic: "Basic Differentiation",
    title: "Derivative of Tangent",
    formula: "d/dx [tan(x)] = sec²(x) = 1 + tan²(x)",
    description: "First derivative of the tangent function.",
    tags: ["derivative", "tan", "secant"]
  },
  {
    id: "calc-diff-exp",
    topicId: "differential-calculus",
    topic: "Differential Calculus",
    subtopic: "Basic Differentiation",
    title: "Derivative of Exponential e^x",
    formula: "d/dx [eˣ] = eˣ",
    description: "The exponential function is its own derivative everywhere on the real line.",
    tags: ["derivative", "exponential", "e"],
    example: "Rate of change of eˣ at x=2 is exactly e²."
  },
  {
    id: "calc-diff-ln",
    topicId: "differential-calculus",
    topic: "Differential Calculus",
    subtopic: "Basic Differentiation",
    title: "Derivative of Natural Logarithm",
    formula: "d/dx [ln(x)] = 1 / x   [x > 0]",
    description: "First derivative of the natural logarithm ln(x).",
    tags: ["derivative", "logarithm", "ln"],
    example: "Slope of ln(x) at x=5 is 1/5 = 0.2."
  },
  {
    id: "calc-diff-product-rule",
    topicId: "differential-calculus",
    topic: "Differential Calculus",
    subtopic: "Product Rule",
    title: "Product Rule",
    formula: "d/dx [u · v] = u · (dv/dx) + v · (du/dx) = u v' + v u'",
    description: "Calculates the derivative of the product of two differentiable functions.",
    tags: ["product rule", "derivative", "calculus"],
    example: "d/dx [x · sin(x)] = x · cos(x) + sin(x) · 1 = x cos(x) + sin(x)."
  },
  {
    id: "calc-diff-quotient-rule",
    topicId: "differential-calculus",
    topic: "Differential Calculus",
    subtopic: "Quotient Rule",
    title: "Quotient Rule",
    formula: "d/dx [u / v] = [v · (du/dx) - u · (dv/dx)] / v² = [v u' - u v'] / v²",
    description: "Differentiates a fraction containing differentiable numerator and denominator functions.",
    tags: ["quotient rule", "derivative", "fraction"],
    example: "d/dx [sin(x)/x] = [x cos(x) - sin(x)] / x²."
  },
  {
    id: "calc-diff-chain-rule",
    topicId: "differential-calculus",
    topic: "Differential Calculus",
    subtopic: "Chain Rule",
    title: "Chain Rule",
    formula: "dy/dx = (dy/du) · (du/dx)   or   d/dx [f(g(x))] = f'(g(x)) · g'(x)",
    description: "Fundamental rule for differentiating nested composite functions.",
    tags: ["chain rule", "composite functions", "derivative"],
    example: "d/dx [sin(3x²)] = cos(3x²) · d/dx[3x²] = 6x · cos(3x²)."
  },

  // ==========================================
  // 05. INTEGRAL CALCULUS
  // ==========================================
  {
    id: "calc-int-power",
    topicId: "integral-calculus",
    topic: "Integral Calculus",
    subtopic: "Basic Integration",
    title: "Power Rule of Integration",
    formula: "∫ xⁿ dx = (xⁿ⁺¹) / (n + 1) + C   [n ≠ -1]",
    description: "Primary antiderivative formula for polynomial power functions.",
    tags: ["integral", "antiderivative", "power rule"],
    example: "∫ x² dx = x³/3 + C;  ∫ 1 dx = x + C."
  },
  {
    id: "calc-int-inv",
    topicId: "integral-calculus",
    topic: "Integral Calculus",
    subtopic: "Basic Integration",
    title: "Integral of Reciprocal 1/x",
    formula: "∫ (1 / x) dx = ln|x| + C",
    description: "Antiderivative for the singular power term x⁻¹ yielding the natural log.",
    tags: ["integral", "reciprocal", "ln"],
    example: "∫₁ᵉ (1/x) dx = ln(e) - ln(1) = 1 - 0 = 1."
  },
  {
    id: "calc-int-sin",
    topicId: "integral-calculus",
    topic: "Integral Calculus",
    subtopic: "Standard Integrals",
    title: "Integral of Sine",
    formula: "∫ sin(x) dx = -cos(x) + C",
    description: "Antiderivative of the sine trigonometric function.",
    tags: ["integral", "sine", "trig"],
    example: "∫₀^(π/2) sin(x) dx = [-cos(π/2)] - [-cos(0)] = 0 - (-1) = 1."
  },
  {
    id: "calc-int-cos",
    topicId: "integral-calculus",
    topic: "Integral Calculus",
    subtopic: "Standard Integrals",
    title: "Integral of Cosine",
    formula: "∫ cos(x) dx = sin(x) + C",
    description: "Antiderivative of the cosine trigonometric function.",
    tags: ["integral", "cosine", "trig"],
    example: "∫₀^π cos(x) dx = sin(π) - sin(0) = 0 - 0 = 0."
  },
  {
    id: "calc-int-by-parts",
    topicId: "integral-calculus",
    topic: "Integral Calculus",
    subtopic: "Integration by Parts",
    title: "Integration by Parts",
    formula: "∫ u dv = u · v - ∫ v du",
    description: "Integrates products of functions by transferring differentiation to the u term.",
    tags: ["integration by parts", "product", "calculus"],
    example: "For ∫ x eˣ dx (u=x, dv=eˣ dx): ∫ x eˣ dx = x eˣ - ∫ eˣ dx = x eˣ - eˣ + C = eˣ(x - 1) + C."
  },

  // ==========================================
  // 06. DIFFERENTIAL EQUATIONS
  // ==========================================
  {
    id: "ode-linear-first-order",
    topicId: "differential-equations",
    topic: "Differential Equations",
    subtopic: "Linear Differential Equations",
    title: "First Order Linear ODE (Integrating Factor)",
    formula: "dy/dx + P(x)y = Q(x)   ⇒   y · I.F. = ∫ [Q(x) · I.F.] dx + C   [I.F. = e^(∫ P(x)dx)]",
    description: "Standard analytical solution technique for first order linear ordinary differential equations.",
    tags: ["ODE", "integrating factor", "linear"],
    example: "For dy/dx + 2y = 4: P(x)=2, I.F. = e^(2x). y e^(2x) = ∫ 4e^(2x) dx = 2e^(2x) + C ⇒ y = 2 + C e^(-2x)."
  },
  {
    id: "ode-separable",
    topicId: "differential-equations",
    topic: "Differential Equations",
    subtopic: "Variable Separable",
    title: "Separation of Variables",
    formula: "dy/dx = f(x)·g(y)   ⇒   ∫ [1 / g(y)] dy = ∫ f(x) dx + C",
    description: "Solves differential equations by isolating all y terms on one side and x terms on the other.",
    tags: ["ODE", "separable", "integration"],
    example: "dy/dx = x/y ⇒ ∫ y dy = ∫ x dx ⇒ y²/2 = x²/2 + C ⇒ y² - x² = K."
  },

  // ==========================================
  // 07. MATRICES & DETERMINANTS
  // ==========================================
  {
    id: "mat-det-2x2",
    topicId: "matrices",
    topic: "Matrices & Determinants",
    subtopic: "Determinants",
    title: "2×2 Determinant",
    formula: "det | a  b | = ad - bc\n    | c  d |",
    description: "Computes the scalar scaling factor (determinant) of a 2×2 square matrix.",
    tags: ["matrix", "determinant", "2x2", "linear algebra"],
    example: "det | 3  2 | = (3)(4) - (2)(1) = 12 - 2 = 10.\n    | 1  4 |"
  },
  {
    id: "mat-inv-2x2",
    topicId: "matrices",
    topic: "Matrices & Determinants",
    subtopic: "Inverse of Matrix",
    title: "Inverse of 2×2 Matrix",
    formula: "A⁻¹ = (1 / det(A)) · |  d  -b |\n                      | -c   a |   [det(A) ≠ 0]",
    description: "Calculates the multiplicative inverse matrix for non-singular 2×2 matrices.",
    tags: ["inverse", "matrix", "linear algebra"],
    example: "For A = | 4  7 | (det = 8 - 7 = 1): A⁻¹ = | 2 -7 |.\n        | 1  2 |                                 | -1  4 |"
  },
  {
    id: "mat-eigenvalues",
    topicId: "matrices",
    topic: "Matrices & Determinants",
    subtopic: "Eigenvalues",
    title: "Characteristic Equation (Eigenvalues)",
    formula: "det(A - λI) = 0",
    description: "Characteristic polynomial whose roots λ represent the scalar eigenvalues of linear operator A.",
    tags: ["eigenvalues", "characteristic equation", "linear algebra"]
  },

  // ==========================================
  // 08. VECTOR ALGEBRA
  // ==========================================
  {
    id: "vec-dot-product",
    topicId: "vector-algebra",
    topic: "Vector Algebra",
    subtopic: "Dot Product",
    title: "Dot (Scalar) Product",
    formula: "A · B = |A||B| cos(θ) = AₓBₓ + A_yB_y + A_zB_z",
    description: "Scalar projection product of two vectors yielding zero when orthogonal (θ = 90°).",
    tags: ["vector", "dot product", "scalar"],
    example: "For A = (1, 2, 3), B = (4, -1, 2): A · B = 1(4) + 2(-1) + 3(2) = 4 - 2 + 6 = 8."
  },
  {
    id: "vec-cross-product",
    topicId: "vector-algebra",
    topic: "Vector Algebra",
    subtopic: "Cross Product",
    title: "Cross (Vector) Product",
    formula: "A × B = |A||B| sin(θ) n̂ = det |  i   j   k  |\n                             | Aₓ  A_y A_z |\n                             | Bₓ  B_y B_z |",
    description: "Generates a vector orthogonal to both operands with magnitude equal to the spanned parallelogram area.",
    tags: ["vector", "cross product", "determinant", "orthogonal"]
  },
  {
    id: "vec-gradient",
    topicId: "vector-algebra",
    topic: "Vector Algebra",
    subtopic: "Gradient",
    title: "Gradient of a Scalar Field",
    formula: "∇f = (∂f/∂x) î + (∂f/∂y) ĵ + (∂f/∂z) k̂",
    description: "Vector pointing in the direction of greatest spatial rate of increase of scalar function f.",
    tags: ["gradient", "vector calculus", "del operator"]
  },

  // ==========================================
  // 09. PROBABILITY & STATISTICS
  // ==========================================
  {
    id: "prob-bayes-theorem",
    topicId: "probability-statistics",
    topic: "Probability & Statistics",
    subtopic: "Bayes Theorem",
    title: "Bayes' Theorem",
    formula: "P(A | B) = [P(B | A) · P(A)] / P(B)",
    description: "Calculates the posterior conditional probability of event A given evidence B.",
    tags: ["probability", "bayes", "conditional probability"],
    example: "Updates medical test diagnostic probability given known prior prevalence and true/false positive rates."
  },
  {
    id: "prob-variance-std",
    topicId: "probability-statistics",
    topic: "Probability & Statistics",
    subtopic: "Variance",
    title: "Variance and Standard Deviation",
    formula: "σ² = (1 / N) ∑ (xᵢ - μ)² = E[X²] - (E[X])²   |   σ = √(σ²)",
    description: "Measures statistical dispersion and spread of values around the arithmetic mean μ.",
    tags: ["variance", "standard deviation", "statistics", "dispersion"],
    example: "For data set {2, 4, 6}: Mean μ = 4. Variance σ² = [(2-4)² + (4-4)² + (6-4)²]/3 = (4 + 0 + 4)/3 = 8/3 ≈ 2.67."
  },

  // ==========================================
  // 10. COMPLEX NUMBERS
  // ==========================================
  {
    id: "cmpx-euler-formula",
    topicId: "complex-numbers",
    topic: "Complex Numbers",
    subtopic: "Euler Form",
    title: "Euler's Formula & Identity",
    formula: "e^(iθ) = cos(θ) + i sin(θ)   ⇒   e^(iπ) + 1 = 0",
    description: "Establishes the fundamental bridge between trigonometric functions and complex exponentials.",
    tags: ["euler", "complex", "trig", "exponential", "identity"],
    example: "For θ = π/2: e^(iπ/2) = cos(π/2) + i sin(π/2) = 0 + i(1) = i."
  },
  {
    id: "cmpx-de-moivre",
    topicId: "complex-numbers",
    topic: "Complex Numbers",
    subtopic: "De Moivre's Theorem",
    title: "De Moivre's Theorem",
    formula: "[r(cos θ + i sin θ)]ⁿ = rⁿ [cos(nθ) + i sin(nθ)]",
    description: "Computes integer powers and roots of complex numbers directly in polar coordinates.",
    tags: ["de moivre", "complex roots", "polar"],
    example: "(cos 30° + i sin 30°)³ = cos 90° + i sin 90° = 0 + i(1) = i."
  },

  // ==========================================
  // 11. FOURIER SERIES
  // ==========================================
  {
    id: "four-series-standard",
    topicId: "fourier-series",
    topic: "Fourier Series",
    subtopic: "Fourier Series",
    title: "Fourier Series Expansion (Period 2L)",
    formula: "f(x) = (a₀ / 2) + ∑ ₍n=₁₎^∞ [aₙ cos(nπx / L) + bₙ sin(nπx / L)]",
    description: "Decomposes any piecewise smooth periodic signal into an infinite sum of orthogonal harmonics.",
    tags: ["fourier series", "harmonics", "signal processing", "orthogonal"]
  },
  {
    id: "four-coeffs",
    topicId: "fourier-series",
    topic: "Fourier Series",
    subtopic: "Fourier Coefficients",
    title: "Euler-Fourier Coefficients",
    formula: "a₀ = (1/L) ∫₋_L^L f(x) dx\naₙ = (1/L) ∫₋_L^L f(x) cos(nπx / L) dx\nbₙ = (1/L) ∫₋_L^L f(x) sin(nπx / L) dx",
    description: "Integral formulas determining the individual harmonic weights of a Fourier series.",
    tags: ["fourier coefficients", "integrals"]
  },

  // ==========================================
  // 12. LAPLACE TRANSFORM
  // ==========================================
  {
    id: "lapl-def-basic",
    topicId: "laplace-transform",
    topic: "Laplace Transform",
    subtopic: "Basic Laplace Transforms",
    title: "Laplace Transform Definition",
    formula: "ℒ{f(t)} = F(s) = ∫₀^∞ e^(-st) · f(t) dt",
    description: "Integral transformation converting time-domain differential relations into algebraic s-domain forms.",
    tags: ["laplace", "s-domain", "transforms", "differential equations"]
  },
  {
    id: "lapl-standard-pairs",
    topicId: "laplace-transform",
    topic: "Laplace Transform",
    subtopic: "Basic Laplace Transforms",
    title: "Standard Laplace Transform Pairs",
    formula: "ℒ{1} = 1/s\nℒ{tⁿ} = n! / sⁿ⁺¹\nℒ{e^(at)} = 1 / (s - a)\nℒ{sin(at)} = a / (s² + a²)\nℒ{cos(at)} = s / (s² + a²)",
    description: "Elementary transform pairs frequently utilized in linear circuit analysis and feedback control.",
    tags: ["laplace pairs", "transforms", "table"],
    example: "ℒ{e^(3t)} = 1/(s - 3);  ℒ{sin(2t)} = 2/(s² + 4)."
  },

  // ==========================================
  // 13. NUMERICAL METHODS
  // ==========================================
  {
    id: "num-newton-raphson",
    topicId: "numerical-methods",
    topic: "Numerical Methods",
    subtopic: "Newton-Raphson Method",
    title: "Newton-Raphson Iteration",
    formula: "xₙ₊₁ = xₙ - [f(xₙ) / f'(xₙ)]",
    description: "Rapidly converging second-order root finding algorithm using tangent line linear approximations.",
    tags: ["numerical methods", "newton raphson", "roots", "iteration"],
    example: "Finding √2 (f(x) = x² - 2, f'(x) = 2x): From x₀ = 1, x₁ = 1 - (-1)/2 = 1.5; x₂ = 1.5 - (0.25)/3 = 1.4166."
  },
  {
    id: "num-bisection",
    topicId: "numerical-methods",
    topic: "Numerical Methods",
    subtopic: "Bisection Method",
    title: "Bisection Method Iteration",
    formula: "c = (a + b) / 2   [If f(a)·f(c) < 0, b ← c; else a ← c]",
    description: "Guaranteed convergence root-bracketing method based on the Intermediate Value Theorem.",
    tags: ["bisection", "numerical roots", "bracketing"]
  },
  {
    id: "num-errors-formula",
    topicId: "numerical-methods",
    topic: "Numerical Methods",
    subtopic: "Errors",
    title: "Absolute, Relative & Percentage Errors",
    formula: "E_abs = |X_true - X_approx|\nE_rel = |X_true - X_approx| / |X_true|\nE_pct = E_rel × 100%",
    description: "Quantifies algorithmic and discretization inaccuracies in numerical computing.",
    tags: ["error analysis", "percentage error", "numerical"],
    example: "For true value 10 and computed 9.8: E_abs = 0.2; E_rel = 0.2/10 = 0.02; E_pct = 2%."
  },

  // ==========================================
  // 14. ENGINEERING MATHEMATICS
  // ==========================================
  {
    id: "eng-transfer-function",
    topicId: "engineering-math",
    topic: "Engineering Mathematics",
    subtopic: "Engineering Mathematics I",
    title: "Linear System Transfer Function",
    formula: "H(s) = Y(s) / X(s) = [bₘ sᵐ + ... + b₀] / [aₙ sⁿ + ... + a₀]",
    description: "Ratio of output Laplace transform to input Laplace transform under zero initial conditions.",
    tags: ["control theory", "transfer function", "engineering", "s-domain"]
  },
  {
    id: "eng-maxwell-poisson",
    topicId: "engineering-math",
    topic: "Engineering Mathematics",
    subtopic: "Engineering Mathematics II",
    title: "Poisson & Laplace Equations",
    formula: "∇²V = -ρ / ε₀   (Poisson)\n∇²V = 0         (Laplace in charge-free region)",
    description: "Partial differential equations governing electrostatic potentials and steady-state thermal diffusion.",
    tags: ["electromagnetics", "poisson", "laplace equation", "PDE"]
  },
  {
    id: "eng-wave-equation",
    topicId: "engineering-math",
    topic: "Engineering Mathematics",
    subtopic: "Engineering Mathematics III",
    title: "Classical Wave Equation (1D)",
    formula: "∂²u/∂t² = c² (∂²u/∂x²)",
    description: "Second-order hyperbolic PDE describing acoustic, elastic, and electromagnetic wave propagation.",
    tags: ["wave equation", "PDE", "mechanics", "vibrations"]
  }
];
