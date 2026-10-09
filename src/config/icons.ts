// নাম → Hugeicons। আইকন বদলাতে শুধু এখানে। (docs/PLAN.md §৩.২)
import {
  Home01Icon, UserGroupIcon, Share08Icon, Settings01Icon, PlusSignIcon, GiftIcon, ArrowDown01Icon, ArrowUp01Icon,
  PrinterIcon, Download01Icon, Delete02Icon, GitMergeIcon, QrCodeIcon, Copy01Icon, ArrowLeft01Icon, Search01Icon,
  Tick02Icon, Cancel01Icon, RefreshIcon, Alert02Icon, CloudOffIcon, Key01Icon, MoreVerticalIcon, Edit02Icon,
  Call02Icon, Mail01Icon, GoogleSheetIcon, Book02Icon, Logout01Icon, UserIcon, Calendar03Icon, Location01Icon,
  ArrowRight01Icon, Clock01Icon, Link01Icon, SentIcon, GoogleIcon, InformationCircleIcon, InboxIcon, DiamondIcon,
  Sun01Icon, Restaurant01Icon, Baby01Icon, StarIcon, BirthdayCakeIcon, MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"

export const icons = {
  home: Home01Icon, people: UserGroupIcon, share: Share08Icon, settings: Settings01Icon,
  plus: PlusSignIcon, gift: GiftIcon, in: ArrowDown01Icon, out: ArrowUp01Icon,
  print: PrinterIcon, download: Download01Icon, trash: Delete02Icon, merge: GitMergeIcon,
  qr: QrCodeIcon, copy: Copy01Icon, back: ArrowLeft01Icon, search: Search01Icon,
  check: Tick02Icon, x: Cancel01Icon, sync: RefreshIcon, warning: Alert02Icon,
  cloudOff: CloudOffIcon, key: Key01Icon, more: MoreVerticalIcon, edit: Edit02Icon,
  phone: Call02Icon, mail: Mail01Icon, sheet: GoogleSheetIcon, book: Book02Icon,
  logout: Logout01Icon, user: UserIcon, calendar: Calendar03Icon, location: Location01Icon,
  chevronDown: ArrowDown01Icon, chevronRight: ArrowRight01Icon, clock: Clock01Icon,
  link: Link01Icon, send: SentIcon, google: GoogleIcon, info: InformationCircleIcon, inbox: InboxIcon,
  wedding: DiamondIcon, holud: Sun01Icon, walima: Restaurant01Icon, baby: Baby01Icon,
  star: StarIcon, cake: BirthdayCakeIcon, other: MoreHorizontalIcon,
} as const

export type IconName = keyof typeof icons
