"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { redirect } from "next/navigation";
import Link from "next/link";

async function createProperty(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const district = formData.get("district") as string;
  const propertyType = formData.get("propertyType") as string;
  const totalUnits = parseInt(formData.get("totalUnits") as string) || 1;

  const [newProperty] = await db.insert(properties).values({
    landlordId: session.user.id,
    title,
    description,
    address,
    city: city || "Mbarara",
    district: district || "Mbarara",
    propertyType: propertyType as "apartment" | "house" | "commercial" | "studio" | "hostel" | "other",
    totalUnits,
    isPublished: false,
  }).returning();

  redirect(`/dashboard/properties/${newProperty.id}`);
}

export default async function NewPropertyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/properties" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-4">
          ← Back to Properties
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-500 mt-1">Fill in the details about your property</p>
      </div>

      <form action={createProperty} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Property Name / Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Mugisha Apartments Block A"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              name="propertyType"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="studio">Studio</option>
              <option value="hostel">Hostel</option>
              <option value="commercial">Commercial</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe your property — location highlights, amenities, nearby facilities..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Total Number of Units <span className="text-red-500">*</span>
            </label>
            <input
              name="totalUnits"
              type="number"
              min="1"
              defaultValue="1"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Location</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              name="address"
              type="text"
              required
              placeholder="e.g. Plot 12, High Street"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input
                name="city"
                type="text"
                defaultValue="Mbarara"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
              <input
                name="district"
                type="text"
                defaultValue="Mbarara"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard/properties"
            className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Create Property →
          </button>
        </div>
      </form>
    </div>
  );
}
