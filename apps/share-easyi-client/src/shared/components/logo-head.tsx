import logoHeadSrc from '@/shared/assets/logo-head.png'
// import logoHeadSrc from '@/shared/assets/20250612_1255_Centered Parrot Outline_remix_01jxhgc3wvf1j9hgzt2pczsdy8.png'
// import logoHeadSrc from '@/shared/assets/20250612_1255_Centered Parrot Outline_remix_01jxhgc3wwfpyr1e7kxb57rd8t.png'
// import logoHeadSrc from '@/shared/assets/20250612_1255_Centered Parrot Outline_remix_01jxhgc3wye59szpgf1v07r2j0.png'
// import logoHeadSrc from '@/shared/assets/20250612_1339_Skeuomorphic Parrot Icon_remix_01jxhjwz7pfwfb1npavw1496vc.png'
// import logoHeadSrc from '@/shared/assets/logo-full.png'

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
