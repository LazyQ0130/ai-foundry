import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Boxes,
  Braces,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudUpload,
  Code2,
  Crosshair,
  Database,
  FileText,
  Gem,
  Hammer,
  Layers,
  Lock,
  MessageSquareText,
  Play,
  RefreshCw,
  Route,
  Rocket,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const map: Record<string, LucideIcon> = {
  layers: Layers,
  box: Boxes,
  code: Code2,
  target: Target,
  focus: Crosshair,
  zap: Zap,
  trending: TrendingUp,
  file: FileText,
  sparkles: Sparkles,
  check: CheckCircle2,
  send: Send,
  path: Route,
  gem: Gem,
  refresh: RefreshCw,
  users: Users,
  search: Search,
  database: Database,
  build: Hammer,
  deploy: CloudUpload,
  collab: Workflow,
  api: Braces,
  prompt: MessageSquareText,
  verify: BadgeCheck,
  ship: Rocket,
  clock: Clock,
  lock: Lock,
  play: Play,
  checkPlain: Check,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
}

export type IconName = keyof typeof map

export function Icon({
  name,
  className,
  strokeWidth = 1.8,
}: {
  name: string
  className?: string
  strokeWidth?: number
}) {
  const Cmp = map[name] ?? Sparkles
  return <Cmp className={className} strokeWidth={strokeWidth} />
}

/** 从用户提供的品牌图中按比例裁切；保留原始图片，便于之后替换正式透明素材。 */
export function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <span className={`brand-icon relative inline-block shrink-0 overflow-hidden ${className}`} aria-hidden="true">
      <img src="/brand-icon.png" alt="" draggable={false} />
    </span>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`brand-wordmark relative inline-block shrink-0 overflow-hidden ${className}`} role="img" aria-label="AIFoundry">
      <img src="/brand-board.png" alt="" draggable={false} />
    </span>
  )
}

export function BrandLockup({ className = '' }: { className?: string }) {
  return (
    <span className={`brand-lockup relative inline-block shrink-0 overflow-hidden ${className}`} role="img" aria-label="AIFoundry">
      <img src="/brand-board.png" alt="" draggable={false} />
    </span>
  )
}
