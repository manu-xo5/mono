// errors
export class EofError extends Error {
    constructor(tokenName: string) {
        super(`Tokenizer: unexpected end of input, expected '${tokenName}'`);
    }
}

export class TokenizerSyntaxError extends Error {
    constructor(temp: {
        expectedName: string;
        gotName: string;
        gotValue: string;
    }) {
        super(
            `Tokenizer: unexpected ${temp.gotName} '${temp.gotValue}', expected '${temp.expectedName}'`,
        );
    }
}

const formatter = new Intl.ListFormat("en", {
    style: "long",
    type: "disjunction",
});
export const humanizeListJoin = (values: string[]) => formatter.format(values);

export function assertNodeValue<
    T extends { value: unknown },
    Value extends string,
>(node: T, value: Value): asserts node is T & { value: Value } {
    if (node.value !== value) {
        throw new TokenizerSyntaxError({
            gotName: "Token",
            expectedName: String(value),
            gotValue: String(node.value),
        });
    }
}

export function ERROR_UNEXPECTED_END(expected: string = "") {
    return [`Tokenizer: unexpected end of input`, expected].filter(Boolean).join(", ");
}

export function ERROR_SYNTAX(char: string = "?", expected: string = "") {
    return new Error(
        [`Tokenizer: unexpected character '${char}'`, expected]
            .filter(Boolean)
            .join(", "),
    );
}
