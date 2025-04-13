import { Suspense } from "react";
import { Editor } from "../editor/Editor";

function App() {
  return (
    <>
      <Suspense fallback={"loading..."}>
        <Editor />
      </Suspense>
    </>
  );
}

export default App;
