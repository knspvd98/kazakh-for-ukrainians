import { runQualityChecks } from "../components/qa/qualityChecks";

const report = runQualityChecks();
console.log(JSON.stringify(report, null, 2));
const failed = Object.entries(report.pass).filter(([, ok]) => !ok);
if (failed.length) {
  process.exitCode = 1;
}
