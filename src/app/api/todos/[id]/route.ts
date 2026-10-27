
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const todoId = Number(id);

    if (!Number.isInteger(todoId) || todoId < 1) {
      return NextResponse.json({ error: "Invalid todo ID" }, { status: 400 });
    }

    
const data: { completed?: boolean; title?: string } = {};

if (typeof body.completed === "boolean") {
  data.completed = body.completed;
}

if (typeof body.title === "string") {
  const title = body.title.trim();

  if (!title || title.length > 200) {
    return NextResponse.json(
      { error: "Title must be between 1 and 200 characters" },
      { status: 400 }
    );
  }

  data.title = title;
}

if (Object.keys(data).length === 0) {
  return NextResponse.json(
    { error: "Provide a title or completed value" },
    { status: 400 }
  );
}

const todo = await prisma.todo.update({
  where: { id: todoId },
  data,
});


    return NextResponse.json(todo);
  } catch (error) {
    console.error("Update todo error:", error);
    return NextResponse.json(
      { error: "Could not update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const todoId = Number(id);

    if (!Number.isInteger(todoId) || todoId < 1) {
      return NextResponse.json({ error: "Invalid todo ID" }, { status: 400 });
    }

    await prisma.todo.delete({ where: { id: todoId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete todo error:", error);
    return NextResponse.json(
      { error: "Could not delete todo" },
      { status: 500 }
    );
  }
}
