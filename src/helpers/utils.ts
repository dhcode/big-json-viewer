export function assertStartLimit(start, limit) {
  if (isNaN(start) || start < 0) {
    throw new Error(`Invalid start ${start}`);
  }
  if (limit && limit < 0) {
    throw new Error(`Invalid limit ${limit}`);
  }
}
