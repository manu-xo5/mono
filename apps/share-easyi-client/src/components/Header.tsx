import { Link, useLocation } from '@tanstack/solid-router'

export default function Header() {
  const location = useLocation()

  return (
    <header class="p-2 flex items-center gap-2 border-b text-primary-foreground fixed top-0 w-full z-10 h-12 bg-primary border-white/10">
      <nav class="flex flex-row gap-x-6 items-center">
        <div class="px-2 font-bold text-lg">
          <Link to="/home">Home</Link>
        </div>

        <div class="px-2 text-muted-foreground">
          <Link to="/login">Auth</Link>
        </div>
        <p>{location().href}</p>
      </nav>
    </header>
  )
}
