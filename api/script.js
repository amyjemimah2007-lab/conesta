import OpenAI from "openai";

// Initialize the OpenAI client using the API key from the environment
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // Send request to OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert AI Habit Coach."
        },
        {
          role: "user",
          content: `The user wants to build the following habit:

"${habit}"

Give the response in this format:

🌟 Motivation:
(2-3 encouraging sentences)

💡 Tip:
(One practical tip)

🎯 Today's Challenge:
(One simple action they should complete today)

Keep the total response under 150 words.`
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