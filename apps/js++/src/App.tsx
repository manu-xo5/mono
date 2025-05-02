import { OP, Runtime } from "@/runtime/index";
import { useState } from "react";

function CustomDslComp() {
    return new Runtime("button",[
           [OP.PSH, "hello world"],
           [OP.PSH, 1],
           [OP.CAL],
           [OP.PSH,"Hello"],
           [OP.STP, "children"],
           [OP.ELM, "button" ],
           [OP.HALT],
           [OP.NATC, "log"],
           [OP.RET],
           // logHello
         ]).execute();
}

console.log(CustomDslComp())

function App() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <CustomDslComp />
            <button onClick={() => setCount(count => count + 1)}>
                count is
                {" "}
                {count}
            </button>
        </div>
    );
}

export { App };
