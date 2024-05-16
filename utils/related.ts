import { OpenAIModel } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

// Define a type for the expected format of the server responses
interface ServerResponse {
  related: string[];
}

export const OpenAIStream = async (prompt: string, apiKey: string): Promise<ReadableStream<Uint8Array>> => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OpenAIModel.DAVINCI_TURBO,
      messages: [
        {
          role: "system",
          content: `As a professional web researcher, your task is to generate a set of three queries that explore the subject matter more deeply, building upon the initial query and the information uncovered in its search results.

          For instance, if the original query was "Starship's third test flight key milestones", your output should follow this format:
      
          "{
            "related": [
              "What were the primary objectives achieved during Starship's third test flight?",
              "What factors contributed to the ultimate outcome of Starship's third test flight?",
              "How will the results of the third test flight influence SpaceX's future development plans for Starship?"
            ]
          }"
      
          Aim to create queries that progressively delve into more specific aspects, implications, or adjacent topics related to the initial query. The goal is to anticipate the user's potential information needs and guide them towards a more comprehensive understanding of the subject matter.
          Please match the language of the response to the user's language.`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 120,
      temperature: 1,
      stream: true
    })
  });

  if (res.status !== 200) {
    throw new Error(`OpenAI API returned an error: ${res.status}`);
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data) as ServerResponse;
            const text = json.related.join("\n");  // Joins the related queries into a single string
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(`Failed to parse and encode data: ${e}`);
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
