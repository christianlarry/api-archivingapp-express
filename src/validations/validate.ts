import { ValidationError, ValidationErrorItem } from "@/errors/ValidationError";
import { ZodType } from "zod";

export const validate = <T>(schema: ZodType, data: T): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Zod v4: gunakan `issues` (array of ZodIssue)
    const issues = result.error.issues ?? [];

    const errors: ValidationErrorItem[] = issues.map((issue) => ({
      field: issue.path.length ? issue.path.join(".") : "",
      message: issue.message,
    }));

    throw new ValidationError(errors);
  }

  return result.data as T;
};