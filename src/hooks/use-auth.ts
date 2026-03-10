"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { http } from "@/lib/http"
import type { LoginPayload, RegisterPayload, AuthResponse } from "@/types"

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      http.post<AuthResponse>("/api/v1/auth/login", payload),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      router.push("/")
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      http.post<AuthResponse>("/api/v1/auth/register", payload),
    onSuccess: () => {
      router.push("/login")
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const router = useRouter()

  return () => {
    logout()
    router.push("/login")
  }
}
