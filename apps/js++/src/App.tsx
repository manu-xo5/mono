import type { instr_t } from "@/runtime/instructions";
import { FuctionRuntime } from "@/runtime/index";
import { create_scope, instr_conditional, OP } from "@/runtime/instructions";
import { useState } from "react";
import { to_string } from "./runtime/utils";

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

let pc = 0;
const program_main: instr_t[] = [];
const global_scope = create_scope();

program_main.push(...global_scope.def("count", "Hello"));
pc += program_main.length;

program_main.push(
  ...instr_conditional(
    program_main,
    global_scope.addr("count"),
    (scope) => [...scope.def("count", "world"), ...scope.load("count")],
    () => {
      const pc = instr_conditional(
        program_main,
        global_scope.addr("count"),
        (scope) => [...scope.def("title", "nested 1")],
        (scope) => [...scope.def("title", "nested 2")],
      );
      return pc;
    },
  ),
);
program_main.push([OP.RET]);
pc++;
void pc;

console.debug(to_string(program_main));

const main: instr_t[] = [
  [OP.LOCAL, "count", 1],
  [OP.TXT, "count"],
  [OP.ELM, "button"],
];

const el = new FuctionRuntime(main).run();

function App() {
  const [[count, setCount]] = [useState(0)];

  return (
    <>
      <div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export { App };
