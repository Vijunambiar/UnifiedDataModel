#!/usr/bin/env ts-node
/**
 * STTM Coverage Analysis Script
 * 
 * Purpose: Analyze silver layer tables and count total columns to ensure 100% STTM coverage
 * Expected: 700 columns across 19 tables
 * 
 * This script will:
 * 1. Count all columns in silver layer definitions
 * 2. Count all STTM mappings in complete files
 * 3. Identify gaps
 * 4. Generate summary report
 */

import { customerSilverTables } from "../client/lib/domains/customer/silver-layer";
import { depositsSilverTables } from "../client/lib/domains/deposits/silver-layer";
import { transactionsSilverTables } from "../client/lib/domains/transactions/silver-layer";
import { customerSTTMMapping_Complete } from "../client/lib/domains/customer/sttm-mapping-complete";
import { depositsSTTMMapping_Complete } from "../client/lib/domains/deposits/sttm-mapping-complete";
import { transactionsSTTMMapping_Complete } from "../client/lib/domains/transactions/sttm-mapping-complete";

interface TableAnalysis {
  domain: string;
  tableName: string;
  schema: string;
  columnCount: number;
  scdType: string;
  businessKey: string;
  columns: string[];
}

interface DomainSummary {
  domain: string;
  tableCount: number;
  totalColumns: number;
  sttmMappings: number;
  coverage: string;
  tables: TableAnalysis[];
}

function analyzeSilverTables() {
  console.log("=" .repeat(80));
  console.log("STTM COVERAGE ANALYSIS - SILVER LAYER");
  console.log("=" .repeat(80));
  console.log();

  const domains: DomainSummary[] = [];

  // Analyze Customer Domain
  const customerTables: TableAnalysis[] = customerSilverTables.map((table) => ({
    domain: "Customer",
    tableName: table.name,
    schema: table.schema,
    columnCount: table.columns.length,
    scdType: table.scdType,
    businessKey: table.businessKey,
    columns: table.columns.map((col) => col.name),
  }));

  const customerTotalColumns = customerTables.reduce((sum, t) => sum + t.columnCount, 0);
  const customerSTTMCount = customerSTTMMapping_Complete.length;

  domains.push({
    domain: "Customer",
    tableCount: customerTables.length,
    totalColumns: customerTotalColumns,
    sttmMappings: customerSTTMCount,
    coverage: ((customerSTTMCount / customerTotalColumns) * 100).toFixed(1) + "%",
    tables: customerTables,
  });

  // Analyze Deposits Domain
  const depositTables: TableAnalysis[] = depositsSilverTables.map((table) => ({
    domain: "Deposits",
    tableName: table.name,
    schema: table.schema,
    columnCount: table.columns.length,
    scdType: table.scdType,
    businessKey: table.businessKey,
    columns: table.columns.map((col) => col.name),
  }));

  const depositTotalColumns = depositTables.reduce((sum, t) => sum + t.columnCount, 0);
  const depositSTTMCount = depositsSTTMMapping_Complete.length;

  domains.push({
    domain: "Deposits",
    tableCount: depositTables.length,
    totalColumns: depositTotalColumns,
    sttmMappings: depositSTTMCount,
    coverage: ((depositSTTMCount / depositTotalColumns) * 100).toFixed(1) + "%",
    tables: depositTables,
  });

  // Analyze Transactions Domain
  const transactionTables: TableAnalysis[] = transactionsSilverTables.map((table) => ({
    domain: "Transactions",
    tableName: table.name,
    schema: table.schema,
    columnCount: table.columns.length,
    scdType: table.scdType,
    businessKey: table.businessKey,
    columns: table.columns.map((col) => col.name),
  }));

  const transactionTotalColumns = transactionTables.reduce((sum, t) => sum + t.columnCount, 0);
  const transactionSTTMCount = transactionsSTTMMapping_Complete.length;

  domains.push({
    domain: "Transactions",
    tableCount: transactionTables.length,
    totalColumns: transactionTotalColumns,
    sttmMappings: transactionSTTMCount,
    coverage: ((transactionSTTMCount / transactionTotalColumns) * 100).toFixed(1) + "%",
    tables: transactionTables,
  });

  // Print Domain Summaries
  console.log("DOMAIN SUMMARIES");
  console.log("-" .repeat(80));
  console.log();

  domains.forEach((domain) => {
    console.log(`${domain.domain} Domain:`);
    console.log(`  Tables: ${domain.tableCount}`);
    console.log(`  Total Columns: ${domain.totalColumns}`);
    console.log(`  STTM Mappings: ${domain.sttmMappings}`);
    console.log(`  Coverage: ${domain.coverage}`);
    console.log(`  Gap: ${domain.totalColumns - domain.sttmMappings} columns unmapped`);
    console.log();
  });

  // Grand Total
  const totalTables = domains.reduce((sum, d) => sum + d.tableCount, 0);
  const totalColumns = domains.reduce((sum, d) => sum + d.totalColumns, 0);
  const totalSTTMMappings = domains.reduce((sum, d) => sum + d.sttmMappings, 0);
  const overallCoverage = ((totalSTTMMappings / totalColumns) * 100).toFixed(1);

  console.log("=" .repeat(80));
  console.log("GRAND TOTAL ACROSS ALL DOMAINS");
  console.log("=" .repeat(80));
  console.log();
  console.log(`Total Tables: ${totalTables}`);
  console.log(`Total Columns: ${totalColumns}`);
  console.log(`Total STTM Mappings: ${totalSTTMMappings}`);
  console.log(`Overall Coverage: ${overallCoverage}%`);
  console.log(`Total Gap: ${totalColumns - totalSTTMMappings} columns unmapped`);
  console.log();

  // Detailed Table Breakdown
  console.log("=" .repeat(80));
  console.log("DETAILED TABLE BREAKDOWN");
  console.log("=" .repeat(80));
  console.log();

  domains.forEach((domain) => {
    console.log(`\n${domain.domain.toUpperCase()} DOMAIN TABLES:`);
    console.log("-" .repeat(80));
    domain.tables.forEach((table, idx) => {
      console.log(`\n${idx + 1}. ${table.tableName}`);
      console.log(`   Schema: ${table.schema}`);
      console.log(`   Columns: ${table.columnCount}`);
      console.log(`   SCD Type: ${table.scdType}`);
      console.log(`   Business Key: ${table.businessKey}`);
      console.log(`   Column List:`);
      table.columns.forEach((col, colIdx) => {
        console.log(`     ${(colIdx + 1).toString().padStart(3)}. ${col}`);
      });
    });
  });

  // Expected vs Actual
  console.log("\n\n" + "=" .repeat(80));
  console.log("EXPECTED VS ACTUAL COMPARISON");
  console.log("=" .repeat(80));
  console.log();
  console.log(`Expected (from user): 700 columns across 19 tables`);
  console.log(`Actual (in code):     ${totalColumns} columns across ${totalTables} tables`);
  console.log(`STTM Mappings:        ${totalSTTMMappings}`);
  console.log();
  console.log(`Discrepancy: ${700 - totalColumns} columns | ${19 - totalTables} tables`);
  console.log();

  if (totalColumns < 700 || totalTables < 19) {
    console.log("⚠️  WARNING: Current silver layer definitions do not match expected scope!");
    console.log("   There may be additional tables or columns not yet defined in the silver-layer.ts files.");
    console.log("   Please verify with the original STTM Excel file.");
  } else {
    console.log("✅ Silver layer definitions match or exceed expected scope.");
  }

  console.log("\n" + "=" .repeat(80));
}

// Run analysis
analyzeSilverTables();
