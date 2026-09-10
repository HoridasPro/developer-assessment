export interface ICreateAssessmentPayload {
  title: string;
  description?: string;
  duration: number;
  passingScore: number;
  maxAttempts?: number;
  price: number;
  startAt?: string;
  endAt?: string;
}
