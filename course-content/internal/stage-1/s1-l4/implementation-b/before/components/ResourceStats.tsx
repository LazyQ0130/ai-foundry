export default function ResourceStats({ totalCount }: { totalCount: number }) {
  return (
    <p className="mt-5 text-[12.5px] text-stone-400">
      共 {totalCount} 条资料
    </p>
  );
}
