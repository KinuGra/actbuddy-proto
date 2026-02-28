import { ChatRoom } from '../types/chat'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { MessageSquare } from 'lucide-react'

interface ChatRoomListProps {
  rooms: ChatRoom[]
  onSelectRoom: (roomId: string) => void
  selectedRoomId?: string
}

export function ChatRoomList({
  rooms,
  onSelectRoom,
  selectedRoomId,
}: ChatRoomListProps) {
  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">チャットルームがありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Card
          key={room.id}
          className={`cursor-pointer transition-colors hover:bg-accent ${
            selectedRoomId === room.id ? 'border-primary' : ''
          }`}
          onClick={() => onSelectRoom(room.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{room.participantName}</h3>
                  {room.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {room.unreadCount}
                    </Badge>
                  )}
                </div>
                {room.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {room.lastMessage.content}
                  </p>
                )}
              </div>
              {room.lastMessage && (
                <span className="text-xs text-muted-foreground ml-2">
                  {format(room.lastMessage.timestamp, 'MM/dd HH:mm')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
