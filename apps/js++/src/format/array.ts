const formatter = new Intl.ListFormat("en-US");

export function humanizeListJoin(arr: string[] | string) {
    const values = Array.isArray(arr) ? arr : [arr];

    return formatter.format(values);
}
