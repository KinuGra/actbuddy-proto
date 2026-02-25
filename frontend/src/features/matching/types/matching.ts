// マッチング機能の状態・型定義
// MatchingStatus: マッチング状態
// MatchingState: 現在の状態（matchedUser, searchStartTime含む）
// BuddyRelation: バディ関係の詳細
import { User } from '../../users/types/user';

export type MatchingStatus = 'idle' | 'searching' | 'matched' | 'in-buddy';

export interface MatchingState {
  status: MatchingStatus;
  matchedUser: User | null;
  searchStartTime: Date | null;
}

export interface BuddyRelation {
  id: string;
  user: User;
  startDate: Date;
  endDate: Date;
  isFriend: boolean;
}
