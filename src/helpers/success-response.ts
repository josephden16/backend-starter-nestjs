export function SuccessResponse<T = void>(msg: string, data: T | null = null) {
  return {
    status: 'success',
    message: msg,
    data,
  };
}
