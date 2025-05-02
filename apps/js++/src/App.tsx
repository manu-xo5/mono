import { OP, VM } from "@/runtime/index";
import { useState } from "react";

const Button2 = () => <button onClick={() => console.log("button2")}>Btn2</button>

function CustomDslComp() {
    return new VM("div", [
        [OP.PSH, "⭐"],
        [OP.STP, "children"],
        [OP.ELM, "span"],
        [OP.PSH, "Hello"],
        [OP.STP, "children"],
        [OP.ELM, "span"],
        [OP.LOC],
        [OP.STP, "children"],
        [OP.PSH, {jump: 12}],
        [OP.STP, "onClick"],
        [OP.ELM, "button"],
        [OP.ELM, Button2],
        [OP.HALT],
        [OP.PSH, "Hello from OP Code"],
        [OP.PSH, 1],
        [OP.NATC, "log"],
        [OP.CALL, 20, 0],
        [OP.PSH, "Hello after"],
        [OP.PSH, 1],
        [OP.NATC, "log"],
        [OP.RETURN],
        [OP.PSH, "Should not be logged"],
        [OP.PSH, 1],
        [OP.NATC, "log"],
        [OP.PSH, "Hello from Sub routine OP Code"],
        [OP.PSH, 1],
        [OP.NATC, "log"],
        [OP.RETURN],
    ]).execute();
}

// console.debug(CustomDslComp());

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <CustomDslComp />
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
