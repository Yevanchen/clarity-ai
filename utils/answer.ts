import { OpenAIModel } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";


export const OpenAIStream = async (prompt: string, apiKey: string) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  // 获取当前UTC时间的ISO字符串，并将其赋值给formatted_time变量
  const formatted_time: string = new Date().toISOString();



  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
    },
    method: "POST",
    body: JSON.stringify({
        model: OpenAIModel.DAVINCI_TURBO,
        messages: [
            { role: "system", 
              content: `you are a news media editor, skilled in drafting news reports based on user requests. 
              It understands the structure of journalistic writing and is adept at creating informative, engaging, 
              and concise content that captures the essence of the news story being reported. It emphasizes 
              accuracy, timeliness, and relevance, ensuring that the news it creates is up-to-date and reflective 
              of current events. It avoids speculative or unverified information, sticking to facts and credible 
              sources to maintain the integrity of the news. Generate a comprehensive and informative answer for 
              a given question solely based on the provided web Search Results (URL and Summary). You must only 
              use information from the provided search results. Use an unbiased and journalistic tone. Use this 
              current date and time: ${formatted_time}. Combine search results together into a coherent answer. 
              Do not repeat text. Cite search results using [$number] notation, and don't link the citations. 
              Only cite the most relevant results that answer the question accurately. If different results refer 
              to different entities with the same name, write separate answers for each entity
              Please do not respond with a single natural paragraph. You should use bullet points and ensure the readability of the article..` 
            },
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
