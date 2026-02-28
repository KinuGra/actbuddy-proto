'use client'
import { useState } from 'react'
import { useChat } from '@/features/chat/hooks/useChat'
import { ChatRoomList } from '@/features/chat/components/ChatRoomList'
import { ChatWindow } from '@/features/chat/components/ChatWindow'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default function Chat() {
  const { chatRooms, sendMessage, getMessages } = useChat()
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(
    undefined
  )

  const selectedRoom = chatRooms.find((room) => room.id === selectedRoomId)
  const messages = selectedRoomId ? getMessages(selectedRoomId) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">チャット</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* チャットルーム一覧 */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">チャットルーム</h2>
          <ChatRoomList
            rooms={chatRooms}
            onSelectRoom={setSelectedRoomId}
            selectedRoomId={selectedRoomId}
          />
        </div>

        {/* チャットウィンドウ */}
        <div className="md:col-span-2">
          {selectedRoom ? (
            <ChatWindow
              participantName={selectedRoom.participantName}
              messages={messages}
              onSendMessage={(content) => sendMessage(selectedRoomId!, content)}
            />
          ) : (
            <Card className="h-[600px]">
              <CardContent className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  チャットルームを選択してください
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
