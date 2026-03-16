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
  participantName: string
  messages: Message[]
  onSendMessage: (content: string) => void
  wsURL: string
}

export function ChatWindow({
  participantName,
  messages,
  onSendMessage,
  wsURL,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    //接続の開始
    const ws = new WebSocket(wsURL)
    wsRef.current = ws

    ws.onopen = () => console.log("Web socket opened")

    // サーバーからのメッセージの取得
    ws.onmessage = (event) => {
      console.log("Received:", event.data)
    }
    ws.onclose = () => console.log('WebSocket disconnected')

    return () => ws.close()
  }, [wsURL])

  // サーバーへメッセージを送る
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: `m${Date.now()}`,
        senderId: '3',
        senderName: 'あなた',
        content: inputValue.trim(),
        timestamp: new Date(),
        isRead: false,
      }

      // websocketでメッセージを送信
      wsRef.current?.send(JSON.stringify(newMessage))
      onSendMessage(inputValue)
      setInputValue('')
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <CardTitle>{participantName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === 'current'
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
