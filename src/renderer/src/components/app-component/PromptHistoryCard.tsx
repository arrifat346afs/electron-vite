import { Button } from "../ui/button";
import { Copy, ExternalLink, Trash2, Eye } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { PromptHistoryItem } from "../../hooks/usePromptHistory";

interface PromptHistoryCardProps {
  item: PromptHistoryItem;
  index: number;
  isSelected: boolean;
  onToggleSelection: (url: string) => void;
  onView: (prompt: string) => void;
  onCopy: (prompt: string) => void;
  onDelete: (url: string) => void;
}

const PromptHistoryCard = ({
  item,
  index,
  isSelected,
  onToggleSelection,
  onView,
  onCopy,
  onDelete,
}: PromptHistoryCardProps) => {
  return (
    <Card className="w-72 shrink-0 max-h-[200px] flex flex-col">
      <CardHeader className="pb-1 pt-2 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Checkbox
              id={`select-${index}`}
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(item.url)}
              className="h-3 w-3"
            />
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 truncate max-w-[100px]"
              title={item.url}
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {new URL(item.url).hostname}
              </span>
            </a>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onView(item.prompt)}
              title="View full prompt"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onCopy(item.prompt)}
              title="Copy to clipboard"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onDelete(item.url)}
              title="Delete prompt"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-1 px-3 flex-grow overflow-hidden">
        <p className="text-xs text-muted-foreground break-words line-clamp-3 overflow-hidden">
          {item.prompt.substring(0, 200)}
          {item.prompt.length > 200 ? "..." : ""}
        </p>
      </CardContent>
      <CardFooter className="pt-0 pb-2 px-3">
        <span className="text-xs text-muted-foreground">
          {new Date(item.timestamp).toLocaleString()}
        </span>
      </CardFooter>
    </Card>
  );
};

export default PromptHistoryCard;
