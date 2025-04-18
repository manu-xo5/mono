import { cn } from "@/lib/utils.js";

export function PageContainer({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(className, "mt-nav")} {...props} />;
}
