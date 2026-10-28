import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");
if (existsSync(envPath)) loadEnvFile(envPath);

for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
  const value = process.env[name];
  if (!value || !/^postgres(?:ql)?:\/\//.test(value)) {
    process.stderr.write(`${name} must be a PostgreSQL connection URL.\n`);
    process.exit(1);
  }
}

const prisma = resolve(root, "node_modules", ".bin", "prisma");
for (const args of [["generate"], ["migrate", "deploy"]]) {
  const result = spawnSync(prisma, args, {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
