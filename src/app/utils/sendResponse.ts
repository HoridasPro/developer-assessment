import type { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TResponseData<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
};

export const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
  res.status(200).json({
    success: data.success,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};
