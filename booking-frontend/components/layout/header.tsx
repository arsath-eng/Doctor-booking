import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl font-primary text-primary">
              Maryam Medicare
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/booking" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Booking
            </Link>
            <Link href="/notice" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Notices
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Admin Panel</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/admin/login?role=admin">Login as Admin</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/login?role=superadmin">Login as Super Admin</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          {/* Mobile Menu can be added here if needed */}
        </div>
      </div>
    </header>
  )
}