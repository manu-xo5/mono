import type { instr_t } from "@/runtime/instructions";
import { Branch } from "@/parser/ast/branch.ts";
import { Constant } from "@/parser/ast/def_const.ts";
import { Program } from "@/parser/ast/program.ts";
import { Scope } from "@/parser/scope.ts";
import { to_string } from "@/parser/stringify.ts";
import { FunctionRuntime } from "@/runtime/index";
import { OP } from "@/runtime/instructions";
import { useState } from "react";

/**
 * const c = 0
 *
 * const handleClick = function() {
 * }
 *
 * const getFirstMockClick = handleClick();
 *
 * const handleFetch = function () {
 *  return fetch(...).then(r => r.json());
 * }
 *
 * const renderAsFetch = handleFetch();
 *
 * useEffect(handleFetch, []);
 *
 * return (
 *  <button onClick={handleClick} />
 * )
 *
 */

/**
 * tempChildren = [];
 *
 * tempProps = {
 * }
 *
 * const temp = {
 *  name: "button",
 *  props: tempProps,
 *  children: tempChildren
 * }
 * return temp as button
 */
const global_scope = new Scope(0);

const prg = new Program();
prg.append_stmt([
    new Constant(global_scope, "count", 0),
    new Branch(global_scope, false)
        .cond(global_scope.read("count"))
        .then(scope => [new Constant(scope, "count2", 1000)]),
]);

console.debug(to_string(prg.generate_bytecode()));

const x: Record<string, instr_t[]> = ({
    main: [
        [OP.LOCAL, "count", 1],
        [OP.TXT, "count"],
        [OP.ELM, "button"],
    ],
});

const el = new FunctionRuntime("div", x.main!).run();

function App() {
    const [[count, setCount]] = [useState(0)];

    return (
        <>
            {el}
            <div>
                <button onClick={() => setCount(count => count + 1)}>
                    count is
                    {" "}
                    {count}
                </button>
            </div>
        </>
    );
}

export { App };
