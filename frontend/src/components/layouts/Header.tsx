'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Calendar,
  Bell,
  Mail,
  LogOut,
  Settings,
  UserCircle,
  Menu,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { currentUser } from '@/features/users/mocks/mockUsers'
import { mockChatRooms } from '@/features/chat/mocks/mockMessages'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/calendar',
    label: 'カレンダー',
    icon: Calendar,
  },
  {
    href: '/buddies',
    label: 'バディ',
    icon: UserCircle,
  },
  {
    href: '/matching',
    label: 'マッチング',
    icon: Users,
  },
]

const MOCK_NOTIFICATION_COUNT = 3

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 未読メッセージ合計を計算
  const totalUnreadMessages = mockChatRooms.reduce(
    (sum, room) => sum + room.unreadCount,
    0
  )

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <header className="border-b bg-background relative z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ActBuddy</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex gap-2">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Button variant="ghost" asChild>
                      <Link href={href}>
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right side UI area */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Notification Bell */}
              <div className="relative">
                <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                {MOCK_NOTIFICATION_COUNT > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {MOCK_NOTIFICATION_COUNT > 9
                      ? '9+'
                      : MOCK_NOTIFICATION_COUNT}
                  </span>
                )}
              </div>

              {/* Message Mail */}
              <div className="relative">
                <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                  </span>
                )}
              </div>

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold hover:opacity-80 transition-opacity">
                    {currentUser.name.charAt(0)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="w-4 h-4 mr-2" />
                    プロフィール
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    設定
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-2">
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Button
                      variant="ghost"
                      asChild
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href={href}>
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
