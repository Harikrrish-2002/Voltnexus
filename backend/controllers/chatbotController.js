const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handleChatQuery = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get the model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are Nexus, an AI assistant for the VoltNexus platform. VoltNexus is a platform for electronic gadgets repair and servicing.
Your primary role is to help users with:
1. Setup and installation guides for all types of electronic gadgets (TV, Home Theatre, PC, smart devices, kitchen appliances, etc.).
2. Explaining basic electrical concepts (e.g., Amps, Volts, Watts).
3. Basic troubleshooting for electronic devices.

CRITICAL SAFETY RULES:
- If the user mentions "short circuit", "spark", "fire", "shock", or any dangerous electrical situation, IMMEDIATELY advise them to: "Safety First! Turn off the main power supply immediately. Do not touch the outlet or device. Call a professional electrician or book an emergency repair via our platform."
- Never advise users to open live switchboards, repair internal components while plugged in, or touch exposed wires.

GUIDELINES:
- Keep responses concise, clear, and easy to understand for an average user (limit to 3-5 sentences if possible).
- If the issue sounds like a broken appliance or requires replacing parts (e.g., faulty capacitor, dead compressor), advise them to book a repair from their 'My Complaints' section on the dashboard by clicking 'Register Complaint'.
- Do not use markdown formatting like **bold** or *italics* because the current chat UI does not parse markdown, just use plain text with basic numbered lists if needed.
- If the query is completely unrelated to electronics, appliances, or VoltNexus, politely guide them back to the topic.

User Query: "${message}"
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.status(200).json({ response: responseText });

    } catch (error) {
        console.error('Gemini API Error:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to process chat query', details: error.message });
    }
};

module.exports = { handleChatQuery };
