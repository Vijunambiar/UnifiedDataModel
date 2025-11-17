/**
 * ERD Relationship Verification Test
 * Tests all 21 domains to ensure relationships are correctly generated
 */

import { evaluateDomainModels } from "./client/lib/domain-evaluation";
import { enterpriseDomains } from "./client/lib/enterprise-domains";

interface DomainERDReport {
  domainId: string;
  domainName: string;
  logicalEntities: number;
  logicalRelationships: number;
  bronzeTables: number;
  bronzeRelationships: number;
  silverTables: number;
  silverRelationships: number;
  goldDimensions: number;
  goldFacts: number;
  goldRelationships: number;
  totalRelationships: number;
  status: "PASS" | "WARN" | "FAIL";
  issues: string[];
}

function testERDRelationships() {
  console.log("=".repeat(80));
  console.log("ERD RELATIONSHIP VERIFICATION TEST");
  console.log("Testing all 21 Banking Domains");
  console.log("=".repeat(80));
  console.log("");

  const reports: DomainERDReport[] = [];
  let totalPass = 0;
  let totalWarn = 0;
  let totalFail = 0;

  // Test each domain
  for (const domain of enterpriseDomains) {
    console.log(`\n📊 Testing: ${domain.name} (${domain.id})`);
    console.log("-".repeat(80));

    const evaluation = evaluateDomainModels(domain.id);
    const issues: string[] = [];

    // Count entities and relationships
    const logicalEntities = evaluation.keyEntities?.length || 0;
    const logicalRelationships = evaluation.logicalRelationships?.length || 0;

    const bronzeTables = evaluation.bronzeLayer?.tables?.length || 0;
    const bronzeRelationships =
      evaluation.bronzeLayer?.relationships?.length || 0;

    const silverTables = evaluation.silverLayer?.tables?.length || 0;
    const silverRelationships =
      evaluation.silverLayer?.relationships?.length || 0;

    const goldDimensions = evaluation.goldLayer?.dimensions?.length || 0;
    const goldFacts = evaluation.goldLayer?.facts?.length || 0;
    const goldRelationships = evaluation.goldLayer?.relationships?.length || 0;

    const totalRelationships =
      logicalRelationships +
      bronzeRelationships +
      silverRelationships +
      goldRelationships;

    // Check for issues
    if (logicalEntities > 0 && logicalRelationships === 0) {
      issues.push("Logical ERD: No relationships detected");
    }
    if (bronzeTables > 3 && bronzeRelationships === 0) {
      issues.push("Bronze ERD: No relationships detected");
    }
    if (silverTables > 3 && silverRelationships === 0) {
      issues.push("Silver ERD: No relationships detected");
    }
    if (goldFacts > 0 && goldDimensions > 0 && goldRelationships === 0) {
      issues.push("Gold ERD: No star schema relationships detected");
    }

    // Expected minimum relationships for gold layer
    const expectedGoldRelationships = goldFacts * Math.min(3, goldDimensions);
    if (goldRelationships < expectedGoldRelationships * 0.5) {
      issues.push(
        `Gold ERD: Low relationship count (${goldRelationships} vs expected ~${expectedGoldRelationships})`,
      );
    }

    // Determine status
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    if (issues.length > 2) {
      status = "FAIL";
      totalFail++;
    } else if (issues.length > 0) {
      status = "WARN";
      totalWarn++;
    } else {
      totalPass++;
    }

    // Create report
    const report: DomainERDReport = {
      domainId: domain.id,
      domainName: domain.name,
      logicalEntities,
      logicalRelationships,
      bronzeTables,
      bronzeRelationships,
      silverTables,
      silverRelationships,
      goldDimensions,
      goldFacts,
      goldRelationships,
      totalRelationships,
      status,
      issues,
    };
    reports.push(report);

    // Print summary
    console.log(
      `  Logical: ${logicalEntities} entities, ${logicalRelationships} relationships`,
    );
    console.log(
      `  Bronze:  ${bronzeTables} tables, ${bronzeRelationships} relationships`,
    );
    console.log(
      `  Silver:  ${silverTables} tables, ${silverRelationships} relationships`,
    );
    console.log(
      `  Gold:    ${goldDimensions} dims + ${goldFacts} facts, ${goldRelationships} relationships`,
    );
    console.log(`  Total:   ${totalRelationships} relationships`);
    console.log(
      `  Status:  ${status === "PASS" ? "✅" : status === "WARN" ? "⚠️" : "❌"} ${status}`,
    );

    if (issues.length > 0) {
      console.log(`  Issues:`);
      issues.forEach((issue) => console.log(`    - ${issue}`));
    }
  }

  // Print final summary
  console.log("\n" + "=".repeat(80));
  console.log("VERIFICATION SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total Domains Tested: ${enterpriseDomains.length}`);
  console.log(`✅ PASS: ${totalPass} domains`);
  console.log(`⚠️  WARN: ${totalWarn} domains`);
  console.log(`❌ FAIL: ${totalFail} domains`);
  console.log("");

  // Print pass rate
  const passRate = (totalPass / enterpriseDomains.length) * 100;
  console.log(`Overall Pass Rate: ${passRate.toFixed(1)}%`);
  console.log("");

  // Print domains with issues
  if (totalWarn + totalFail > 0) {
    console.log("DOMAINS REQUIRING ATTENTION:");
    console.log("-".repeat(80));

    const problemDomains = reports.filter((r) => r.status !== "PASS");
    problemDomains.forEach((report) => {
      console.log(
        `\n${report.status === "FAIL" ? "❌" : "⚠️"} ${report.domainName} (${report.domainId})`,
      );
      report.issues.forEach((issue) => console.log(`  - ${issue}`));
    });
  }

  console.log("\n" + "=".repeat(80));
  console.log("DETAILED REPORT BY PRIORITY");
  console.log("=".repeat(80));

  // Group by priority
  const p0Domains = [
    "customer-core",
    "loans",
    "deposits",
    "fraud",
    "compliance",
    "risk",
  ];
  const p1Domains = [
    "credit-cards",
    "payments",
    "treasury",
    "collections",
    "revenue",
    "mortgages",
    "trade-finance",
    "cash-management",
  ];

  console.log("\n📌 PRIORITY P0 (Critical Business Domains)");
  console.log("-".repeat(80));
  reports
    .filter((r) => p0Domains.includes(r.domainId))
    .forEach((report) => {
      const statusIcon =
        report.status === "PASS"
          ? "✅"
          : report.status === "WARN"
            ? "⚠️"
            : "❌";
      console.log(
        `${statusIcon} ${report.domainName.padEnd(30)} | Total Rels: ${String(report.totalRelationships).padStart(3)} | ${report.status}`,
      );
    });

  console.log("\n📌 PRIORITY P1 (High Business Value)");
  console.log("-".repeat(80));
  reports
    .filter((r) => p1Domains.includes(r.domainId))
    .forEach((report) => {
      const statusIcon =
        report.status === "PASS"
          ? "✅"
          : report.status === "WARN"
            ? "⚠️"
            : "❌";
      console.log(
        `${statusIcon} ${report.domainName.padEnd(30)} | Total Rels: ${String(report.totalRelationships).padStart(3)} | ${report.status}`,
      );
    });

  console.log("\n📌 PRIORITY P2 (Standard Business Value)");
  console.log("-".repeat(80));
  reports
    .filter(
      (r) => !p0Domains.includes(r.domainId) && !p1Domains.includes(r.domainId),
    )
    .forEach((report) => {
      const statusIcon =
        report.status === "PASS"
          ? "✅"
          : report.status === "WARN"
            ? "⚠️"
            : "❌";
      console.log(
        `${statusIcon} ${report.domainName.padEnd(30)} | Total Rels: ${String(report.totalRelationships).padStart(3)} | ${report.status}`,
      );
    });

  console.log("\n" + "=".repeat(80));
  console.log("TEST COMPLETE");
  console.log("=".repeat(80));
  console.log("");

  // Return exit code
  return totalFail === 0 ? 0 : 1;
}

// Run test
if (require.main === module) {
  const exitCode = testERDRelationships();
  process.exit(exitCode);
}

export { testERDRelationships };
