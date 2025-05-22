export type exceptionResponseType = {
  isSuccess: boolean;
  error: string | string[] | Record<string, any>;
  statusCode: number;
  message?: string | any[] | Record<string, any> | Record<string, any>[];
};
