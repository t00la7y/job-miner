import "./index.css";
import { useState } from "react";
import Header from "./pages/Header";
// import Aside from "./pages/Aside"
// import JobBoard from "./pages/JobBoard"

function App() {
  const [query, setQuery] = useState("");

  return (
    <div className="app-container">

      <Header query={query} onQueryChange={setQuery} />

      {/*
      <div className="body">
         {<Aside /> }
         {<JobBoard />}
      </div> 
      */}

    </div>
  );
}

export default App;