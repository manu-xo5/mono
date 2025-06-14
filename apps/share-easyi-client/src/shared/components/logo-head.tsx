import logoHeadSrc from '@/shared/assets/logo-head-generic.png'

export function LogoHead() {
  return (
    <img
      src={logoHeadSrc}
      loading="eager"
      alt="Logo"
      class="object-[2px] size-12 p-2 box-content bg-muted"
    />
  )
}
