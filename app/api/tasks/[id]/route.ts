import { NextResponse } from 'next/server';
import { deleteTask } from '@/app/lib/db/delete';
import { updateTask } from '@/app/lib/db/update';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updatedTask = await updateTask(id, body)?.[0];
        return NextResponse.json({ success: !!updatedTask, updatedTask: updatedTask });
    } catch (error) {
        console.error("PATCH Task Error:", error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteContext) {
    try {
        const { id } = await params;
        deleteTask(id);
        return NextResponse.json({ success: true, message: 'Deleted task' });
    } catch (error) {
        console.error("DELETE Task Error:", error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}