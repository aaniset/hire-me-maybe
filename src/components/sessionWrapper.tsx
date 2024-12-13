// app/SessionWrapper.tsx

"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode } from "react";
import Loader from "./loader";

interface SessionWrapperProps {
  children: ReactNode;
}

function AuthContent({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return <Loader className=" absolute inset-0" />;
  }

  return <>{children}</>;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <SessionProvider>
      <AuthContent>{children}</AuthContent>
    </SessionProvider>
  );
}
