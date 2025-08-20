import { OpenAIModel, Source } from "@/types";
import * as cheerio from "cheerio";
import type { NextApiRequest, NextApiResponse } from "next";
import { cleanSourceText } from "../../utils/sources";

// 暂时不使用 Edge Runtime，等待调试完成
// export const config = {
//   runtime: "edge"
// };

type Data = {
  sources: Source[];
};
const searchHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  try {
    const { query, model } = req.body as {
      query: string;
      model: OpenAIModel;
    };

    const sourceCount = 6;

    // GET LINKS - 使用 DuckDuckGo HTML 版本
    console.log("Searching DuckDuckGo for:", query);
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error("DuckDuckGo search failed:", response.status, response.statusText);
      throw new Error(`DuckDuckGo search failed: ${response.status}`);
    }
    
    const html = await response.text();
    console.log("DuckDuckGo HTML length:", html.length);
    const $ = cheerio.load(html);
    const linkTags = $("a.result__a");

    let links: string[] = [];
    console.log("Total link tags found:", linkTags.length);

    // DuckDuckGo 的链接是直接的 href
    linkTags.each((i, link) => {
      const href = $(link).attr("href");
      
      if (!href) return;
      
      // 调试：打印前5个href看看格式
      if (i < 5) {
        console.log(`Link ${i}: ${href}`);
      }

      // DuckDuckGo 搜索结果通常是直接的链接
      if (href.startsWith("http://") || href.startsWith("https://")) {
        if (!links.includes(href)) {
          links.push(href);
        }
      } else if (href.startsWith("//")) {
        // 处理协议相对链接
        const fullUrl = `https:${href}`;
        if (!links.includes(fullUrl)) {
          links.push(fullUrl);
        }
      }
    });

    const filteredLinks = links.filter((link, idx) => {
      try {
        const domain = new URL(link).hostname;

        const excludeList = ["google", "facebook", "twitter", "instagram", "youtube", "tiktok"];
        if (excludeList.some((site) => domain.includes(site))) return false;

        return links.findIndex((link) => new URL(link).hostname === domain) === idx;
      } catch (error) {
        console.error(`Invalid URL: ${link}`);
        return false;
      }
    });

    const finalLinks = filteredLinks.slice(0, sourceCount);
    console.log("Found links:", finalLinks);

    // SCRAPE TEXT FROM LINKS
    const sources = (await Promise.all(
      finalLinks.map(async (link) => {
        try {
          // 在即将访问的每个链接前都加上https://r.jina.ai/
          const proxyLink = `https://r.jina.ai/${link}`;
      
          const response = await fetch(proxyLink); // 使用代理链接
          const content = await response.text();
        
        // Jina Reader 返回的是 Markdown 格式，不需要用 JSDOM 解析
        // 直接提取内容
        if (content && content.length > 0) {
          // 移除 Markdown 元数据（Title:, URL Source:, Markdown Content: 等）
          let sourceText = content;
          
          // 查找 "Markdown Content:" 之后的内容
          const markdownIndex = content.indexOf("Markdown Content:");
          if (markdownIndex !== -1) {
            sourceText = content.substring(markdownIndex + "Markdown Content:".length).trim();
          }
          
          // 清理文本
          sourceText = cleanSourceText(sourceText);
          console.log(`Scraped ${link}: ${sourceText.substring(0, 100)}...`);
          return { url: link, text: sourceText }; // 返回原始链接和处理后的文本
        } else {
          console.log(`Failed to get content from ${link}`);
          return undefined;
        }
        } catch (error) {
          console.error(`Error scraping ${link}:`, error);
          return undefined;
        }
      })
    )) as Source[];

    const filteredSources = sources.filter((source) => source !== undefined);
    console.log("Filtered sources count:", filteredSources.length);

    for (const source of filteredSources) {
      source.text = source.text.slice(0, 1500);
    }
    
    
    res.status(200).json({ sources: filteredSources });
  } catch (err) {
    console.error("Sources API Error:", err);
    res.status(500).json({ sources: [] });
  }
};

export default searchHandler;