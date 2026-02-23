export function formatCurrency(amount: number, currency = "UGX"): string {
  if (currency === "UGX") {
    return `UGX ${amount.toLocaleString("en-UG")}`;
  }
  return new Intl.NumberFormat("en-UG", { style: "currency", currency }).format(amount);
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getMonthName(month: number): string {
  return new Date(2024, month - 1, 1).toLocaleString("en-UG", { month: "long" });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    overdue: "bg-red-100 text-red-800",
    partial: "bg-orange-100 text-orange-800",
    waived: "bg-gray-100 text-gray-600",
    active: "bg-green-100 text-green-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    under_review: "bg-blue-100 text-blue-800",
    available: "bg-green-100 text-green-800",
    occupied: "bg-blue-100 text-blue-800",
    maintenance: "bg-orange-100 text-orange-800",
    reserved: "bg-purple-100 text-purple-800",
    new: "bg-blue-100 text-blue-800",
    read: "bg-gray-100 text-gray-600",
    replied: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-500",
    draft: "bg-gray-100 text-gray-600",
    expired: "bg-red-100 text-red-800",
    terminated: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getDaysUntilDue(dueDate: Date): number {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: Date): boolean {
  return dueDate < new Date();
}
