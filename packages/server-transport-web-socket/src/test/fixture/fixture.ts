export const fixture = <T>(data: T | ((opts?: object) => T)) => (
  extendedData?: T,
  opts?: object
): T => ({
  ...(data instanceof Function ? data(opts) : data),
  ...(extendedData ?? {})
})
