import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Home, Calendar, MessageSquare, UserCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auhref px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">BuddyMatch</span>
          </Link>
          <nav className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                ホーム
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/calendar">
                <Calendar className="w-4 h-4 mr-2" />
                カレンダー
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/buddies">
                <UserCircle className="w-4 h-4 mr-2" />
                バディ
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                チャット
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/matching">
                <Users className="w-4 h-4 mr-2" />
                マッチング
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}