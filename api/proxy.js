export default async function handler(req, res) {
  // ✅ API key Vercel Environment Variable se aayegi
  const API_KEY = process.env.GEMINI_KEY; 

  if (!API_KEY) {
    return res.status(500).json({ error: "API key is missing. Please set GEMINI_KEY in Vercel environment variables." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body), // frontend se jo request aayi hai, usko forward kar rahe hain
      }
    );

    const data = await response.json();

    // Agar API ne error bheja to handle karna
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.status(200).json(data); // ✅ Safe response frontend ko bhejna
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
