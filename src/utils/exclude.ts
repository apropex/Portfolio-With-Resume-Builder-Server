//

export default function exclude<T, Key extends keyof T>(
  obj: T,
  ...keys: Key[]
): Omit<T, Key> {
  const clone = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
}
