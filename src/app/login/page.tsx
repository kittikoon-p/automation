import Link from "next/link";

import SignInForm from "@/components/auth/sign-in-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
              M
            </div>
            <h1 className="mt-4 text-2xl font-bold text-zinc-900">
              ระบบสนับสนุนงาน Automation
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Web Application สำหรับบำรุงรักษาเครื่องจักรในโรงงาน
            </p>
          </div>

          <SignInForm />

          <p className="mt-6 text-center text-sm text-zinc-500">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              สมัครสมาชิก
            </Link>
          </p>

          <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-700">
            ผู้ใช้รายแรกที่สมัครจะได้รับสิทธิ์{" "}
            <span className="font-semibold">Admin</span> (จอง Slot สิทธิ์
            Admin ไว้ก่อน) ส่วนผู้ใช้ถัดไปจะได้รับสิทธิ์{" "}
            <span className="font-semibold">Technician</span>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-blue-200/70">
          พัฒนาด้วย Next.js • Tailwind CSS • Supabase
        </p>
      </div>
    </main>
  );
}