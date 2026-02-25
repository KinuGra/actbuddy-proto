"use client"

// マッチング状態管理用のカスタムフック
// matchingState: 現在の状態
// startMatching: マッチング開始
// cancelMatching: マッチングキャンセル
// acceptMatch: バディ承認
// rejectMatch: バディ拒否
import { useState, useCallback } from 'react';
import { MatchingState, MatchingStatus } from '../types/matching';
import { User } from '../../users/types/user';
import { mockUsers } from '../../users/mocks/mockUsers';

export function useMatching() {
  const [matchingState, setMatchingState] = useState<MatchingState>({
    status: 'idle',
    matchedUser: null,
    searchStartTime: null,
  });

  // マッチング開始: 2秒後にランダムなユーザーとマッチング
  const startMatching = useCallback(() => {
    setMatchingState({
      status: 'searching',
      matchedUser: null,
      searchStartTime: new Date(),
    });
    setTimeout(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      setMatchingState({
        status: 'matched',
        matchedUser: randomUser,
        searchStartTime: null,
      });
    }, 2000);
  }, []);

  // マッチングキャンセル
  const cancelMatching = useCallback(() => {
    setMatchingState({
      status: 'idle',
      matchedUser: null,
      searchStartTime: null,
    });
  }, []);

  // バディ承認
  const acceptMatch = useCallback(() => {
    setMatchingState((prev) => ({
      ...prev,
      status: 'in-buddy',
    }));
  }, []);

  // バディ拒否
  const rejectMatch = useCallback(() => {
    setMatchingState({
      status: 'idle',
      matchedUser: null,
      searchStartTime: null,
    });
  }, []);

  return {
    matchingState,
    startMatching,
    cancelMatching,
    acceptMatch,
    rejectMatch,
  };
}
