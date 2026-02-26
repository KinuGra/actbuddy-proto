import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MessageSquare, UserCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
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
    href: '/chat',
    label: 'チャット',
    icon: MessageSquare,
  },
  {
    href: '/matching',
    label: 'マッチング',
    icon: Users,
  },
];

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ActBuddy</span>
          </Link>
          <nav>
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
        </div>
      </div>
    </header>
  );
}