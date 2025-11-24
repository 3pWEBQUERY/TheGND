import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SidebarClient } from "./SidebarClient";

export async function Sidebar() {
  const session = await verifySession();
  let user = null;

  if (session?.userId) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { username: true, image: true, email: true },
    });
  }

  return <SidebarClient user={user} />;
}
