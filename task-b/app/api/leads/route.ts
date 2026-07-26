import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  console.log("[POST /api/leads] Incoming request");
  try {
    const body = await request.json();
    console.log("[POST /api/leads] Request body:", body);

    const result = leadSchema.safeParse(body);
    if (!result.success) {
      console.log("[POST /api/leads] Validation failed:", result.error.flatten().fieldErrors);
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.log("[POST /api/leads] Creating lead:", result.data);
    const lead = await prisma.lead.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        budgetRange: result.data.budgetRange,
        message: result.data.message,
      },
    });

    console.log("[POST /api/leads] Lead created:", lead);
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[POST /api/leads] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  console.log("[GET /api/leads] Incoming request");
  try {
    const session = await auth();
    if (!session) {
      console.log("[GET /api/leads] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    console.log("[GET /api/leads] Search query:", search || "(none)");

    const leads = await prisma.lead.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    console.log("[GET /api/leads] Found", leads.length, "leads");
    return NextResponse.json(leads);
  } catch (error) {
    console.error("[GET /api/leads] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
