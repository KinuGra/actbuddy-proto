'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from '../types/chat'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { format } from 'date-fns'

interface ChatWindowProps {
  roomId: string
  participantName: string
  messages: Message[]
  currentUserId: string | null
  onSendMessage: (roomId: string, content: string) => void
}

export function ChatWindow({
  roomId,
  participantName,
  messages,
  currentUserId,
  onSendMessage,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    onSendMessage(roomId, inputValue.trim())
    setInputValue('')
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-140px)] md:h-[600px]">
      <CardHeader className="border-b">
        <CardTitle>{participantName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {!isOwn && (
                  <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                )}
                <p className="text-sm break-words">{message.content}</p>
                <span
                  className={`text-xs mt-1 block ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                >
                  {format(message.timestamp, 'HH:mm')}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
