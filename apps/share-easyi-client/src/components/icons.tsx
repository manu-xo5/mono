import PhoneCall from 'lucide-solid/icons/phone-call'
import Phone from 'lucide-solid/icons/phone'
import PhoneMissed from 'lucide-solid/icons/phone-missed'
import Check from 'lucide-solid/icons/check'
import CircleX from 'lucide-solid/icons/circle-x'
import Clock7 from 'lucide-solid/icons/clock-7'
import Copy from 'lucide-solid/icons/copy'
import ScreenShare from 'lucide-solid/icons/screen-share'
import type { LucideProps } from 'lucide-solid'

import type { JSX } from 'solid-js'

export const Icons = {
  PhoneCall,
  Phone,
  PhoneMissed,
  Check,
  CircleX,
  Clock7,
  Copy,
  ScreenShare,
} satisfies Record<string, (props: LucideProps) => JSX.Element>
