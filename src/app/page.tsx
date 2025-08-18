import LogoutButton from "@/components/authComponents/LogoutButton";
import { ModeToggle } from "@/components/ModeToggle";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl">MedixFlow</h1>
      <ModeToggle />

      <div className="mt-12 ml-56">
        <LogoutButton />
      </div>
    </div>
  );
}
