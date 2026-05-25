"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as doRegister } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "O primeiro nome deve ter pelo menos 2 caracteres"),
    lastName: z.string().min(2, "O último nome deve ter pelo menos 2 caracteres"),
    email: z
      .string()
      .min(1, "O e-mail é obrigatório")
      .email("Introduza um e-mail válido"),
    password: z
      .string()
      .min(8, "A palavra-passe deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter pelo menos um número"),
    confirmPassword: z.string(),
    organizationName: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As palavras-passe não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await doRegister({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        organizationName: data.organizationName,
      });
      toast({
        title: "Conta criada com sucesso",
        description: "Pode agora iniciar sessão com as suas credenciais.",
      });
      router.push("/login");
    } catch {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: "Este e-mail já pode estar registado. Tente iniciar sessão.",
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Criar conta</h1>
      <p className="mt-1 text-sm text-slate-500">
        Comece a usar a plataforma gratuitamente
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Primeiro nome */}
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Primeiro nome</Label>
            <Input id="firstName" placeholder="Ana" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          {/* Último nome */}
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Último nome</Label>
            <Input id="lastName" placeholder="Silva" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="ana@empresa.pt"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Organização */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="organizationName">
              Organização{" "}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </Label>
            <Input
              id="organizationName"
              placeholder="Empresa Lda."
              {...register("organizationName")}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Palavra-passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Mostrar palavra-passe"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar palavra-passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Iniciar sessão
        </Link>
      </p>
    </div>
  );
}
