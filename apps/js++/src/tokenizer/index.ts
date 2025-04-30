import { FormatList } from "@/format/array.js";
import { assert } from "@workspace/assert";

export type TokenType =
    | "EOF"
    | "Whitespace"
    | "Semicolon"
    | "Dot"
    | "Plus"
    | "Dash"
    | "Times"
    | "Slash"
    | "Equal"
    | "Paran"
    | "OpenBracket"
    | "CloseBracket"
    | "NumberLiteral"
    | "StringLiteral"
    | "Identifier"
    | "UnknownToken";

export type TokenNode = {
    name: TokenType;
    value: string;
};

const SPEC: [RegExp, TokenType][] = [
    [/^\s+/, "Whitespace"],
    [/^;/, "Semicolon"],
    [/^\./, "Dot"],
    [/^\+/, "Plus"],
    [/^-/, "Dash"],
    [/^\*/, "Times"],
    [/^=/, "Equal"],
    [/^[()]/, "Paran"],
    [/^\{/, "OpenBracket"],
    [/^\}/, "CloseBracket"],
    [/^\d+/, "NumberLiteral"],
    [/^[_$a-z][\w$]*/i, "Identifier"],
    [/^"[^"]*"/, "StringLiteral"],
    [/^'[^']*'/, "StringLiteral"],
];

export type lexer_t = Lexer;
export class Lexer {
    static new() {
        return new Lexer();
    }

    cursor = 0;
    public source = "";
    private _current_token!: TokenNode;

    init(source: string) {
        this.cursor = 0;
        this.source = source;
        while (true) {
            this._current_token = this.parse_token();
            if (this._current_token.name === "Whitespace") {
                this.cursor += this._current_token.value.length;
                continue;
            }

            break;
        }
    }

    eat(name: TokenType | (string & {})): TokenNode {
        const temp = this.current_token();
        assert(temp.name === name, this.ERR_SYNTAX(name).message);

        if (temp.name === "EOF")
            return temp;

        do {
            this.cursor += this._current_token.value.length;
            this._current_token = this.parse_token();
        } while (this.current_token().name === "Whitespace");

        return temp;
    }

    has_token() {
        return this.cursor < this.source.length;
    }

    current_token() {
        return this._current_token;
    }

    lookahead() {
        const temp_cursor = this.cursor;
        this.cursor += this.current_token().value.length;

        const next_token = this.parse_token();
        this.cursor = temp_cursor;
        return next_token;
    }

    private parse_token(): TokenNode {
        if (!this.has_token()) {
            return {
                name: "EOF",
                value: "--EOF--",
            };
        }

        const slice = this.source.slice(this.cursor);

        for (const [regex, name] of SPEC) {
            const match = slice.match(regex);
            if (match != null) {
                return {
                    name,
                    value: match[0],
                };
            }
        }

        return {
            name: "UnknownToken",
            value: slice[0],
        } as TokenNode;
    }

    dump() {
        while (this.has_token()) {
            console.dir(this.eat(this.current_token().name));
        }
    }

    ERR_SYNTAX(expected?: string[] | string, relativeIdx: number = 0) {
        const index = this.cursor - relativeIdx;
        const left_slice = this.source.substring(
            Math.max(0, index - 30),
            index - 1,
        );
        const right_slice = this.source.substring(
            index - 1,
            Math.min(this.source.length, index + 30),
        );
        const marker = " ".repeat(left_slice.length + 1).concat("^");

        const expectedTypeMsg = Array.isArray(expected)
            ? FormatList.humanizeListJoin(expected)
            : expected != null
                ? expected
                : undefined;

        const title = `Unexpected token '${this.current_token().value}'${expected ? `, Expected '${expectedTypeMsg}'` : ""}`;

        const msg = [title, "", left_slice + right_slice, marker].join("\n");

        return new Error(msg);
    }
}
