import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import History from "./pages/History";

function Nav() {
  const { pathname } = useLocation();
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-white flex items-center gap-2 hover:text-indigo-400 transition-colors">
          <span className="text-xl">🎨</span>
          <span>Pomelli Wrapper</span>
        </Link>
        <Link
          to="/history"
          className={`text-sm transition-colors ${
            pathname === "/history"
              ? "text-indigo-400"
              : "text-gray-500 hover:text-gray-200"
          }`}
        >
          History
        </Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/run/:runId" element={<Results />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
