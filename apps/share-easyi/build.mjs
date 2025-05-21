import * as esbuild from "esbuild"
import packageJson from "./deno.json" with { type: 'json' }

const external = Object
  .keys(packageJson.imports)
  .filter(dep => !dep.startsWith("@repo"))

console.log(external)

await esbuild.build({
  entryPoints: ["./main.ts"],
  format: "esm",
  bundle: true,
  outdir: "release",
  packages: "external"
})
