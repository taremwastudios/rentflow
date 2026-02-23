import { db } from "@/db";
import { inquiries, properties, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDate, getStatusColor } from "@/lib/utils";

export default async function AdminInquiriesPage() {
  const allInquiries = await db
    .select({
      id: inquiries.id,
      visitorName: inquiries.visitorName,
      visitorEmail: inquiries.visitorEmail,
      visitorPhone: inquiries.visitorPhone,
      message: inquiries.message,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
      propertyTitle: properties.title,
      landlordName: users.name,
    })
    .from(inquiries)
    .innerJoin(properties, eq(inquiries.propertyId, properties.id))
    .innerJoin(users, eq(inquiries.landlordId, users.id))
    .orderBy(desc(inquiries.createdAt))
    .limit(50);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Property Inquiries</h1>
        <p className="text-gray-500 mt-1">Messages from potential tenants to landlords</p>
      </div>

      {allInquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No inquiries yet</h3>
          <p className="text-gray-500">Inquiries from potential tenants will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allInquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{inquiry.visitorName}</h3>
                  <p className="text-sm text-gray-500">{inquiry.visitorPhone} {inquiry.visitorEmail ? `• ${inquiry.visitorEmail}` : ""}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(inquiry.createdAt)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-3">{inquiry.message}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Property: <strong>{inquiry.propertyTitle}</strong></span>
                <span>Landlord: <strong>{inquiry.landlordName}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
