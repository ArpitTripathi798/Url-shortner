import shortid from "shortid";
import { Url } from "../models/url.model.js";

/* ================= SHORTEN URL ================= */
export const shortenUrl = async (req, res) => {
  try {
    let { originalUrl, customCode } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL required",
      });
    }

    originalUrl = originalUrl.trim();

    // ✅ protocol fix at SAVE TIME
    if (
      !originalUrl.startsWith("http://") &&
      !originalUrl.startsWith("https://")
    ) {
      originalUrl = "http://" + originalUrl;
    }

    let shortCode = customCode || shortid.generate();

    // custom code validation
    if (customCode) {
      const regex = /^[a-zA-Z0-9-_]+$/;
      if (!regex.test(customCode)) {
        return res.status(400).json({
          success: false,
          message: "Custom URL invalid",
        });
      }

      const exists = await Url.findOne({ shortCode: customCode });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Custom URL already taken",
        });
      }
    }

    await Url.create({
      originalUrl,
      shortCode,
    });

    return res.status(201).json({
      success: true,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (error) {
    console.error("SHORTEN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= REDIRECT URL ================= */
export const redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    console.log("🔁 Redirect hit:", code);

    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).send("Short URL not found");
    }

    // 🔥 FINAL SAFE REDIRECT
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error("REDIRECT ERROR:", error);
    return res.status(500).send("Server error");
  }
};



