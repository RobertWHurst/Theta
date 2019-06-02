export const fixture = <T>(dataFn: T | ((opts?: object) => T)) =>
  (extendedData?: T, opts?: object): T =>
    ({ ...(dataFn instanceof Function ? dataFn(opts) : dataFn), ...extendedData || {} })
