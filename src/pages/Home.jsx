import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import StateExplorer from "../components/StateExplorer";

const culturalDimensions = [
  ["🏛️", "Heritage", "Monuments, archaeological sites and historic landscapes."],
  ["🪔", "Festivals", "Festivals, fairs and seasonal celebrations."],
  ["🎭", "Traditions", "Dance, theatre, rituals and living practices."],
  ["🎨", "Arts", "Painting, sculpture and visual traditions."],
  ["🧵", "Crafts", "Handmade knowledge passed through generations."],
  ["🎶", "Music", "Classical, folk, devotional and community music."],
  ["🍛", "Cuisine", "Regional foods, recipes and culinary traditions."],
  ["👥", "Communities", "People and communities carrying culture forward."],
  ["📖", "Literature", "Languages, poetry, stories and literary traditions."],
  ["🧠", "Knowledge", "Traditional knowledge, techniques and systems."],
];

function Home() {
  return (
    <>
      <Navbar />

      <main className="home-page">
        <Hero />

        <Reveal>
          <section className="intro-section" id="heritage">
            <div className="section-kicker">THE STORY OF BHARAT</div>

            <h2>
              A civilization isn't just
              <em> remembered.</em>
              <br />
              It is experienced.
            </h2>

            <p>
              India's heritage lives in its monuments, languages, festivals,
              crafts, music, architecture and the traditions carried from one
              generation to the next.
            </p>

            <p>
              Incredible Bharat brings these stories together as one
              interactive cultural journey.
            </p>
          </section>
        </Reveal>

        <Reveal direction="left">
          <StateExplorer />
        </Reveal>

        <Reveal>
          <section className="dimensions-section">
            <div className="dimensions-heading">
              <div>
                <p className="eyebrow">THE CULTURAL SPECTRUM</p>
                <h2>More than monuments.</h2>
              </div>

              <p>
                Explore the many dimensions through which India's culture is
                created, remembered and kept alive.
              </p>
            </div>

            <div className="dimensions-grid">
              {culturalDimensions.map(
                ([icon, title, description], index) => (
                  <Link
                    to="/explore"
                    className="dimension-card"
                    key={title}
                  >
                    <span className="dimension-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="dimension-icon">
                      {icon}
                    </span>

                    <h3>{title}</h3>

                    <p>{description}</p>

                    <span className="dimension-arrow">→</span>
                  </Link>
                )
              )}
            </div>
          </section>
        </Reveal>

        <Reveal direction="right">
          <section className="home-feature-section">
            <div>
              <p className="eyebrow">EXPLORE THE COLLECTION</p>

              <h2>
                From ancient stones
                <br />
                to living traditions.
              </h2>

              <p>
                Move across regions, eras and cultural forms to discover the
                many layers that make India extraordinary.
              </p>

              <Link to="/explore" className="primary-btn">
                Begin the Journey <span>→</span>
              </Link>
            </div>

            <div className="feature-orbit">
              <div className="feature-orbit-ring ring-one"></div>
              <div className="feature-orbit-ring ring-two"></div>
              <div className="feature-center">भारत</div>

              <span className="orbit-symbol symbol-one">🏛️</span>
              <span className="orbit-symbol symbol-two">🎭</span>
              <span className="orbit-symbol symbol-three">🎨</span>
              <span className="orbit-symbol symbol-four">🪔</span>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="home-quote-section">
            <span className="quote-mark">“</span>

            <blockquote>
              Culture is not something we inherit from the past.
              <br />
              It is something we keep alive.
            </blockquote>

            <span className="quote-rule"></span>

            <p>INVISIBLE THREADS • COUNTLESS STORIES</p>
          </section>
        </Reveal>

        <Reveal>
          <section className="home-cta-section" id="ai">
            <p className="eyebrow">YOUR CULTURAL JOURNEY AWAITS</p>

            <h2>
              India has more stories
              <br />
              than you can see in one lifetime.
            </h2>

            <p>
              Start somewhere. Discover something. Follow the story wherever
              it takes you.
            </p>

            <Link to="/explore" className="primary-btn">
              Explore Incredible Bharat <span>→</span>
            </Link>
          </section>
        </Reveal>
      </main>

      <Footer />
    </>
  );
}

export default Home;
