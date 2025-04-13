class BrandType<Name, Value> {
  from<V extends Value>(value: V): BrandType<Name, Value> {
    return value as BrandType<Name, Value>;
  }
}

const BrandFor = <T extends string, Value = string>() => {
  return new BrandType<T, Value>();
};

type BrandInfer<T extends BrandType<unknown, unknown>> =
  T extends BrandType<infer Name, unknown> ? Name : never;

export { BrandType as Type, BrandFor as For, type BrandInfer as infer };
