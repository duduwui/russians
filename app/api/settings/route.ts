import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateSettingsSchema } from "@/lib/validations";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const validated = UpdateSettingsSchema.parse(body);

    const updated = await prisma.settings.upsert({
      where: { id: "default" },
      update: validated,
      create: { id: "default", ...validated },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 400 }
    );
  }
}
