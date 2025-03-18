import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <SignedOut>
        <Link href="/sign-in">
          Sign In
        </Link>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col items-center">
          <Link href="/user-profile-default">
            Update user email - default UI
          </Link>
          <Link href="/user-profile-custom">
            Update user email - custom UI
          </Link>
          <Link href="/user-balance-default">
            Retrieve user balance - default UI
          </Link>
          <Link href="/user-balance-custom">
            Retrieve user balance - custom UI
          </Link>
        </div>
      </SignedIn>
    </>
  );
}
