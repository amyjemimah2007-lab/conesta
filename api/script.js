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

    if (habit.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Habit description is too long (maximum 100 characters)."
      });
    }

    // Guardrails for unsafe words or gibberish input (runs for both mock and live modes)
    const lowerHabit = habit.toLowerCase().trim();
    const unsafeWords = ["bomb", "kill", "steal", "hack", "hurt", "die", "destroy", "illegal", "murder", "suicide", "drugs", "abuse"];
    const isUnsafe = unsafeWords.some(word => lowerHabit.includes(word));
    const isGibberish = lowerHabit.length < 3 || (!lowerHabit.includes(" ") && !/[aeiouy]/.test(lowerHabit));

    if (isUnsafe || isGibberish) {
      return res.status(200).json({
        success: true,
        reply: JSON.stringify({
          isHabit: false,
          error: "This doesn't seem like a safe or valid habit. Please enter a positive personal habit you want to develop (e.g. 'read 10 pages daily')."
        })
      });
    }

    // Return a mock response for local testing/preview if no key is configured
    if (!process.env.OPENAI_API_KEY) {
      const mockReply = JSON.stringify({
        isHabit: true,
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
          content: `You are an expert AI Habit Coach. You must respond ONLY with a JSON object.
First, check if the user's input is a realistic, positive, and safe habit to develop.
If it is harmful, unsafe, offensive, illegal, spam, gibberish, or completely unrelated to personal habit building, set "isHabit" to false and provide a helpful, polite explanation in "error".
If it is a valid habit, set "isHabit" to true, and provide "motivation", "tip", and "challenge".`
        },
        {
          role: "user",
          content: `The user wants to build the following habit: "${habit}".

Format if isHabit is true:
{
  "isHabit": true,
  "motivation": "2-3 encouraging sentences.",
  "tip": "One actionable tip to make it stick.",
  "challenge": "One simple action they can complete today."
}

Format if isHabit is false:
{
  "isHabit": false,
  "error": "A friendly explanation of why the input isn't a valid habit and suggestions for what to enter instead."
}`
        }
      ]
    });

    // Parse and validate the response content on the server side
    const rawReply = response.choices[0].message.content;
    let parsedReply;
    try {
      parsedReply = JSON.parse(rawReply);
    } catch (parseError) {
      console.error("OpenAI JSON Parse Error:", parseError, "Raw content:", rawReply);
      return res.status(500).json({
        success: false,
        error: "Failed to parse the AI coach response. Please try again."
      });
    }

    // Validate the structure of the parsed response
    if (parsedReply.isHabit === undefined) {
      return res.status(500).json({
        success: false,
        error: "AI coach did not return a valid habit evaluation. Please try again."
      });
    }

    if (parsedReply.isHabit) {
      if (!parsedReply.motivation || !parsedReply.tip || !parsedReply.challenge) {
        return res.status(500).json({
          success: false,
          error: "AI coach response is missing required feedback details. Please try again."
        });
      }
    } else {
      if (!parsedReply.error) {
        parsedReply.error = "This input doesn't seem to be a valid habit. Please try something else.";
      }
    }

    // Return AI response
    return res.status(200).json({
      success: true,
      reply: JSON.stringify(parsedReply)
    });

  } catch (error) {
    console.error("OpenAI Error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to generate a response. Please try again later."
    });
  }
}