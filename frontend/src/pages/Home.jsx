import { useState } from "react";
import API from "../api";

export default function Home() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCopied(false);
    setShortUrl("");

    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/shorten", {
        originalUrl: url.trim(),
        customCode: customCode.trim() || undefined,
      });

      console.log("SHORTEN RESPONSE:", res.data);

      setShortUrl(res.data.shortUrl);
    } catch (err) {
      console.error("SHORTEN ERROR:", err);
      setError(
        err.response?.data?.message ||
          "Failed to shorten URL. Check backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("COPY ERROR:", err);
    }
  };

  return (
    <div className="card">
      <h1>🔗 URL Shortener</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Paste long URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <input
          type="text"
          placeholder="Custom alias (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>

      {error && <p style={{ color: "tomato" }}>{error}</p>}

      {shortUrl && (
        <div className="result">
          <p>Short URL</p>

          <div className="copy-box">
            <a href={shortUrl} target="_blank" rel="noreferrer">
              {shortUrl}
            </a>

            <button
              type="button"
              className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? "✅ Copied" : "📋 Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
