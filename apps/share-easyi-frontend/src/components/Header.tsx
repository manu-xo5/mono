import { Link } from "@tanstack/react-router"

export default function Header() {
    return (
        <header className="p-2 flex items-center gap-2 border-card border-b text-primary fixed top-0 w-full z-10 h-12">
            <nav className="flex flex-row">
                <div className="px-2 font-bold">
                    <Link to="/">Home</Link>
                </div>

                <div className="px-2 font-bold"></div>
            </nav>
        </header>
    )
}
