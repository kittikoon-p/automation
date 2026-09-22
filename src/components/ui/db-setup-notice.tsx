export default function DbSetupNotice() {
  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
      ยังไม่ได้ตั้งค่าฐานข้อมูลสำหรับฟีเจอร์นี้ — กรุณารัน{" "}
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">
        supabase/schema.sql
      </code>{" "}
      ใน Supabase SQL Editor แล้วลองใหม่อีกครั้ง
    </div>
  );
}