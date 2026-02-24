// ユーザーモックデータと現在ユーザー（Home画面用）
// Next.js/Feature単位での開発・テスト用
import { User } from '../types/user';

export const mockUsers: User[] = [
  // ...（必要に応じて追加）
];

// 現在ログインしているユーザー（モック）
export const currentUser: User = {
  id: 'current',
  name: 'あなた',
  age: 27,
  gender: 'male',
  goals: ['Web開発スキル向上', '英語学習', '早起き習慣化'],
  hobbies: ['プログラミング', '読書', 'カフェ巡り'],
  interests: ['Web開発', '技術書', 'スタートアップ'],
  achievementRate: 70,
  buddyCount: 1,
};
