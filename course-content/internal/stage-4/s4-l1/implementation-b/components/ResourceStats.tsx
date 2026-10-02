export default function ResourceStats({ currentCount, totalCount }: { currentCount: number; totalCount: number }) {
  return (
    <p className="mt-5 text-[12.5px] text-stone-400">
      当前显示 {currentCount} 条 · 共 {totalCount} 条资料
    </p>
  );
}
