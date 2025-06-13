import logoHeadErrorSrc from '../assets/logo-head-error.png'

export function LogoHeadError() {
  return (
    <img
      src={logoHeadErrorSrc}
      loading="eager"
      alt="Logo"
      class="object-[2px] size-12 p-2 box-content bg-muted"
    />
  )
}
