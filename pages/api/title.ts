// api.ts

const BASE_URL = 'https://r.jina.ai/';

async function fetchTitle(url: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    const html = await response.text();
    const titleMatch = html.match(/Title:(.*?)URL Source:/s);
    const title = titleMatch ? titleMatch[1].trim() : "";
    console.log(`Fetched title: ${title}`);
    return title;
  } catch (error) {
    console.error(`Error fetching title for ${url}:`, error);
    return "";
  }
}

export async function fetchTitles(urls: string[]): Promise<string[]> {
  const titles = await Promise.all(urls.map(fetchTitle));
  return titles;
}