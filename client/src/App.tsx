import "./index.css";
import { useState } from "react";
import Header from "./pages/Header";
import JobBoard from "./pages/JobBoard"

function App() {
  const [query, setQuery] = useState("");

  return (
    <div className="app-container">

      <Header query={query} onQueryChange={setQuery} />

      <JobBoard query={query} />

    </div>
  );
}

export default App;