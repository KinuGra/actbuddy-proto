// 汎用エラー表示コンポーネント
export default function Error({ message }: { message: string }) {
  return <div style={{ color: 'red' }}>{message}</div>
}
