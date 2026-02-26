"use client"
import { useState } from 'react';
import { useCalendar } from '@/features/calendar/hooks/useCalendar';
import { ActionItemCard } from '@/features/calendar/components/ActionItemCard';
import { AddActionItemDialog } from '@/features/calendar/components/AddActionItemDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { mockActionItems } from '@/features/calendar/mocks/mockActionItems';

export default function Calendar() {
  const {
    selectedDate,
    setSelectedDate,
    actionItems,
    addActionItem,
    updateActionItemStatus,
    deleteActionItem,
    getItemsForDate,
  } = useCalendar();

  const [activeTab, setActiveTab] = useState<'my' | 'buddy'>('my');

  const todayItems = getItemsForDate(selectedDate);
  const myItems = todayItems.filter((item) => item.userId === 'current');
  const buddyItems = actionItems.filter((item) => item.userId !== 'current' && 
    new Date(item.startTime).toDateString() === selectedDate.toDateString()
  );

  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Action Item</h1>
          <AddActionItemDialog selectedDate={selectedDate} onAdd={addActionItem} />
        </div>

        {/* 日付選択 */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">
                    {format(selectedDate, 'yyyy年MM月dd日')}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'EEEE', { locale: undefined })}
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={goToNextDay}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={goToToday}>
                今日に戻る
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'my' | 'buddy')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my">
              自分のAction Item ({myItems.length})
            </TabsTrigger>
            <TabsTrigger value="buddy">
              バディのAction Item ({buddyItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="space-y-4">
            {myItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">
                    この日のAction Itemはまだありません
                  </p>
                  <AddActionItemDialog selectedDate={selectedDate} onAdd={addActionItem} />
                </CardContent>
              </Card>
            ) : (
              <>
                {myItems.map((item) => (
                  <ActionItemCard
                    key={item.id}
                    item={item}
                    onStatusChange={updateActionItemStatus}
                    onDelete={deleteActionItem}
                    isOwnItem={true}
                  />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="buddy" className="space-y-4">
            {buddyItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    バディのAction Itemはありません
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {buddyItems.map((item) => (
                  <ActionItemCard
                    key={item.id}
                    item={item}
                    onStatusChange={updateActionItemStatus}
                    onDelete={deleteActionItem}
                    isOwnItem={false}
                  />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* 達成率サマリー */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>今日の進捗</CardTitle>
            <CardDescription>Action Itemの達成状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {myItems.filter((i) => i.status === 'planned').length}
                </div>
                <p className="text-sm text-muted-foreground">予定</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {myItems.filter((i) => i.status === 'completed-70').length}
                </div>
                <p className="text-sm text-muted-foreground">70%以上</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {myItems.filter((i) => i.status === 'completed-30').length}
                </div>
                <p className="text-sm text-muted-foreground">30%以上</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {myItems.filter((i) => i.status === 'not-completed').length}
                </div>
                <p className="text-sm text-muted-foreground">未達成</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
