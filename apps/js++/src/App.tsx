import { INST, VM } from "@/runtime/index";
import { useState } from "react";

const Button2 = () => <button onClick={() => console.log("button2")}>Btn2</button>

function CustomDslComp() {
    return new VM("div", [
        [INST.PSH, "⭐"],
        [INST.STP, "children"],
        [INST.ELM, "span"],
        [INST.PSH, "Hello"],
        [INST.STP, "children"],
        [INST.ELM, "span"],
        [INST.LOC],
        [INST.STP, "children"],
        [INST.PSH, {jump: 12}],
        [INST.STP, "onClick"],
        [INST.ELM, "button"],
        [INST.ELM, Button2],
        [INST.HALT],
        [INST.PSH, "Hello from OP Code"],
        [INST.PSH, 1],
        [INST.NATC, "log"],
        [INST.CALL, 20, 0],
        [INST.PSH, "Hello after"],
        [INST.PSH, 1],
        [INST.NATC, "log"],
        [INST.RETURN],
        [INST.PSH, "Should not be logged"],
        [INST.PSH, 1],
        [INST.NATC, "log"],
        [INST.PSH, "Hello from Sub routine OP Code"],
        [INST.PSH, 1],
        [INST.NATC, "log"],
        [INST.RETURN],
    ]).execute_inst();
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
