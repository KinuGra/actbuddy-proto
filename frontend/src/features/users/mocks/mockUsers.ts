// ユーザーモックデータと現在ユーザー（Home画面用）
// Next.js/Feature単位での開発・テスト用
import { User } from '../types/user'

export const mockUsers: User[] = [
  {
    id: '1',
    name: '田中太郎',
    age: 25,
    gender: 'male',
    goals: ['プログラミング学習', 'TOEIC 800点', '副業開始'],
    hobbies: ['読書', 'ゲーム', 'カフェ巡り'],
    interests: ['Web開発', '英語学習', 'スタートアップ'],
    achievementRate: 75,
    buddyCount: 2,
  },
  {
    id: '2',
    name: '佐藤花子',
    age: 28,
    gender: 'female',
    goals: ['資格取得', 'ダイエット', 'ブログ執筆'],
    hobbies: ['ヨガ', '料理', '映画鑑賞'],
    interests: ['健康', 'ライフスタイル', 'マーケティング'],
    achievementRate: 82,
    buddyCount: 3,
  },
  {
    id: '3',
    name: '鈴木一郎',
    age: 22,
    gender: 'male',
    goals: ['大学院合格', '論文執筆', '英語論文読解'],
    hobbies: ['筋トレ', 'アニメ', 'プログラミング'],
    interests: ['機械学習', '研究', 'データサイエンス'],
    achievementRate: 68,
    buddyCount: 1,
  },
  {
    id: '4',
    name: '高橋美咲',
    age: 26,
    gender: 'female',
    goals: ['キャリアアップ', 'デザインスキル向上', 'ポートフォリオ作成'],
    hobbies: ['イラスト', '旅行', 'カメラ'],
    interests: ['UI/UX', 'デザイン', 'クリエイティブ'],
    achievementRate: 79,
    buddyCount: 2,
  },
]

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
}
