const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, meterType } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'Missing image' });
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'OCR is not configured on the server. Missing GEMINI_API_KEY.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Extract mimeType and base64 string from data URI
    const matches = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;
    
    if (matches) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const prompt = `You are a specialized OCR system reading Thai utility meters.
This is a ${meterType === 'elec' ? 'electricity' : 'water'} meter.
Your task is to extract the CURRENT METER READING as a simple integer number.
- Ignore any decimal digits (digits after a comma, or the last red digit on water meters).
- Ignore serial numbers or model numbers.
Return ONLY a valid JSON object in this exact format (no markdown code blocks):
{
  "reading": 12345,
  "rawText": "Any other text you see",
  "confidence": "high|medium|low"
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    },
                    { text: prompt }
                ]
            }
        ],
        config: {
            responseMimeType: "application/json",
            temperature: 0.1
        }
    });

    const jsonText = response.text;
    const result = JSON.parse(jsonText);
    
    return res.status(200).json(result);

  } catch (err) {
    console.error("OCR Error:", err);
    return res.status(500).json({ error: 'Failed to process image through OCR.' });
  }
};
