import React, { useState, useEffect, useRef } from "react";

const gradients = {
  formal: "linear-gradient(135deg, #0f2027, #2c5364)",     // professional deep navy to cyan
  poetic: "linear-gradient(135deg, #ff758c, #ff7eb3)",     // dreamy pinks
  humorous: "linear-gradient(135deg, #ff9966, #ff5e62)",   // bold, warm tangerine-coral
};

const styleNames = {
  formal: "Formal",
  poetic: "Poetic",
  humorous: "Humorous",
};

export default function QuoteTranslator() {
  const [quote, setQuote] = useState("");
  const [style, setStyle] = useState("formal");
  const [transformedQuote, setTransformedQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentBg, setCurrentBg] = useState(gradients[style]);
  const [nextBg, setNextBg] = useState("");
  const topLayerRef = useRef(null);

  useEffect(() => {
    const newGradient = gradients[style];
    setNextBg(newGradient);

    const topLayer = topLayerRef.current;
    if (!topLayer) return;

    topLayer.style.opacity = 1;
    topLayer.style.background = newGradient;

    const timeout = setTimeout(() => {
      setCurrentBg(newGradient);
      topLayer.style.opacity = 0;
    }, 1000);

    return () => clearTimeout(timeout);
  }, [style]);

  const cleanText = (text) =>
    text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setTransformedQuote("");

    if (!quote.trim()) {
      setError("Please enter a quote.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/transform_quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote, style }),
      });

      const data = await res.json();
      if (res.ok) {
        setTransformedQuote(cleanText(data.transformed_quote));
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    bgBase: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: currentBg,
      zIndex: -2,
    },
    bgFadeLayer: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: nextBg,
      zIndex: -1,
      opacity: 0,
      transition: "opacity 1s ease-in-out",
    },
    container: {
      minHeight: "100vh",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#fff",
    },
    titleWrap: {
      textAlign: "center",
      marginBottom: 30,
      animation: "fadeIn 1s ease-out",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#fff",
      textShadow: "1px 1px 4px rgba(0,0,0,0.3)",
      borderBottom: "3px solid rgba(255,255,255,0.4)",
      display: "inline-block",
      paddingBottom: 8,
      marginBottom: 0,
    },
    form: {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(10px)",
      borderRadius: 20,
      padding: 30,
      width: "100%",
      maxWidth: 500,
      boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
      display: "flex",
      flexDirection: "column",
      gap: 20,
    },
    label: {
      fontWeight: "bold",
      fontSize: 16,
    },
    textarea: {
      resize: "vertical",
      minHeight: 80,
      padding: 12,
      fontSize: 16,
      borderRadius: 8,
      border: "none",
      outline: "none",
      fontFamily: "inherit",
    },
    select: {
      padding: 10,
      fontSize: 16,
      borderRadius: 8,
      border: "none",
      outline: "none",
      fontFamily: "inherit",
      cursor: "pointer",
      color: "#333",
    },
    button: {
      padding: "12px 20px",
      fontSize: 16,
      fontWeight: "bold",
      backgroundColor: "#ffffff",
      color: "#333",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    resultBox: {
      marginTop: 10,
      padding: 16,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: 10,
      fontStyle: "italic",
      fontSize: 18,
      whiteSpace: "pre-wrap",
    },
    errorText: {
      color: "#ff4d4f",
      fontWeight: "600",
    },
  };

  return (
    <>
      <div style={styles.bgBase}></div>
      <div style={styles.bgFadeLayer} ref={topLayerRef}></div>

      <div style={styles.container}>
        <div style={styles.titleWrap}>
          <h1 style={styles.title}>AI Quote Translator</h1>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label}>Enter a quote:</label>
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            style={styles.textarea}
            placeholder="e.g., Life is like riding a bicycle..."
            disabled={loading}
          />

          <label style={styles.label}>Choose style:</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={styles.select}
            disabled={loading}
          >
            {Object.entries(styleNames).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Translating..." : "Transform Quote"}
          </button>

          {error && <div style={styles.errorText}>{error}</div>}
          {transformedQuote && <div style={styles.resultBox}>{transformedQuote}</div>}
        </form>
      </div>
    </>
  );
}
