import OpenAI from "openai";

// Initialize the OpenAI client using the API key from the environment (fallback to mock-key to prevent startup errors)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "mock-key",
});

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Only POST requests are allowed."
    });
  }

  try {
    // Get the habit from the frontend
    const { habit } = req.body;

    // Validate input
    if (!habit || habit.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Please enter a habit."
      });
    }

    // Return a mock response for local testing/preview if no key is configured
    if (!process.env.OPENAI_API_KEY) {
      const mockReply = JSON.stringify({
        motivation: `Deciding to build the habit of "${habit}" is a great first step! Remind yourself of your long-term goals and stay consistent.`,
        tip: "Set a daily alarm or anchor the new habit right after an existing routine (like brushing your teeth).",
        challenge: "Write down your exact plan for this habit on a piece of paper today."
      });
      return res.status(200).json({
        success: true,
        reply: mockReply
      });
    }

    // Send request to OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an expert AI Habit Coach. You must respond ONLY with a JSON object."
        },
        {
          role: "user",
          content: `The user wants to build the following habit: "${habit}". 
Provide personalized guidance in a JSON object with these exact keys:
- "motivation": 2-3 encouraging and motivational sentences.
- "tip": One practical, highly actionable tip to make this habit stick.
- "challenge": One simple, specific action they can complete TODAY to build momentum.`
        }
      ]
    });

    // Return AI response
    return res.status(200).json({
      success: true,
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenAI Error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to generate a response. Please try again later."
    });
  }
}