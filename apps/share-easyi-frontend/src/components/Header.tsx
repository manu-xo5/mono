import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="p-2 flex items-center gap-2 border-b text-primary fixed top-0 w-full z-10 h-12 bg-muted border-white/10">
      <nav className="flex flex-row gap-x-6 items-center">
        <div className="px-2 font-bold text-lg">
          <Link to="/home">Home</Link>
        </div>

        <div className="px-2 text-muted-foreground">
          <Link to="/login">Auth</Link>
        </div>
      </nav>
    </header>
  )
}
