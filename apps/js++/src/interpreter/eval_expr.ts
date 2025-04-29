const OPERATION = {
    Plus: (x: unknown, y: unknown) => Number(x) + Number(y),
    Dash: (x: unknown, y: unknown) => Number(x) - Number(y),
    PlusPlus: (x: unknown, y: unknown) => String(x) + String(y),
} as const;

interface expr_t {
    name: string;
}

interface literal_expr_t extends expr_t {
    value: number | string;
}

interface ref_expr_t extends expr_t {
    value: string;
}

function assert_ref_expr(expr: unknown): asserts expr is ref_expr_t {
    if (
        !expr
        || typeof expr !== "object"
        || !("name" in expr)
        || expr.name !== "Identifier"
        || !("value" in expr)
        || typeof expr.value !== "string"
    ) {
        throw new Error("invalid ref expr");
    }
}

function eval_ref_expr(expr: expr_t, stack: stack_t): literal_expr_t["value"] {
    assert_ref_expr(expr);
    const ref = stack.find(([objName]) => objName === expr.value);
    if (!ref) {
        throw new Error(`${expr.value} is not defined in local or global scope`);
    }

    return ref[1];
}

interface bin_expr_t extends expr_t {
    name: "BinaryExpr";
    left: bin_expr_t | literal_expr_t;
    right: bin_expr_t | literal_expr_t;
    operator: string;
}

function assert_bin_expr(expr: expr_t): asserts expr is bin_expr_t {
    if (!("left" in expr)) {
        throw new Error(`invalid left leaf of binary expr${(expr as any)?.left?.name}`);
    } ;

    if (!("right" in expr)) {
        throw new Error(`invalid right leaf of binary expr${(expr as any)?.right?.name}`);
    } ;

    if (!("operator" in expr) || typeof expr.operator !== "string") {
        throw new Error(`invalid operator field of binary expr${(expr as any)?.operator}`);
    } ;
}

function eval_binary(expr: expr_t, stack: stack_t): literal_expr_t["value"] {
    assert_bin_expr(expr);

    if (!(expr.operator in OPERATION)) {
        throw new Error(`Unknown binary operation '${expr.operator}'`);
    }

    const left = eval_expr(expr.left, stack);
    const right = eval_expr(expr.right, stack);

    return OPERATION[expr.operator as keyof typeof OPERATION](left, right);
}

type stack_t = Array <[ string, number | string ]>;

export function eval_expr(expr: unknown, stack: stack_t): number | string {
    if (!expr || typeof expr !== "object" || !("name" in expr)) {
        throw new Error("invalid expr node");
    }

    switch (expr.name) {
        case "NumberLiteral": {
            return (expr as any).value as number;
        }
        case "BinaryExpr": {
            return eval_binary(expr as expr_t, stack);
        }
        case "Identifier": {
            return eval_ref_expr(expr as expr_t, stack);
        }

        default: {
            throw new Error("unknown expression");
        }
    }
}
