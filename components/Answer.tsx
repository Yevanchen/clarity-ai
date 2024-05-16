import { FC, useEffect, useRef,useState } from 'react';
import { SearchQuery } from "@/types";
import { IconReload } from "@tabler/icons-react";
import { MemoizedReactMarkdown } from './ui/markdown'
import { fetchTitles } from '@api/title';
import { AvatarImage, Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CardContent, Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
interface AnswerProps {
  searchQuery: SearchQuery;
  answer: string;
  done: boolean;
  onReset: () => void;
  titles?: string[]; // 添加 titles 属性
}

export const Answer: FC<AnswerProps> = ({ searchQuery, answer, done, onReset }) => {
  const markdownRef = useRef<HTMLDivElement>(null);
  const [titles, setTitles] = useState<string[]>([]); // 添加状态以保存标题数组
  const [actions, setActions] = useState<string[]>([]);

  useEffect(() => {
    console.log("Source Links:", searchQuery.sourceLinks); // 查看 URL 是否正确
    fetchTitles(searchQuery.sourceLinks).then(setTitles);
    setTitles(titles);
  }, [searchQuery.sourceLinks]);


  useEffect(() => {
    if (markdownRef.current) {
      const links = markdownRef.current.querySelectorAll('a');
      links.forEach(link => {
        const match = link.textContent?.match(/\[([0-9]+)\]/);
        if (match) {
          const index = parseInt(match[1], 10) - 1;
          const newLink = searchQuery.sourceLinks[index] || "#";
          link.setAttribute('href', newLink);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
          link.setAttribute('title', 'Open in new tab');
        }
      });
    }
  }, [searchQuery.sourceLinks, answer]);  // 依赖数组确保更新

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 py-16 px-8 sm:px-24 sm:pt-12 pb-32 overflow-auto" style={{ maxHeight: "90vh" }}>
      <div className="overflow-auto text-2xl sm:text-4xl font-georgia font-bold">{searchQuery.query}</div>
      <div className="rounded-lg bg-white shadow-lg p-4 sm:p-6">
        <div className="border-b border-zinc-800 pb-4">
          <div className="text-md text-blue-500 font-georgia">Answer</div>
          <div className="mt-2 overflow-auto font-georgia" ref={markdownRef}>
            <MemoizedReactMarkdown className="prose-sm prose-neutral">
              {answer}
            </MemoizedReactMarkdown>
          </div>
        </div>

        {done && (
  <div className="border-b border-zinc-800 pb-4">
    <div className="text-md text-blue-500 font-georgia">Sources</div>
    <div className="flex flex-wrap"> {/* 使用 flex 布局 */}
      {searchQuery.sourceLinks.map((source, index) => (
        <div className="w-full md:w-1/2 lg:w-1/3 p-1" key={index}> {/* 响应式网格 */}
          <Card className="flex flex-col h-full justify-between" style={{ minHeight: '100px' }}> {/* 确保有足够的空间显示内容 */}
            <CardContent className="p-2">
              <div className="flex items-center space-x-2 mb-2"> {/* 调整了间距 */}
                <Avatar className="h-6 w-6"> {/* 头像尺寸 */}
                  <AvatarImage
                    src={`https://www.google.com/s2/favicons?domain=${new URL(source).hostname}`}
                    alt={`Source ${index + 1}`}
                  />
                  <AvatarFallback>
                    {new URL(source).hostname[0]}
                  </AvatarFallback>
                </Avatar>
                <a
                  className="hover:cursor-pointer hover:underline text-xs sm:text-sm"
                  target="_blank" 
                  rel="noopener noreferrer"
                  href={source}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {`[${index + 1}] `}{new URL(source).hostname.replace("www.", "")}
                </a>
              </div>
              <div
                className="text-xs sm:text-sm"
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden'
                }}
              >
                {titles[index] || new URL(source).hostname}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  </div>
)}
{
  /*
  <div className="border-b border-zinc-800 pb-4 mt-4">
    <div className="text-md text-blue-500 font-georgia mb-2">Actions</div>
    <div className="flex flex-col space-y-2">
      <Button variant="outline" className="border-blue-500 hover:bg-blue-500 hover:text-white">
        Action 1
      </Button>
      <Button variant="outline" className="border-blue-500 hover:bg-blue-500 hover:text-white">
        Action 2
      </Button>
      <Button variant="outline" className="border-blue-500 hover:bg-blue-500 hover:text-white">
        Action 3
      </Button>
    </div>
  </div>
  */
}

      </div>

      {done && (
        <button className="flex h-10 w-52 items-center justify-center rounded-full bg-blue-500 p-2 hover:bg-blue-600 mt-4" onClick={onReset}>
          <IconReload size={18} />
          <div className="ml-2">Ask New Question</div>
        </button>
      )}
    </div>
  );
};
