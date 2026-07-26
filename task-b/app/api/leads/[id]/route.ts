import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATUS_OPTIONS } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log(`[PATCH /api/leads/${id}] Incoming request`);

    const body = await request.json();
    console.log(`[PATCH /api/leads/${id}] Body:`, body);

    if (!STATUS_OPTIONS.includes(body.status)) {
      console.log(`[PATCH /api/leads/${id}] Invalid status:`, body.status);
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    console.log(`[PATCH /api/leads/${id}] Updating status to:`, body.status);
    const lead = await prisma.lead.update({
      where: { id: parseInt(id) },
      data: { status: body.status },
    });

    console.log(`[PATCH /api/leads/${id}] Updated lead:`, lead);
    return NextResponse.json(lead);
  } catch (error) {
    console.error(`[PATCH /api/leads] Error:`, error);
    return NextResponse.json(
      { error: "Lead not found" },
      { status: 404 }
    );
  }
}
