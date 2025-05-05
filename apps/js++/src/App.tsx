import type { instr_t } from "@/runtime/instructions";
import { FuctionRuntime } from "@/runtime/index";
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

const x: Record<string, instr_t[]> = ({
    main: [
        [OP.LOCAL, "count", 1],
        [OP.TXT, "count"],
        [OP.ELM, "button"],
    ],
});

const el = new FuctionRuntime("div", x.main!).run();

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
