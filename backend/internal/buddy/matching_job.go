package buddy

import (
	"context"
	"log"
	"time"
)

// StartMatchingJob はマッチングジョブを定期実行するゴルーチンを起動する
func StartMatchingJob(service *Service) {
	ticker := time.NewTicker(1 * time.Hour)
	go func() {
		// 起動直後に1回実行
		runMatchingWithLog(service)

		for range ticker.C {
			runMatchingWithLog(service)
		}
	}()
}

func runMatchingWithLog(service *Service) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	log.Println("[matching_job] マッチング処理を開始")
	if err := service.RunMatching(ctx); err != nil {
		log.Printf("[matching_job] マッチング処理でエラーが発生しました: %v", err)
		return
	}
	log.Println("[matching_job] マッチング処理が完了しました")
}
