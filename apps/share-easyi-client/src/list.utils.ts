export function appendDistinct<T>(arr: Array<T>, values: Array<T>, start?: number) {
  const uniqueIds = values.filter((msgId) => !arr.includes(msgId))

  if (start != null) {
    arr.splice(start, 0, ...uniqueIds)
  } else {
    arr.push(...uniqueIds)
  }
}
