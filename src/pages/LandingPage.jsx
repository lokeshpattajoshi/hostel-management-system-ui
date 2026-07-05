import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  // ✅ Pure JS SEO Optimization: Dynamic Head Update
  useEffect(() => {
    // 1. Set the page title
    document.title = "Smart Living Hostels | Premium Student PG & Hostel Management in Odisha";

    // 2. Add or update the meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      "content",
      "Looking for premium student hostels or managed PG accommodations? Smart Living Hostels offers comfortable AC and Non-AC rooms with good food and high security in Odisha."
    );

    // 3. Add or update the canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", window.location.href);
  }, []);

  return (
    <div style={pageStyle}>
      {/* Top Banner Navigation using Semantic HTML Elements */}
      <nav style={navStyle}>
        <div style={logoGroupStyle}>
          <div style={logoPlaceholderStyle}>🏢</div>
          {/* Main H1 is important for search bots to index your brand name */}
          <h1 style={brandNameStyle}>Smart Living Hostels</h1>
        </div>
        <button onClick={() => navigate("/login")} style={loginNavBtnStyle}>
          Portal Login
        </button>
      </nav>

      {/* Hero Header Section */}
      <header style={heroSectionStyle}>
        <div style={heroContentStyle}>
          <h2 style={mainTitleStyle}>End-to-End Hostel Management Solutions</h2>
          <p style={taglineStyle}>
            We take care of your living experience from top to bottom. Whether you are looking for managed Student Hostels or professional Paying Guest (PG) accommodations, we have the perfect place for you.
          </p>
        </div>
      </header>

      {/* Offerings Grid Section - Structured as a Section with standalone Articles */}
      <section style={featuresSectionStyle}>
        <h2 style={sectionHeadingStyle}>What We Offer</h2>
        <div style={gridStyle}>
          <article style={featureCardStyle}>
            <div style={iconStyle}>🛏️</div>
            <h3>AC & Non-AC Rooms</h3>
            <p>Flexible living setups tailored to your budget preferences. Fully furnished, well-ventilated spaces.</p>
          </article>

          <article style={featureCardStyle}>
            <div style={iconStyle}>🍲</div>
            <h3>Good Food</h3>
            <p>Hygienic, freshly prepared, and nutritious home-style meals served daily right at the facility.</p>
          </article>

          <article style={featureCardStyle}>
            <div style={iconStyle}>🔒</div>
            <h3>Premium Security</h3>
            <p>Your safety is our priority. Around-the-clock security monitoring, secure access control keys, and wardens.</p>
          </article>
        </div>
      </section>

      {/* Footer Section with explicit contact markup */}
      <footer style={contactSectionStyle}>
        <h2 style={{ marginBottom: "10px", fontSize: "22px" }}>Have Questions? Reach Out To Us Today!</h2>
        <p style={{ opacity: 0.9, marginBottom: "20px" }}>Our administration office is available to assist you with room allocation maps and rental details.</p>
        
        <div style={contactDetailsRowStyle}>
          <span style={contactItemStyle}>
            Links: 📧 <strong>Email ID:</strong> <a href="mailto:smartassociates.odisha@gmail.com" style={linkStyle}>smartassociates.odisha@gmail.com</a>
          </span>
          <span style={contactItemStyle}>
            📱 <strong>Mobile Numbers:</strong> <a href="tel:9090909515" style={linkStyle}>9090909515</a> / <a href="tel:9658011150" style={linkStyle}>9658011150</a>
          </span>
        </div>
        
        <p style={copyrightStyle}>&copy; {new Date().getFullYear()} Smart Living Hostels Management System. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

// --- STYLES OBJECTS ---
const pageStyle = {
  fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: "#2d3748",
  background: "#fff",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 5%",
  background: "#fff",
  borderBottom: "1px solid #e2e8f0",
};

const logoGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const logoPlaceholderStyle = {
  fontSize: "24px",
};

const brandNameStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "700",
  color: "#007bff",
};

const loginNavBtnStyle = {
  background: "none",
  border: "2px solid #007bff",
  color: "#007bff",
  padding: "8px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "all 0.2s",
};

const heroSectionStyle = {
  background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
  color: "#fff",
  padding: "80px 5%",
  textAlign: "center",
};

const heroContentStyle = {
  maxWidth: "800px",
  margin: "0 auto",
};

const mainTitleStyle = {
  fontSize: "38px",
  fontWeight: "800",
  marginBottom: "20px",
  lineHeight: "1.2",
};

const taglineStyle = {
  fontSize: "18px",
  lineHeight: "1.6",
  opacity: "0.9",
  marginBottom: "30px",
};

const featuresSectionStyle = {
  padding: "60px 5%",
  background: "#f8f9fa",
  flexGrow: 1,
};

const sectionHeadingStyle = {
  textAlign: "center",
  marginBottom: "40px",
  fontSize: "28px",
  fontWeight: "700",
  color: "#1a202c",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "30px",
  maxWidth: "1100px",
  margin: "0 auto",
};

const featureCardStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
  border: "1px solid #e2e8f0",
  textAlign: "center",
};

const iconStyle = {
  fontSize: "36px",
  marginBottom: "15px",
};

const contactSectionStyle = {
  background: "#1a202c",
  color: "#fff",
  padding: "40px 5% 20px 5%",
  textAlign: "center",
};

const contactDetailsRowStyle = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "30px",
  marginTop: "15px",
  fontSize: "15px",
};

const contactItemStyle = {
  background: "rgba(255,255,255,0.08)",
  padding: "10px 20px",
  borderRadius: "6px",
};

const linkStyle = {
  color: "#3182ce",
  textDecoration: "none",
  marginLeft: "5px",
};

const copyrightStyle = {
  marginTop: "40px",
  fontSize: "12px",
  opacity: "0.5",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  paddingTop: "20px",
};

export default LandingPage;