/**
 * Measures response time and updates cache statistics
 */
export function measureResponseTime(
  startTime: number,
  updateFn: (responseTime: number) => void
): number {
  const responseTime = Date.now() - startTime;
  updateFn(responseTime);
  return responseTime;
}

