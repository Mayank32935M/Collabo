/**
 * COLLABO Master Test Runner
 * Orchestrates all levels of the testing pyramid:
 * 1. Unit & Integration Test Suite (`scripts/test-unit-integration.ts`)
 * 2. 250-Participant Control Plane Load Test (`scripts/load-test-control-plane.ts`)
 */

import { spawn } from "node:child_process";
import path from "node:path";

interface TestSuite {
  name: string;
  script: string;
}

const suites: TestSuite[] = [
  {
    name: "Unit & Integration Tests (Math, AI Schemas & Realtime State)",
    script: "scripts/test-unit-integration.ts",
  },
  {
    name: "Control Plane Load Testing (250+ Concurrent Participants)",
    script: "scripts/load-test-control-plane.ts",
  },
];

async function runSuite(suite: TestSuite): Promise<boolean> {
  const tsxPath = path.resolve("node_modules/.bin/tsx");
  const startTime = Date.now();

  return new Promise((resolve) => {
    const isWindows = process.platform === "win32";
    const cmd = isWindows ? "npx.cmd" : "npx";

    const child = spawn(
      cmd,
      ["--prefix", "apps/realtime", "tsx", suite.script],
      {
        stdio: "inherit",
        shell: true,
      }
    );

    child.on("close", (code) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      if (code === 0) {
        console.log(`[PASS] ${suite.name} (${elapsed}s)\n`);
        resolve(true);
      } else {
        console.error(`[FAIL] ${suite.name} (exited with code ${code}) (${elapsed}s)\n`);
        resolve(false);
      }
    });
  });
}

async function main() {
  console.log("\n================================================================");
  console.log("       COLLABO PLATFORM — AUTOMATED TEST PYRAMID VERIFICATION   ");
  console.log("================================================================\n");

  let allPassed = true;
  for (const suite of suites) {
    const passed = await runSuite(suite);
    if (!passed) {
      allPassed = false;
      break;
    }
  }

  if (allPassed) {
    console.log("================================================================");
    console.log("  ALL TEST SUITES PASSED! 100% QUALITY ASSURANCE ATTAINED.");
    console.log("================================================================\n");
    process.exit(0);
  } else {
    console.error("Test execution failed. See log output above.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
