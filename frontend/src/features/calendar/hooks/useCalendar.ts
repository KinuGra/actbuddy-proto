import { useState, useCallback } from 'react';
import { ActionItem, CalendarView, ActionItemStatus } from '../types/calendar';
import { mockActionItems } from '../mocks/mockActionItems';

export function useCalendar() {
  const [view, setView] = useState<CalendarView>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [actionItems, setActionItems] = useState<ActionItem[]>(mockActionItems);

  const addActionItem = useCallback((item: Omit<ActionItem, 'id' | 'createdAt'>) => {
    const newItem: ActionItem = {
      ...item,
      id: `ai-${Date.now()}`,
      createdAt: new Date(),
    };
    setActionItems((prev) => [...prev, newItem]);
  }, []);

  const updateActionItemStatus = useCallback((id: string, status: ActionItemStatus) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }, []);

  const deleteActionItem = useCallback((id: string) => {
    setActionItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getItemsForDate = useCallback(
    (date: Date) => {
      return actionItems.filter((item) => {
        const itemDate = new Date(item.startTime);
        return (
          itemDate.getFullYear() === date.getFullYear() &&
          itemDate.getMonth() === date.getMonth() &&
          itemDate.getDate() === date.getDate()
        );
      });
    },
    [actionItems]
  );

  return {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    actionItems,
    addActionItem,
    updateActionItemStatus,
    deleteActionItem,
    getItemsForDate,
  };
}
