import { OpenAIModel } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

export const OpenAIStream = async (prompt: string, apiKey: string) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    method: "POST",
    body: JSON.stringify({
      model: OpenAIModel.DAVINCI_TURBO,
      messages: [
        { role: "system", content: "This GPT acts as a news media editor, skilled in drafting news reports based on user requests. It understands the structure of journalistic writing and is adept at creating informative, engaging, and concise content that captures the essence of the news story being reported. It emphasizes accuracy, timeliness, and relevance, ensuring that the news it creates is up-to-date and reflective of current events. The GPT seeks to understand the specific angle or aspect of the story the user is interested in before crafting the report, ensuring the content is tailored to the user's needs. It avoids speculative or unverified information, sticking to facts and credible sources to maintain the integrity of the news. Additionally, it can adjust the tone and complexity of the language based on the target audience, whether it's for a general readership or a more specialized group." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4096,
      temperature: 1,
      stream: true
    })
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    }
  });

  return stream;
};
