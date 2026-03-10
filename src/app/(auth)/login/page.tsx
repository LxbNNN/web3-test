"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useLogin } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { siteConfig } from "@/config/site"
import { BarChart2 } from "lucide-react"

const schema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(8, "密码至少8位"),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <BarChart2 className="mb-2 h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">{siteConfig.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">登录您的账户</p>
        </div>

        <form onSubmit={handleSubmit((v) => login(v))} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">邮箱</label>
            <Input {...register("email")} type="email" placeholder="your@email.com" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium">密码</label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                忘记密码?
              </Link>
            </div>
            <Input {...register("password")} type="password" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "登录中..." : "登录"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          还没有账户?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
