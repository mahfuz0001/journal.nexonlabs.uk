import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    if (!user || userId !== queryUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("[JOURNAL_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, mood, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Creating journal entry with data:", {
      title,
      content,
      mood,
      tags,
      userId,
    });

    const entry = await prisma.journalEntry.create({
      data: {
        title,
        content,
        mood: mood || null, // Default to null if not provided
        tags: tags?.length ? tags : [], // Ensure tags is always an array
        userId,
      },
    });

    return NextResponse.json(entry);
  } catch (error: any) {
    console.error("[JOURNAL_POST]", error.message || "Unknown error", error);

    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
