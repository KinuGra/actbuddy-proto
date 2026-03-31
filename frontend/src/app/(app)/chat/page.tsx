'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useChat } from '@/features/chat/hooks/useChat'
import { ChatRoomList } from '@/features/chat/components/ChatRoomList'
import { ChatWindow } from '@/features/chat/components/ChatWindow'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

function ChatContent() {
  const searchParams = useSearchParams()
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined)

  const { chatRooms, wsURL, fetchMessages, addMessage, getMessages } = useChat()

  // ?room=<uuid> でルームを初期選択
  useEffect(() => {
    const roomParam = searchParams.get('room')
    if (roomParam) {
      setSelectedRoomId(roomParam)
    }
  }, [searchParams])

  // ルーム選択時にメッセージ履歴を取得
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    fetchMessages(roomId)
  }

  const selectedRoom = chatRooms.find((r) => r.id === selectedRoomId)
  const messages = selectedRoomId ? getMessages(selectedRoomId) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">チャット</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">チャットルーム</h2>
          <ChatRoomList
            rooms={chatRooms}
            onSelectRoom={handleSelectRoom}
            selectedRoomId={selectedRoomId}
          />
        </div>

        <div className="md:col-span-2">
          {selectedRoom && selectedRoomId ? (
            <ChatWindow
              roomId={selectedRoomId}
              participantName={selectedRoom.participantName}
              messages={messages}
              currentUserId={currentUserId}
              onReceiveMessage={addMessage}
              wsURL={wsURL}
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

export default function Chat() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  )
}
