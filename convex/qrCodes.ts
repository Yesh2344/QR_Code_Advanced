import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveQRCode = mutation({
  args: {
    type: v.string(),
    content: v.string(),
    title: v.optional(v.string()),
    metadata: v.optional(v.object({
      ssid: v.optional(v.string()),
      password: v.optional(v.string()),
      security: v.optional(v.string()),
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      message: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to save QR codes");
    }

    return await ctx.db.insert("qrCodes", {
      userId,
      type: args.type,
      content: args.content,
      title: args.title,
      metadata: args.metadata,
      customization: args.customization,
    });
  },
});

export const getQRHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("qrCodes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const deleteQRCode = mutation({
  args: { id: v.id("qrCodes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const qrCode = await ctx.db.get(args.id);
    if (!qrCode || qrCode.userId !== userId) {
      throw new Error("QR code not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});
