import { prisma } from "./prisma";
import { getPlanLimit } from "./utils";

export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; limit: number; used: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, documentsUsed: true, billingCycleStart: true },
  });

  if (!user) {
    return { allowed: false, limit: 0, used: 0 };
  }

  const limit = getPlanLimit(user.plan);
  const now = new Date();
  const msElapsed = now.getTime() - new Date(user.billingCycleStart).getTime();
  const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);

  if (daysElapsed >= 30) {
    await prisma.user.update({
      where: { id: userId },
      data: { documentsUsed: 0, billingCycleStart: now },
    });
    return { allowed: true, limit, used: 0 };
  }

  return {
    allowed: user.documentsUsed < limit,
    limit,
    used: user.documentsUsed,
  };
}
