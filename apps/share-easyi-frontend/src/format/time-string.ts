export function fromSeconds(duration: number) {
    const seconds = duration % 60
    const mins = Math.floor(duration / 60)
    const hours = Math.floor(duration / 3600)

    const iter = (hours !== 0
        ? Iterator.from([hours, mins, seconds])
        : Iterator.from([mins, seconds]))

    return iter
        .map(x => String(x))
        .map(x => x.padStart(2, "0"))
        .toArray()
        .join(":")
}
