const formatter = new Intl.ListFormat("en-US", { type: "disjunction" });

function humanizeListJoin(arr: string[] | string) {
    const values = Array.isArray(arr) ? arr : [arr];

    return formatter.format(values);
}

export const FormatList = {
    humanizeListJoin,
};
