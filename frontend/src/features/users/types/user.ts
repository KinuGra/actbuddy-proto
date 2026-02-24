// ユーザー型定義（Home画面や他機能で利用）
// Next.js/Feature単位での型安全な開発用
export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  goals: string[];
  hobbies: string[];
  interests: string[];
  achievementRate: number; // 達成率 (0-100)
  buddyCount: number; // 同時にバディになれる人数
}

export interface UserProfile extends User {
  bio?: string;
  joinedDate: Date;
}
