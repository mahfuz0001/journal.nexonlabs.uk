import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

interface RouteParams {
  id: string; // Define the expected dynamic route parameter
}

// GET handler
export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract journal entry ID from the dynamic route parameters
    const { id } = params;

    const entry = await prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Ensure the entry belongs to the current user
    if (entry.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("[JOURNAL_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST handler
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, content, mood, tags } = body;

    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        title,
        content,
        mood: mood || null,
        tags: tags || [],
        userId,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("[JOURNAL_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
