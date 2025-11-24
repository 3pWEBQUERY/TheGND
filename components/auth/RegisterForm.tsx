"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerUser } from "@/actions/auth";
import { UploadImage } from "@/components/UploadImage";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Step1Schema = z.object({
    role: z.enum(["MEMBER", "PROVIDER"]),
});

const Step2Schema = z.object({
    username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen lang sein"),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
    confirmPassword: z.string(),
    image: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
});

export function RegisterForm() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<"MEMBER" | "PROVIDER">("MEMBER");
    const [image, setImage] = useState<string>("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof Step2Schema>>({
        resolver: zodResolver(Step2Schema),
    });

    const onStep1Submit = (selectedRole: "MEMBER" | "PROVIDER") => {
        setRole(selectedRole);
        setStep(2);
    };

    const onSubmit = async (data: z.infer<typeof Step2Schema>) => {
        const res = await registerUser({ ...data, role, image });
        if (res.success) {
            alert("Registrierung erfolgreich!");
            router.push("/login");
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="w-full max-w-md rounded-lg bg-[#181818] p-8 text-white shadow-lg">
            <h2 className="mb-6 text-center text-2xl font-bold text-[#E91E63]">
                Registrieren
            </h2>

            {step === 1 && (
                <div className="space-y-4">
                    <p className="text-center text-gray-400">Wähle deinen Kontotyp</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onStep1Submit("MEMBER")}
                            className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-[#282828] p-6 transition hover:bg-[#383838] hover:border-[#E91E63]"
                        >
                            <span className="text-xl font-bold">Mitglied</span>
                            <span className="text-xs text-gray-400">Suche nach Begleitung</span>
                        </button>
                        <button
                            onClick={() => onStep1Submit("PROVIDER")}
                            className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-[#282828] p-6 transition hover:bg-[#383838] hover:border-[#E91E63]"
                        >
                            <span className="text-xl font-bold">Anbieter</span>
                            <span className="text-xs text-gray-400">Biete Begleitung an</span>
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">
                            Profilbild
                        </label>
                        <div className="mt-2 flex items-center gap-4">
                            {image ? (
                                <div className="relative h-20 w-20 overflow-hidden rounded-full">
                                    <Image src={image} alt="Profile" fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-[#282828]"></div>
                            )}
                            <UploadImage onUploadComplete={(url) => setImage(url)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400">
                            Benutzername
                        </label>
                        <input
                            {...register("username")}
                            className="mt-1 w-full rounded bg-[#282828] p-2 text-white focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                        />
                        {errors.username && (
                            <p className="text-xs text-red-500">{errors.username.message}</p>
                        )}
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-gray-400">
                            Passwort bestätigen
                        </label>
                        <input
                            {...register("confirmPassword")}
                            type="password"
                            className="mt-1 w-full rounded bg-[#282828] p-2 text-white focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                        />
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-1/3 rounded bg-gray-600 py-2 font-bold text-white hover:bg-gray-500"
                        >
                            Zurück
                        </button>
                        <button
                            type="submit"
                            className="w-2/3 rounded bg-[#E91E63] py-2 font-bold text-white hover:bg-[#D81B60]"
                        >
                            Registrieren
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
