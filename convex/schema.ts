import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  qrCodes: defineTable({
    userId: v.id("users"),
    type: v.string(), // "url", "text", "wifi", "vcard", "sms", "email", "phone"
    content: v.string(),
    title: v.optional(v.string()),
    metadata: v.optional(v.object({
      // WiFi
      ssid: v.optional(v.string()),
      password: v.optional(v.string()),
      security: v.optional(v.string()),
      // Contact
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      // SMS
      phoneNumber: v.optional(v.string()),
      message: v.optional(v.string()),
      // Email
      emailTo: v.optional(v.string()),
      subject: v.optional(v.string()),
      body: v.optional(v.string()),
    })),
    customization: v.optional(v.object({
      size: v.optional(v.number()),
      color: v.optional(v.string()),
      backgroundColor: v.optional(v.string()),
      errorCorrection: v.optional(v.string()),
    })),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
