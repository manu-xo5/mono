const Next = {
    Any: 0,
    AnyChar: 1,
} as const;

void (function main() {
    const program = `
    let x = (1 + 21 + 3 + (111))
    let j = 123

    function helloWorld() {
        let a = 12
        function jj() {
          let gg = 22
        }

        let b = 21
    }

    let z = 1
    `;

    const iter = Iterator.from(program.split("\n").map(line => line.trim()).filter(Boolean));

    const lines: (string | string[])[] = [];
    const scope_stack = [lines];

    while (true) {
        const next = iter.next();
        const current = scope_stack[0]!;

        if (next.done)
            break;

        if (next.value === "}") {
            scope_stack.shift();
        }
        else if (next.value.startsWith("function")) {
            const nested: (string | string[])[] = [];
            current.push(nested);
            scope_stack.unshift(nested);
        }
        else {
            current.push(next.value);
        }
    }

    console.log(lines);
    return;
    runMachine("main", lines);
}());

function tokenize(line: string) {
    let cursor = 0;

    function ignoreTillWhiteSpace() {
        let ch = line.charAt(cursor);
        while (/\s/.exec(ch)) {
            cursor += 1;
            ch = line.charAt(cursor);
        }
    }

    function lookahead(token: string) {
        const temp = cursor;
        ignoreTillWhiteSpace();
        const current = line.substring(cursor, cursor + token.length);
        cursor = temp;

        return token === current;
    }

    function next(token: string | typeof Next[keyof typeof Next]) {
        ignoreTillWhiteSpace();

        const current = (() => {
            if (token === Next.AnyChar) {
                const hasMatch = /^[a-z]+/i.exec(line.slice(cursor));
                const resolvedToken = hasMatch?.[0] ?? "--no--";
                return resolvedToken;
            }
            else if (token === Next.Any) {
                const resolvedToken = line.slice(cursor);
                cursor += resolvedToken.length;

                return resolvedToken;
            }
            else {
                const resolvedToken = line.substring(cursor, cursor + token.length);
                if (token !== resolvedToken) {
                    throw new Error(`Unexpected token '${resolvedToken}', expected ${token}`);
                }

                return resolvedToken;
            }
        })();

        cursor += current.length;
        return current;
    }

    function dump() {
        console.log(line.slice(cursor));
    }

    return {
        lookahead,
        next,
        dump,
    };
}

function runMachine(name: string, lines: string[], env: Record<string, number | string | boolean> = {}) {
    const stack: string[] = [];
    const heap: Record<string, string> = {};
    let ip = 0;

    while (ip < lines.length) {
        const ins = lines[ip]!;
        const lexer = tokenize(ins);

        if (lexer.lookahead("let ")) {
            lexer.next("let ");
            const varName = lexer.next(Next.AnyChar);
            lexer.next("=");
            const varValue = lexer.next(Next.Any);
            heap[varName] = varValue;
            // ...
        }
        else if (lexer.lookahead("function")) {
            const bracketsStack = [];
            bracketsStack.push("{");
            lexer.next("function ");
            const funcName = lexer.next(Next.AnyChar);
            const compoundInstructions: string[] = [];
            ip++;
            while (bracketsStack.length > 0 && ip < lines.length) {
                const nestedLexer = tokenize(lines[ip]!);
                if (nestedLexer.lookahead("}")) {
                    bracketsStack.pop();
                    continue;
                }
                compoundInstructions.push(lines[ip]!);
                ip++;
            }

            heap[funcName] = compoundInstructions;
        }
        else {
            throw new Error(`Unexpected token '${lexer.dump()}'`);
        }

        ip++;
    }

    console.debug(`heap`);
    console.log(heap);
    console.debug(`end of ${name}`);
}
