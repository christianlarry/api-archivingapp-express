import { ResponseError } from "./ResponseError";

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class ValidationError extends ResponseError {

  public issues: ValidationErrorItem[];

  constructor(issues: ValidationErrorItem[]) {
    super(400, "Validation Error");

    this.issues = issues

    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}