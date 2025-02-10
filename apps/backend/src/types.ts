import z from "zod";

export const taskSchema = z.object({
    options: z.array(z.object({
        image_url: z.string()
    })),
    title: z.string().optional(),
    sign: z.string(),
});

export const createSubmissionInput = z.object({
    taskId: z.string(),
    selection: z.string()
});