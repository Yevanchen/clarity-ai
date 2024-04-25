// RoundRectComponent.tsx
export type RoundRectComponentProps = {
  emoji: string;
  text: string;
  onClick: (text: string) => void;
};

export const RoundRectComponent: React.FC<RoundRectComponentProps> = ({ emoji, text, onClick }) => {
  return (
      <button className="flex items-center justify-start p-4 bg-[#F5EEE6] rounded-lg shadow-md whitespace-nowrap" onClick={() => onClick(text)}>
          <span className="text-xl mr-2">{emoji}</span>
          <span className="text-sm font-semibold">{text}</span>
      </button>
  );
};
  
  // EmojiGrid.tsx
  export type EmojiItem = {
    emoji: string;
    text: string;
  };
  
  export type EmojiGridProps = {
    items: EmojiItem[];
  };
  
  export const EmojiGrid: React.FC<EmojiGridProps & { onEmojiClick: (text: string) => void }> = ({ items, onEmojiClick }) => {
    type RowsArray = EmojiItem[][];
    const rows: RowsArray = items.slice(0, 15).reduce<RowsArray>((all, one, i) => {
        const ch = Math.floor(i / 5);
        all[ch] = [].concat(all[ch] || [], one);
        return all;
    }, []);

    return (
        <div className="flex flex-col items-center gap-4">
            {rows.map((rowItems, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-4">
                    {rowItems.map((item, itemIndex) => (
                        <RoundRectComponent key={itemIndex} emoji={item.emoji} text={item.text} onClick={onEmojiClick} />
                    ))}
                </div>
            ))}
        </div>
    );
};
