"use server";

import { signIn } from "@/auth";
import { prisma } from "@/db/prisma";
import { LoginSchema, RegisterSchema } from "@/validasi/auth";
import { hashSync } from "bcrypt-ts";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export const signUpCredentials = async (prevState: unknown,  formData: FormData) => {

    const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors
        }
    }

    const {name, email, password } = validatedFields.data;
    const hashedPassword = hashSync(password, 10);

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })
    } catch (error) {
        console.error(error);
    return { message: "Failed to create user" }
}
    redirect("/login");
}

export const signInCredentials = async (prevState: unknown, formData: FormData) => {
    const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const {email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/profile",
        })
    } catch (error) {
        if(error instanceof AuthError) {
            switch (error.message) {
                case "CredentialsSignin":
                    return { message: "Invalid Crendentials" }
                default:
                    return { message: "something went wrong" }
            }
        }
        throw error;
    }
    
}