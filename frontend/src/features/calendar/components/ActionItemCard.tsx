import { ActionItem, ActionItemStatus } from '../types/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components//ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clock, MoreVertical, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface ActionItemCardProps {
  item: ActionItem;
  onStatusChange: (id: string, status: ActionItemStatus) => void;
  onDelete: (id: string) => void;
  isOwnItem?: boolean;
}

const statusConfig = {
  planned: { label: '予定', color: 'bg-blue-500', icon: Circle },
  'completed-70': { label: '70%以上達成', color: 'bg-green-500', icon: CheckCircle2 },
  'completed-30': { label: '30%以上達成', color: 'bg-yellow-500', icon: CheckCircle2 },
  'not-completed': { label: 'あまりできず', color: 'bg-red-500', icon: Circle },
};

export function ActionItemCard({ item, onStatusChange, onDelete, isOwnItem = true }: ActionItemCardProps) {
  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <Card className={`${isOwnItem ? '' : 'opacity-75 border-dashed'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <h3 className="font-semibold truncate">{item.title}</h3>
              {!isOwnItem && (
                <Badge variant="outline" className="text-xs">
                  バディ
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {format(item.startTime, 'HH:mm')} - {format(item.endTime, 'HH:mm')}
              </span>
            </div>
          </div>

          {isOwnItem && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onStatusChange(item.id, 'completed-70')}>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                  70%以上達成
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(item.id, 'completed-30')}>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-yellow-500" />
                  30%以上達成
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(item.id, 'not-completed')}>
                  <Circle className="w-4 h-4 mr-2 text-red-500" />
                  あまりできず
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(item.id, 'planned')}>
                  <Circle className="w-4 h-4 mr-2 text-blue-500" />
                  予定に戻す
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
