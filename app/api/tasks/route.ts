import { NextResponse } from 'next/server';
import { createTask} from '@/app/lib/db/create';
import { getTasksFromDb } from '@/app/lib/db/read';

export async function GET() {
    try {
        const data = await getTasksFromDb();
        return NextResponse.json(data);
    } catch (error) {
        console.error("GET Tasks Error:", error);
        return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.title) {
            return NextResponse.json({ error: 'Field title is required' }, { status: 400 });
        }

        const newTask = createTask({
            title: body.title,
            description: body.description,
            status: body.status,
            priority: body.priority,
            parentId: body.parentId
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error("POST Task Error:", error);
        return NextResponse.json({ error: 'Failed to create tasks' }, { status: 500 });
    }
}