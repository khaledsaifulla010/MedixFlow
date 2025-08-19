import LogoWithName from "@/components/common/LogoWithName/LogoWithName";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
  return (
    <div>
      <LogoWithName />
      <div className="border-2 h-24 w-[600px] flex items-center justify-center rounded-md gap-12 ml-[480px] mt-8">
        <Link href="/login">
          {" "}
          <Button className="font-bold text-lg cursor-pointer">Login</Button>
        </Link>

        <Link href="/register/patient">
          {" "}
          <Button className="font-bold text-lg cursor-pointer">
            Join as Patient
          </Button>
        </Link>
        <Link href="/register/doctor">
          {" "}
          <Button className="font-bold text-lg cursor-pointer">
            Join as Doctor
          </Button>
        </Link>
      </div>
    </div>
  );
}
