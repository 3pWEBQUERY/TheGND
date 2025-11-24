"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

const RegisterSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["MEMBER", "PROVIDER"]),
    image: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export async function registerUser(data: z.infer<typeof RegisterSchema>) {
    const validatedFields = RegisterSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { username, email, password, role, image } = validatedFields.data;

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
        },
    });

    if (existingUser) {
        return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
                image,
            },
        });

        await createSession(user.id, user.role);
        return { success: "User created successfully" };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Something went wrong" };
    }
}

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function loginUser(data: z.infer<typeof LoginSchema>) {
    const validatedFields = LoginSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { email, password } = validatedFields.data;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.password) {
        return { error: "Invalid credentials" };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
        return { error: "Invalid credentials" };
    }

    await createSession(user.id, user.role);
    return { success: "Logged in successfully", user };
}

export async function logoutUser() {
    await deleteSession();
    redirect("/login");
}
