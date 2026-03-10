"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRegister } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { siteConfig } from "@/config/site"
import { BarChart2 } from "lucide-react"

const schema = z.object({
  username: z.string().min(3, "用户名至少3位"),
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(8, "密码至少8位"),
  inviteCode: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const { mutate: doRegister, isPending, error } = useRegister()
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
          <p className="mt-1 text-sm text-muted-foreground">创建新账户</p>
        </div>

        <form onSubmit={handleSubmit((v) => doRegister(v))} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">用户名</label>
            <Input {...register("username")} placeholder="输入用户名" />
            {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">邮箱</label>
            <Input {...register("email")} type="email" placeholder="your@email.com" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">密码</label>
            <Input {...register("password")} type="password" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              邀请码 <span className="text-muted-foreground">(选填)</span>
            </label>
            <Input {...register("inviteCode")} placeholder="输入邀请码" />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "注册中..." : "注册"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          已有账户?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
