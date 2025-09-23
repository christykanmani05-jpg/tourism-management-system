const express = require("express");
const router = express.Router();

// Very simple rule-based chatbot for FAQs and routing help
function generateReply(message) {
  if (!message || typeof message !== "string") {
    return "Hi! How can I help you plan your trip today?";
  }

  const text = message.toLowerCase();

  // Greetings
  if (/\b(hi|hello|hey|hola)\b/.test(text)) {
    return "Hello! I'm TrioBot. Ask me about destinations, guides, bookings or contact info.";
  }

  // Destinations
  if (/(destination|place|where to go)/.test(text)) {
    return "We list destinations on the Destinations page. Would you like to open it?";
  }

  // Packages / pricing
  if (/(package|price|cost|deal)/.test(text)) {
    return "Our tour packages and prices are on the Packages page. Want me to take you there?";
  }

  // Rural experiences
  if (/(rural|village|india)/.test(text)) {
    return "Explore authentic Rural India experiences on the Rural page. Should I open it?";
  }

  // Guides
  if (/(guide|tour guide|local)/.test(text)) {
    return "You can add or view guides from the Guides menu. Need the link?";
  }

  // Booking
  if (/(book|booking|reserve|reservation)/.test(text)) {
    return "To book, go to the Booking section on the site. I can navigate you there.";
  }

  // Contact/help
  if (/(contact|help|support|email|phone)/.test(text)) {
    return "You can reach us via the Contact page. Want me to open it for you?";
  }

  // Default
  return "I didn't quite get that. I can help with destinations, packages, guides, bookings, or contacting us.";
}

router.post("/chat", async (req, res) => {
  try {
    const message = (req.body && req.body.message) || "";

    const useGrok = !!process.env.XAI_API_KEY;
    const useCse = !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CSE_ID);

    // Try Grok (xAI) first if configured
    let grokReply = null;
    if (useGrok) {
      try {
        const grokResp = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.XAI_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.XAI_MODEL || "grok-2-latest",
            temperature: 0.3,
            messages: [
              { role: "system", content: "You are TrioBot, a helpful tourism assistant for the TrioTrails website. Provide concise, accurate answers with practical suggestions. Avoid making up facts." },
              { role: "user", content: String(message || "") }
            ]
          })
        });
        if (grokResp.ok) {
          const json = await grokResp.json();
          grokReply = json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
        }
      } catch (_) {
        // ignore Grok errors and fall back
      }
    }

    // Try Google Custom Search for tourism queries
    let sources = [];
    if (useCse) {
      try {
        const params = new URLSearchParams({
          key: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_CSE_ID,
          q: message || "tourism",
          num: "3",
          safe: "active"
        });

        const resp = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
        if (resp.ok) {
          const json = await resp.json();
          const items = Array.isArray(json.items) ? json.items : [];
          sources = items.map(it => ({
            title: it.title,
            link: it.link,
            snippet: it.snippet
          }));
        }
      } catch (_) {
        // ignore CSE errors
      }
    }

    const ruleReply = generateReply(message);
    let reply = grokReply || ruleReply;
    if (sources.length) {
      reply = `${reply} Here are some helpful links:`;
    }

    res.json({ reply, sources, provider: grokReply ? "grok" : (useCse ? "rule+cse" : "rule") });
  } catch (err) {
    res.status(500).json({ message: "Chat service error" });
  }
});

module.exports = router;


