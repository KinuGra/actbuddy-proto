import { User } from '../../users/types/user';

export type BuddyStatus = 'active' | 'completed';
export type RelationType = 'buddy' | 'friend';

export interface Buddy {
  id: string;
  user: User;
  startDate: Date;
  endDate: Date;
  status: BuddyStatus;
  relationType: RelationType;
  canBecomeFriend: boolean; // 1週間経過したらtrue
}
