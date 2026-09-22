import Link from "next/link";

import SignUpForm from "@/components/auth/sign-up-form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-[0_0_80px_rgba(14,165,233,0.2)]">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-2xl font-black text-white shadow-[0_0_24px_rgba(14,165,233,0.6)]">
              M
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">
              สมัครสมาชิก
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              สร้างบัญชีสำหรับใช้งานระบบสนับสนุนงาน Automation
            </p>
          </div>

          <SignUpForm />

          <p className="mt-6 text-center text-sm text-slate-400">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          พัฒนาด้วย Next.js • Tailwind CSS • Supabase
        </p>
      </div>
    </main>
  );
}