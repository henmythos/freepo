"use client";

import { useState } from "react";
import { CreatePostRequest, Category } from "@/lib/types";
import { CATEGORIES, TOP_CITIES, JOB_TYPES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface UniversalFormProps {
  onSubmit: (data: CreatePostRequest) => Promise<void>;
}

export default function UniversalForm({ onSubmit }: UniversalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePostRequest>>({
    category: "Jobs",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData as CreatePostRequest);
    } catch (error) {
      console.error("Submit error:", error);
    }
    setIsSubmitting(false);
  };

  const category = formData.category as Category;
  const isJobCategory = category === "Jobs";
  const isPriceCategory = [
    "Properties",
    "Rentals",
    "Cars",
    "Bikes",
    "Electronics",
    "Buy/Sell",
  ].includes(category);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 border border-gray-200 shadow-lg">
      <h2 className="font-serif text-2xl font-bold border-b-2 border-black pb-2">
        Post Your Ad
      </h2>

      {/* Honeypot */}
      <input
        type="text"
        name="_honey"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Category */}
      <div>
        <label className="block font-bold text-sm uppercase mb-2">
          Category *
        </label>
        <select
          name="category"
          value={formData.category || "Jobs"}
          onChange={handleChange}
          className="w-full border-2 border-black p-3 bg-white font-sans"
          required
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block font-bold text-sm uppercase mb-2">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          placeholder={
            isJobCategory ? "e.g. Hiring Sales Executive" : "e.g. iPhone 15 Pro for Sale"
          }
          className="w-full border-2 border-black p-3 font-serif text-lg"
          required
          maxLength={100}
        />
      </div>

      {/* City */}
      <div>
        <label className="block font-bold text-sm uppercase mb-2">City *</label>
        <select
          name="city"
          value={formData.city || ""}
          onChange={handleChange}
          className="w-full border-2 border-black p-3 bg-white font-sans"
          required
        >
          <option value="">Select City</option>
          {TOP_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block font-bold text-sm uppercase mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Provide details about your listing..."
          className="w-full border-2 border-black p-3 font-serif min-h-[150px]"
          required
          maxLength={2000}
        />
      </div>

      {/* Job-specific fields */}
      {isJobCategory && (
        <>
          <div>
            <label className="block font-bold text-sm uppercase mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name || ""}
              onChange={handleChange}
              placeholder="Your company name (or 'Confidential')"
              className="w-full border-2 border-black p-3 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-sm uppercase mb-2">
                Job Type
              </label>
              <select
                name="job_type"
                value={formData.job_type || ""}
                onChange={handleChange}
                className="w-full border-2 border-black p-3 bg-white font-sans"
              >
                <option value="">Select Type</option>
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-sm uppercase mb-2">
                Salary
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary || ""}
                onChange={handleChange}
                placeholder="e.g. ₹25,000 - ₹35,000/month"
                className="w-full border-2 border-black p-3 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-sm uppercase mb-2">
                Experience Required
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience || ""}
                onChange={handleChange}
                placeholder="e.g. 2-3 years"
                className="w-full border-2 border-black p-3 font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-sm uppercase mb-2">
                Education Required
              </label>
              <input
                type="text"
                name="education"
                value={formData.education || ""}
                onChange={handleChange}
                placeholder="e.g. Graduate / Any"
                className="w-full border-2 border-black p-3 font-sans"
              />
            </div>
          </div>
        </>
      )}

      {/* Price field */}
      {isPriceCategory && (
        <div>
          <label className="block font-bold text-sm uppercase mb-2">
            Price
          </label>
          <input
            type="text"
            name="price"
            value={formData.price || ""}
            onChange={handleChange}
            placeholder="e.g. ₹45,000 or ₹15,000/month"
            className="w-full border-2 border-black p-3 font-sans"
          />
        </div>
      )}

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-sm uppercase mb-2">
            Contact Phone *
          </label>
          <input
            type="tel"
            name="contact_phone"
            value={formData.contact_phone || ""}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            className="w-full border-2 border-black p-3 font-sans"
            required
            pattern="[0-9]{10}"
            maxLength={10}
          />
        </div>

        <div>
          <label className="block font-bold text-sm uppercase mb-2">
            WhatsApp (Optional)
          </label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp || ""}
            onChange={handleChange}
            placeholder="WhatsApp number if different"
            className="w-full border-2 border-black p-3 font-sans"
            maxLength={10}
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-sm uppercase mb-2">
          Contact Name (Optional)
        </label>
        <input
          type="text"
          name="contact_name"
          value={formData.contact_name || ""}
          onChange={handleChange}
          placeholder="Your name"
          className="w-full border-2 border-black p-3 font-sans"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-4 font-bold uppercase text-lg tracking-wider hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={20} />}
        {isSubmitting ? "Publishing..." : "Publish Ad Free"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By posting, you agree to our Terms of Service. One post per phone number every 30 days.
      </p>
    </form>
  );
}