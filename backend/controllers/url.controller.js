import shortid from "shortid";
import { Url } from "../models/url.model.js";

// ================= SHORTEN URL =================
export const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, customCode } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL required" });
    }

    let shortCode = customCode;

    // Custom code nahi diya
    if (!shortCode) {
      shortCode = shortid.generate();
    } else {
      // Validation
      const regex = /^[a-zA-Z0-9-_]+$/;
      if (!regex.test(shortCode)) {
        return res.status(400).json({
          message: "Custom URL invalid (no spaces or symbols)",
        });
      }

      // Duplicate check
      const exists = await Url.findOne({ shortCode });
      if (exists) {
        return res.status(400).json({
          message: "Custom URL already taken",
        });
      }
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
    });

    res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= REDIRECT URL =================
export const redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


