import { SearchQuery } from "@/types";
import { IconReload } from "@tabler/icons-react";
import { FC } from "react";

interface AnswerProps {
  searchQuery: SearchQuery;
  answer: string;
  done: boolean;
  onReset: () => void;
}

export const Answer: FC<AnswerProps> = ({ searchQuery, answer, done, onReset }) => {
  return (
    <div className="max-w-[1000px] mx-auto space-y-4 py-16 px-8 sm:px-24 sm:pt-12 pb-32 overflow-auto" style={{ maxHeight: "90vh" }}>
      <div className="overflow-auto text-2xl sm:text-4xl font-georgia font-bold">{searchQuery.query}</div>

      {/* Wrapper 开始 */}
      <div className="rounded-lg bg-white shadow-lg p-4 sm:p-6">
        <div className="border-b border-zinc-800 pb-4">
          <div className="text-md text-blue-500 font-georgia">Answer</div>
          <div className="mt-2 overflow-auto  font-georgia">{replaceSourcesWithLinks(answer, searchQuery.sourceLinks)}</div>
        </div>

        {done && (
          <>
            <div className="border-b border-zinc-800 pb-4">
              <div className="text-md text-blue-500 font-georgia">Sources</div>

              {searchQuery.sourceLinks.map((source, index) => (
                <div key={index} className="mt-1 overflow-auto">
                  {`[${index + 1}] `}
                  <a
                    className="hover:cursor-pointer hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={source}
                  >
                    {source.split("//")[1].split("/")[0].replace("www.", "")}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Wrapper 结束 */}

      {done && (
        <button
          className="flex h-10 w-52 items-center justify-center rounded-full bg-blue-500 p-2 hover:cursor-pointer hover:bg-blue-600 mt-4"
          onClick={onReset}
        >
          <IconReload size={18} />
          <div className="ml-2">Ask New Question</div>
        </button>
      )}
    </div>
  );
};


const replaceSourcesWithLinks = (answer: string, sourceLinks: string[]) => {
  const elements = answer.split(/(\[[0-9]+\])/).map((part, index) => {
    if (/\[[0-9]+\]/.test(part)) {
      const link = sourceLinks[parseInt(part.replace(/[\[\]]/g, "")) - 1];

      return (
        <a
          key={index}
          className="hover:cursor-pointer text-blue-500"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      );
    } else {
      return part;
    }
  });

  return elements;
};