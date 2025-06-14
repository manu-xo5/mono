import logoHeadIcon from '@/shared/assets/logo-head-icon.png'

export function LogoHeadIcon() {
  return (
    <img
      src={logoHeadIcon}
      loading="eager"
      alt="Logo"
      class="object-[2px] size-15 box-content bg-muted"
    />
  )
}
