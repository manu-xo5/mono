import { useState } from "react";
import { Runtime } from "./runtime";


function App() {
    const [count, setCount] = useState(0);
      const x = Runtime.runMachine();

    return (
        <div>
            <button onClick={() => setCount(count => count + 1)}>
                count is
                {x}{" "}
                {count}
            </button>
        </div>
    );
}

export { App };
