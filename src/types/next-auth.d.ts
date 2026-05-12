import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan?: string;
      documentsUsed?: number;
    };
  }

  interface User {
    plan?: string;
    documentsUsed?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan: string;
    documentsUsed: number;
  }
}
