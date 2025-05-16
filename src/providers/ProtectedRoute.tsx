"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { address, isConnecting } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnecting && !address) {
      router.push("/");
    }
  }, [address, isConnecting, router]);

  if (!address) {
    return null;
  }

  return <>{children}</>;
}