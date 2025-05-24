import { setCallStore } from '@/call-service/store'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { PhoneIcon, PhoneMissedIcon } from 'lucide-solid'
import { CallRipple } from './call-ripples'
import { Flexbox } from './ui/flex'

export function CallDialog() {
  return (
    <dialog
      open={true}
      class="absolute left-1/2 top-1/2 -translate-1/2 z-10 bg-secondary text-secondary-foreground rounded-xl h-96 w-72 border shadow-xl"
    >
      <Stack class="items-center p-4 gap-6 h-full">
        <p class="text-xl xanimate-bounce animate-pulse">Calling...</p>

        <div class="size-20 bg-black rounded-full border relative">
          <CallRipple />

          <img
            class="rounded-full z-20 absolute"
            src="https://lh3.googleusercontent.com/a/ACg8ocKESAosQC7kUMUPSlLmdIUPokPgTBr-tbSAeTkqIFWBcadrw9u6=s96-c"
            referrerPolicy="no-referrer"
          />
        </div>

        <Flexbox class="justify-around w-full mt-auto py-10">
          <Button
            variant="default"
            size="icon"
            class="rounded-full"
            onClick={() => {
              setCallStore((prev) => ({
                ...prev,
                status: 'idle',
              }))
            }}
          >
            <PhoneIcon />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            class="rounded-full -scale-x-100"
            onClick={() => {
              setCallStore((prev) => ({
                ...prev,
                status: 'idle',
              }))
            }}
          >
            <PhoneMissedIcon />
          </Button>
        </Flexbox>
      </Stack>
    </dialog>
  )
}
