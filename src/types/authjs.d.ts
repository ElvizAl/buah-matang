import { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt"

const handleJWT = (token: JWT) => {
    console.log(token.sub, token.role);  // Example usage of JWT type
    return token;
}


declare module "next-auth" {
    interface session {
        user: User & DefaultSession["user"];
    }

    interface User {
        role: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        sub: string;
        role: string;
    }
}