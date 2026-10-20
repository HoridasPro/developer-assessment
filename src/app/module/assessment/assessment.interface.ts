export interface ICreateAssessmentPayload {
  title: string;
  description?: string;
  imageUrl?: string;
  duration: number;
  passingScore: number;
  maxAttempts?: number;
  price: number;
  startAt?: string;
  endAt?: string;
}
