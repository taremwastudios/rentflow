import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { reminders, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, getStatusColor } from "@/lib/utils";

async function createReminder(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const message = formData.get("message") as string;
  const scheduledAt = new Date(formData.get("scheduledAt") as string);
  const tenantIdStr = formData.get("tenantId") as string;

  await db.insert(reminders).values({
    landlordId: session.user.id,
    tenantId: tenantIdStr ? parseInt(tenantIdStr) : undefined,
    type: type as "rent_due" | "rent_overdue" | "agreement_expiry" | "utility_due" | "custom",
    title,
    message,
    scheduledAt,
    status: "pending",
  });

  redirect("/dashboard/reminders");
}

export default async function RemindersPage() {
  const session = await getSession();
  if (!session) return null;

  const [reminderList, tenantList] = await Promise.all([
    db.select().from(reminders).where(eq(reminders.landlordId, session.user.id)).orderBy(reminders.scheduledAt),
    db.select({
      id: tenants.id,
      firstName: tenants.firstName,
      lastName: tenants.lastName,
    }).from(tenants).where(eq(tenants.landlordId, session.user.id)),
  ]);

  const now = new Date();
  const upcoming = reminderList.filter((r) => r.scheduledAt >= now && r.status === "pending");
  const past = reminderList.filter((r) => r.scheduledAt < now || r.status !== "pending");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="px-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Reminders</h1>
        <p className="text-slate-500 dark:text-emerald-500/60 mt-1 font-medium text-sm transition-colors">Set payment reminders and notifications</p>
      </div>

      {/* Create Reminder Form */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-6 shadow-sm dark:shadow-none transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors">Create New Reminder</h2>
        <form action={createReminder} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Type</label>
              <select
                name="type"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
              >
                <option value="rent_due">Rent Due</option>
                <option value="rent_overdue">Rent Overdue</option>
                <option value="agreement_expiry">Agreement Expiry</option>
                <option value="utility_due">Utility Due</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Recipient</label>
              <select
                name="tenantId"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
              >
                <option value="">All tenants / General</option>
                {tenantList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Title</label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Rent Due Reminder"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Message</label>
            <textarea
              name="message"
              required
              rows={3}
              placeholder="Dear tenant, this is a reminder..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-emerald-900 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-1 transition-colors">Schedule</label>
            <input
              name="scheduledAt"
              type="datetime-local"
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
          >
            Create Reminder
          </button>
        </form>
      </div>

      {/* Upcoming Reminders */}
      {upcoming.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white ml-2 transition-colors">Upcoming ({upcoming.length})</h2>
          <div className="grid gap-4">
            {upcoming.map((reminder) => (
              <div key={reminder.id} className="bg-white dark:bg-slate-950 rounded-xl border border-yellow-200 dark:border-emerald-500/20 p-6 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-xl transition-colors opacity-50">🔔</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-md font-bold text-slate-900 dark:text-white transition-colors">{reminder.title}</h3>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getStatusColor(reminder.status)}`}>
                        {reminder.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors">{reminder.message}</p>
                    <p className="text-[9px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest transition-colors">Scheduled: {formatDate(reminder.scheduledAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminderList.length === 0 && (
        <div className="text-center py-16 opacity-30 transition-colors">
          <div className="text-4xl mb-4">🔔</div>
          <p className="text-[10px] font-black uppercase tracking-widest transition-colors">No reminders yet</p>
        </div>
      )}
    </div>
  );
}
