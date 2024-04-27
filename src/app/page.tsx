import { Button } from "@/components/ui/button";
import Image from "next/image";

import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import LoginButton from "@/components/auth/login-button";

const font = Poppins({
  weight: "600", //We are using the semibold option
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="space-y-6 text-center">
        <h1
          className={cn(
            "text-white text-6xl drop-shadow-md font-semibold",
            font.className
          )}
        >
          {" "}
          Auth
        </h1>
        <p className="text-white text-lg">A simple authentication service</p>
        <div>
        <LoginButton mode="modal" asChild>
          <Button variant="secondary" size="lg">
            Sign In
          </Button>
        </LoginButton>
        </div>
        
      </div>
    </main>
  );
}
