import errors from "formidable/FormidableError";

export function Response<T>(success: boolean = true, message: string, data: T) {
  return {
    success,
    message,
    data,
  };
}

export function failResponse<T>(
  success: boolean = true,
  message: string,
  data: T
) {
  return {
    success,
    message,
    errors: data,
  };
}
