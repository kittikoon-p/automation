import Link from "next/link";

import SignInForm from "@/components/auth/sign-in-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
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
              ระบบสนับสนุนงาน Automation
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Web Application สำหรับบำรุงรักษาเครื่องจักรในโรงงาน
            </p>
          </div>

          <SignInForm />

          <p className="mt-6 text-center text-sm text-slate-400">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/signup"
              className="font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              สมัครสมาชิก
            </Link>
          </p>

          <p className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-xs leading-5 text-cyan-200">
            ผู้ใช้รายแรกที่สมัครจะได้รับสิทธิ์{" "}
            <span className="font-semibold">Admin</span> (จอง Slot สิทธิ์
            Admin ไว้ก่อน) ส่วนผู้ใช้ถัดไปจะได้รับสิทธิ์{" "}
            <span className="font-semibold">Technician</span>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          พัฒนาด้วย Next.js • Tailwind CSS • Supabase
        </p>
      </div>
    </main>
  );
}