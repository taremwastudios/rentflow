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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-500 mt-1">Set payment reminders and notifications</p>
        </div>
      </div>

      {/* Create Reminder Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-5">Create New Reminder</h2>
        <form action={createReminder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select
                name="type"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="rent_due">Rent Due</option>
                <option value="rent_overdue">Rent Overdue</option>
                <option value="agreement_expiry">Agreement Expiry</option>
                <option value="utility_due">Utility Due</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tenant (Optional)</label>
              <select
                name="tenantId"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Rent Due Reminder — January 2025"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
            <textarea
              name="message"
              required
              rows={3}
              placeholder="Dear tenant, this is a reminder that your rent is due on the 1st of this month..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Schedule Date & Time <span className="text-red-500">*</span></label>
            <input
              name="scheduledAt"
              type="datetime-local"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Create Reminder
          </button>
        </form>
      </div>

      {/* Upcoming Reminders */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Upcoming ({upcoming.length})</h2>
          <div className="space-y-3">
            {upcoming.map((reminder) => (
              <div key={reminder.id} className="bg-white rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🔔</span>
                      <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(reminder.status)}`}>
                        {reminder.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{reminder.message}</p>
                    <p className="text-xs text-gray-400">Scheduled: {formatDate(reminder.scheduledAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Reminders */}
      {past.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Past Reminders ({past.length})</h2>
          <div className="space-y-3">
            {past.map((reminder) => (
              <div key={reminder.id} className="bg-white rounded-2xl border border-gray-100 p-5 opacity-70">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-700">{reminder.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(reminder.status)}`}>
                        {reminder.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{reminder.message}</p>
                    <p className="text-xs text-gray-400 mt-1">Scheduled: {formatDate(reminder.scheduledAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminderList.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-sm">No reminders yet. Create one above to get started.</p>
        </div>
      )}
    </div>
  );
}
