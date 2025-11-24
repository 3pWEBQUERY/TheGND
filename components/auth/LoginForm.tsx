"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginUser } from "@/actions/auth";
import { useRouter } from "next/navigation";

const LoginSchema = z.object({
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z.string().min(1, "Passwort erforderlich"),
});

export function LoginForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
        const res = await loginUser(data);
        if (res.success) {
            alert("Login erfolgreich!");
            router.refresh();
            router.push("/"); // Redirect to home/dashboard
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="w-full max-w-md rounded-lg bg-[#181818] p-8 text-white shadow-lg">
            <h2 className="mb-6 text-center text-2xl font-bold text-[#E91E63]">
                Anmelden
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">
                        E-Mail
                    </label>
                    <input
                        {...register("email")}
                        type="email"
                        className="mt-1 w-full rounded bg-[#282828] p-2 text-white focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400">
                        Passwort
                    </label>
                    <input
                        {...register("password")}
                        type="password"
                        className="mt-1 w-full rounded bg-[#282828] p-2 text-white focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full rounded bg-[#E91E63] py-2 font-bold text-white hover:bg-[#D81B60]"
                >
                    Einloggen
                </button>
            </form>
        </div>
    );
}
