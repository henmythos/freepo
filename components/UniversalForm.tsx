"use client";

import { useState } from "react";
import { CreatePostRequest, Category } from "@/lib/types";
import { CATEGORIES, TOP_CITIES, JOB_TYPES } from "@/lib/constants";
import { Loader2, ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface UniversalFormProps {
  onSubmit: (data: CreatePostRequest) => Promise<void>;
}

export default function UniversalForm({ onSubmit }: UniversalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePostRequest>>({
    category: "Jobs",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image Optimization Helper
  const processImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // 1. Initial Size Check
      if (file.size > 8 * 1024 * 1024) { // 8MB
        reject(new Error("Image too large. Please reduce file size using IMG365 (https://img365.in/compress)"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image(); // Avoid conflict with next/image
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }

          // Target dimensions
          const TARGET_WIDTH = 1200;
          const TARGET_HEIGHT = 628;
          canvas.width = TARGET_WIDTH;
          canvas.height = TARGET_HEIGHT;

          // Calculate "cover" fit
          const scale = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
          const x = (TARGET_WIDTH - img.width * scale) / 2;
          const y = (TARGET_HEIGHT - img.height * scale) / 2;

          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

          // Compress to WebP
          const tryCompress = (quality: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Compression failed"));
                  return;
                }

                // Check size (350KB limit to be safe for <300KB target)
                if (blob.size > 350 * 1024) {
                  if (quality > 0.55) {
                    // Retry with lower quality
                    tryCompress(0.55);
                  } else {
                    reject(new Error("Image too large after optimization. Please compress using IMG365.in and try again."));
                  }
                } else {
                  resolve(blob);
                }
              },
              "image/webp",
              quality
            );
          };

          // Start with 0.70 quality
          tryCompress(0.70);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 2) {
      alert("You can only upload a maximum of 2 images.");
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    let hasError = false;

    for (let i = 0; i < files.length; i++) {
      try {
        const processedBlob = await processImage(files[i]);
        // Append with .webp extension
        data.append("files", processedBlob, files[i].name.replace(/\.[^/.]+$/, "") + ".webp");
      } catch (err: unknown) {
        alert((err as Error).message);
        hasError = true;
        break; // Stop on first error
      }
    }

    if (hasError) {
      setIsUploading(false);
      e.target.value = ""; // Reset
      return;
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadedImages((prev) => [...prev, ...result.urls]);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload images. " + (error as Error).message);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Add images to form data
      const finalData = {
        ...formData,
        image1: uploadedImages[0] || undefined,
        image2: uploadedImages[1] || undefined,
      };
      await onSubmit(finalData as CreatePostRequest);
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

      {/* Image Upload */}
      <div>
        <label className="block font-bold text-sm uppercase mb-2">
          Images (Optional - Max 2)
        </label>

        <div className="flex flex-wrap gap-4 mb-3">
          {uploadedImages.map((url, index) => (
            <div key={url} className="relative w-24 h-24 border border-gray-200 rounded overflow-hidden group">
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {uploadedImages.length < 2 && (
            <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-black transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {isUploading ? (
                <Loader2 className="animate-spin text-gray-400" size={24} />
              ) : (
                <>
                  <ImagePlus className="text-gray-400 mb-1" size={24} />
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Add Photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-500">
          JPG, PNG or WebP. Max 5MB each.
        </p>
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
          Preferred Contact Method *
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2 cursor-pointer border border-gray-300 p-3 rounded hover:bg-gray-50 flex-1">
            <input
              type="radio"
              name="contact_preference"
              value="both"
              checked={!formData.contact_preference || formData.contact_preference === "both"}
              onChange={handleChange}
              className="accent-black w-4 h-4"
            />
            <span className="text-sm font-medium">Any (Call + WhatsApp)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer border border-gray-300 p-3 rounded hover:bg-gray-50 flex-1">
            <input
              type="radio"
              name="contact_preference"
              value="call"
              checked={formData.contact_preference === "call"}
              onChange={handleChange}
              className="accent-black w-4 h-4"
            />
            <span className="text-sm font-medium">Call Only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer border border-gray-300 p-3 rounded hover:bg-gray-50 flex-1">
            <input
              type="radio"
              name="contact_preference"
              value="whatsapp"
              checked={formData.contact_preference === "whatsapp"}
              onChange={handleChange}
              className="accent-black w-4 h-4"
            />
            <span className="text-sm font-medium">WhatsApp Only</span>
          </label>
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
        disabled={isSubmitting || isUploading}
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