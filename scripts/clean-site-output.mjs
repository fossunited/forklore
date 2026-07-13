import { rm } from "node:fs/promises";
import path from "node:path";

await rm(path.join(process.cwd(), "_site"), { force: true, recursive: true });
