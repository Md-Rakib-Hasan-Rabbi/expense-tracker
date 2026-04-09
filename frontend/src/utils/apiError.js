export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  const details = error?.response?.data?.error?.details;
  const firstDetailMessage = Array.isArray(details) ? details[0]?.message : undefined;

  return (
    firstDetailMessage ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}
