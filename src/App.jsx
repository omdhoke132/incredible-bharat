import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const HeritageDetail = lazy(() => import("./pages/HeritageDetail"));
const CulturalDetail = lazy(() => import("./pages/CulturalDetail"));
const AIGuide = lazy(() => import("./pages/AIGuide"));

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-orb" aria-hidden="true">भारत</div>
      <p>Loading Incredible Bharat…</p>
    </div>
  );
}

function NotFound() {
  return (
    <>
      <Navbar />
      <main className="page-container not-found-page">
      <p className="eyebrow">404 · NOT FOUND</p>
      <h1>This story isn't in our collection yet.</h1>
      <p>Try another search or return to the cultural atlas.</p>
      <Link to="/explore" className="primary-btn">Explore Incredible Bharat →</Link>
      </main>
      <Footer />
    </>
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
          <Route path="/culture/:category/:stateId/:id" element={<CulturalDetail />} />
          <Route path="/ai-guide" element={<AIGuide />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
