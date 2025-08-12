import { UserCircle } from "lucide-react";
import LogoutButton from "../authComponents/LogoutButton";
import { ModeToggle } from "../ModeToggle";

export default function Navbar() {
  return (
    <div className="dark:bg-gray-950 bg-gray-200  py-4 px-4 rounded-full flex items-center justify-between">
      <div>
        <h1>Hello</h1>
      </div>
      <div className="flex items-center gap-8">
        <ModeToggle />
        <UserCircle className="w-14 h-10" />
        <LogoutButton />
      </div>
    </div>
  );
}
