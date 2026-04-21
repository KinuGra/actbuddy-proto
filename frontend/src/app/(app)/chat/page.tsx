'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useChat } from '@/features/chat/hooks/useChat'
import { ChatRoomList } from '@/features/chat/components/ChatRoomList'
import { ChatWindow } from '@/features/chat/components/ChatWindow'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft } from 'lucide-react'

function ChatContent() {
  const searchParams = useSearchParams()
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined)

  const { chatRooms, currentUserId, fetchMessages, addMessage, getMessages, markRoomAsRead, setActiveRoom, sendMessage } = useChat()

  useEffect(() => {
    const roomParam = searchParams.get('room')
    if (roomParam) {
      setSelectedRoomId(roomParam)
      fetchMessages(roomParam)
      markRoomAsRead(roomParam)
    }
  }, [searchParams])

  // アクティブルームの同期
  useEffect(() => {
    setActiveRoom(selectedRoomId)
  }, [selectedRoomId, setActiveRoom])

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    fetchMessages(roomId)
    markRoomAsRead(roomId)
  }

  const selectedRoom = chatRooms.find((r) => r.id === selectedRoomId)
  const messages = selectedRoomId ? getMessages(selectedRoomId) : []

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ルーム一覧: モバイルでは会話選択中は非表示 */}
        <div className={`md:col-span-1 ${selectedRoomId ? 'hidden md:block' : 'block'}`}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">チャットルーム</p>
          <ChatRoomList
            rooms={chatRooms}
            onSelectRoom={handleSelectRoom}
            selectedRoomId={selectedRoomId}
          />
        </div>

        {/* 会話ウィンドウ: モバイルでは会話選択中のみ表示 */}
        <div className={`md:col-span-2 ${selectedRoomId ? 'block' : 'hidden md:block'}`}>
          {selectedRoom && selectedRoomId ? (
            <div className="flex flex-col gap-2">
              {/* モバイル用の戻るボタン */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden self-start -ml-2 text-muted-foreground"
                onClick={() => setSelectedRoomId(undefined)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                ルーム一覧
              </Button>
              <ChatWindow
                roomId={selectedRoomId}
                participantName={selectedRoom.participantName}
                messages={messages}
                currentUserId={currentUserId}
                onSendMessage={sendMessage}
              />
            </div>
          ) : (
            <Card className="hidden md:flex h-[600px] items-center justify-center">
              <div className="flex flex-col items-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm">チャットルームを選択してください</p>
              </div>
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
