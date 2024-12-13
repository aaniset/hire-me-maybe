// import { getServerSession } from "next-auth/next"

import { auth } from "@/auth";

export async function getCurrentUser() {
  const session = await auth();
  const user = {
    id: session?.user.id,
    name: session?.user.name,
    email: session?.user.email,
    image: session?.user.image,
    gmailConnected: session?.user.gmailConnected,
    gmailAccount: session?.user.gmailConnected,
    gmailProfileImg: session?.user.gmailProfileImg,
  };
  return user;
}
