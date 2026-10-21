import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";

const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const HeritageDetail = lazy(() => import("./pages/HeritageDetail"));
const AIGuide = lazy(() => import("./pages/AIGuide"));

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-orb">ॐ</div>
      <p>Loading Bharat...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/heritage/:id" element={<HeritageDetail />} />
          <Route path="/ai-guide" element={<AIGuide />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;