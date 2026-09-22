import Link from "next/link";

import SignUpForm from "@/components/auth/sign-up-form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
              M
            </div>
            <h1 className="mt-4 text-2xl font-bold text-zinc-900">
              สมัครสมาชิก
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              สร้างบัญชีสำหรับใช้งานระบบสนับสนุนงาน Automation
            </p>
          </div>

          <SignUpForm />

          <p className="mt-6 text-center text-sm text-zinc-500">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-blue-200/70">
          พัฒนาด้วย Next.js • Tailwind CSS • Supabase
        </p>
      </div>
    </main>
  );
}