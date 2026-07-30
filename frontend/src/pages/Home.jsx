import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Home = () => {
  const { setRoute, productsList } = useContext(AppContext);

  // Showcase 3 top items on the home page
  const featuredProducts = productsList.slice(0, 3);

  // Animation variants for smooth scroll-triggered slides
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="home-page"
    >
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image-container">
          <img
            src="/images/hero.png"
            alt="Limetta luxury interior design showroom"
            className="hero-bg-image"
          />
          <div className="hero-overlay" />
        </div>

        <div
          className="container"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span
              className="uppercase-label"
              style={{ color: "var(--accent-gold)" }}
            >
              Luxury Living Redefined
            </span>
            <h1 className="hero-main-title">
              Crafting <em>Timeless</em> Interiors For <em>Modern</em> Lives
            </h1>
            <p>
              Designed for spaces that inspire. Curated for those who appreciate
              timeless beauty, thoughtful craftsmanship, and understated luxury.
            </p>
            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => setRoute("catalog")}
              >
                Explore Shop
              </button>
              <button
                className="btn-secondary-white"
                onClick={() => setRoute("about")}
              >
                Studio Story
              </button>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Featured Products Section */}
      <section
        style={{
          padding: "6rem 0",
          backgroundColor: "var(--bg-pure)",
          borderTop: "1px solid var(--border-color)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="container">
          <div className="section-header">
            <p>Curated Selection</p>
            <h2>Featured Masterpieces</h2>
          </div>

          <motion.div
            className="products-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
          >
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <button
              className="btn-secondary"
              onClick={() => setRoute("catalog")}
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="category-section">
        <div className="container">
          <div className="section-header">
            <p>Shop by Category</p>
            <h2>Architectural Elements</h2>
          </div>

          <motion.div
            className="category-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
          >
            {[
              {
                name: "Lighting",
                count: "3 items",
                img: "/images/modern_wooden_lamp.png",
              },
              {
                name: "Seating",
                count: "2 items",
                img: "/images/velvet_armchair.png",
              },
              {
                name: "Decor",
                count: "3 items",
                img: "/images/ceramic_vases.png",
              },
            ].map((cat) => (
              <motion.div
                key={cat.name}
                className="category-card"
                variants={fadeInUp}
                onClick={() => setRoute("catalog")}
              >
                <div className="category-img-wrapper">
                  <img src={cat.img} alt={cat.name} />
                </div>
                <div className="category-info">
                  <h3>{cat.name}</h3>
                  <span>{cat.count}</span>
                </div>
              </motion.div>
            ))}

            <motion.div
              className="category-card"
              style={{ backgroundColor: "#121212", color: "#FFF" }}
              variants={fadeInUp}
              onClick={() => setRoute("catalog")}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "3rem",
                }}
              >
                <span
                  className="uppercase-label"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Full Catalog
                </span>
                <h3
                  style={{
                    color: "#FFF",
                    fontSize: "2rem",
                    marginTop: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  Explore All Curated Pieces
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <span>View Catalog</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy / Narrative Section - Shifted lower and updated styling for premium flow */}
      <section className="philosophy-section" style={{ backgroundColor: "var(--bg-pure)", borderBottom: "none" }}>
        <div className="container philosophy-grid">
          {/* Left Column: Premium Flatlay Detail Photo */}
          <motion.div
            className="philosophy-image-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
          >
            <img
              src="/images/showroom_detail.png"
              alt="Limetta luxury interior design showroom material flatlay"
              className="philosophy-img"
            />
            <div className="philosophy-gold-frame" />
          </motion.div>

          {/* Right Column: Narrative Copy */}
          <motion.div
            className="philosophy-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={fadeInUp}
          >
            <span
              className="uppercase-label"
              style={{ color: "var(--accent-gold-dark)" }}
            >
              Brand Narrative
            </span>
            <h2 className="philosophy-title">
              Silent Luxury, Spoken Through Material & Form
            </h2>
            <p className="philosophy-desc">
              We believe a space should be a reflection of calm sophistication.
              Our curated collection rejects the noise of transient trends,
              opting instead for timeless proportions, rich organic textures,
              and the delicate accent of champagne gold. Every piece is an
              invitation to pause.
            </p>
            <div className="philosophy-details-box">
              <div className="philosophy-metric">
                <strong>100%</strong>
                <span>Artisan Handcrafted</span>
              </div>
              <div className="philosophy-metric">
                <strong>Natural</strong>
                <span>Travertine & Walnut</span>
              </div>
            </div>
            <div>
              <button
                className="btn-link-underline"
                onClick={() => setRoute("about")}
              >
                Discover Our Story
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "7rem 0", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
          >
            <span
              className="uppercase-label"
              style={{ marginBottom: "1.5rem", display: "block" }}
            >
              THE LIMETTA PROMISE
            </span>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2rem",
                fontStyle: "italic",
                lineHeight: "1.6",
                color: "var(--text-heading)",
                marginBottom: "2rem",
              }}
            >
              "Luxury isn't about excess—it's about thoughtful design. Every
              Limetta piece is chosen to complement modern living through
              elegant forms, authentic materials, and lasting quality."
            </p>
            <h4
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: "600",
              }}
            >
              Founder &bull; Limetta
            </h4>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
