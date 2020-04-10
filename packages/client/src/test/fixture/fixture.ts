export const fixture = <T>(dataFn: T | ((opts?: object) => T)) => (
  extendedData?: Partial<T>,
  opts?: object
): T => ({
  ...(dataFn instanceof Function ? dataFn(opts) : dataFn),
  ...(extendedData ?? {})
})
