// Domain Registry
// Central catalog of all banking domains with their metadata
// Note: Detailed domain data is now lazy-loaded on demand to improve initial load time

import {
  loadDomainMetadata,
  loadDomainGoldMetrics,
  loadDomainSubDomains,
  loadDomainUseCases,
  loadDomainGlossary,
  loadDomainSTTM,
  loadDomainBronzeTables,
  loadDomainSilverTables,
  loadDomainGoldTables,
  loadDomainBronzeIngestionJobs,
  loadDomainLogicalModel,
} from "./lazy-loader";

// Import sub-domains and use cases for initial population
import { customerSubDomains } from "./customer/shared/metadata";
import { customerUseCases } from "./customer/shared/use-cases";
import { depositsSubDomains } from "./deposits/metadata";
import { depositsUseCases } from "./deposits/use-cases";
import { transactionsSubDomains } from "./transactions/metadata";
import { transactionsUseCases } from "./transactions/use-cases";

// Import gold metrics for each domain
import { customerGoldMetrics } from "./customer/gold/metrics-catalog";
import { depositsGoldMetrics } from "./deposits/gold-metrics";
import { transactionsGoldMetrics } from "./transactions/gold-metrics";

export interface PilotDomain {
  id: string;
  displayName: string;
  metadata: any;
  goldMetrics: any[];
  subDomains: any[];
  useCases: any[];
  glossary: any[];
  sttmMapping: any[];
  tableCoverage: any[];
  sttmGaps: any[];
  bronzeTables?: any[];
  silverTables?: any[];
  goldDimensions?: any[];
  goldFacts?: any[];
  metricsCatalog?: any;
}

// Basic domain info (loaded synchronously for listing purposes)
export const pilotDomains: PilotDomain[] = [
  {
    id: "customer",
    displayName: "Customer Core",
    metadata: {},
    goldMetrics: customerGoldMetrics,
    subDomains: customerSubDomains,
    useCases: customerUseCases,
    glossary: [],
    sttmMapping: [],
    tableCoverage: [],
    sttmGaps: [],
    bronzeTables: [],
    silverTables: [],
    goldDimensions: [],
    goldFacts: [],
    metricsCatalog: undefined,
  },
  {
    id: "deposits",
    displayName: "Deposits",
    metadata: {},
    goldMetrics: depositsGoldMetrics,
    subDomains: depositsSubDomains,
    useCases: depositsUseCases,
    glossary: [],
    sttmMapping: [],
    tableCoverage: [],
    sttmGaps: [],
    bronzeTables: [],
    silverTables: [],
    goldFacts: [],
    goldDimensions: [],
  },
  {
    id: "transactions",
    displayName: "Transactions",
    metadata: {},
    goldMetrics: transactionsGoldMetrics,
    subDomains: transactionsSubDomains,
    useCases: transactionsUseCases,
    glossary: [],
    sttmMapping: [],
    tableCoverage: [],
    sttmGaps: [],
    bronzeTables: [],
    silverTables: [],
    goldFacts: [],
    goldDimensions: [],
  },
];

export function getPilotDomainById(id: string): PilotDomain | undefined {
  return pilotDomains.find((d) => d.id === id);
}

export function getAllPilotDomains(): PilotDomain[] {
  return pilotDomains;
}

// Async data loaders - load data on-demand
export async function getPilotDomainMetadataAsync(id: string) {
  return loadDomainMetadata(id);
}

export async function getPilotDomainGoldMetricsAsync(id: string) {
  return loadDomainGoldMetrics(id);
}

export async function getPilotDomainSubDomainsAsync(id: string) {
  return loadDomainSubDomains(id);
}

export async function getPilotDomainUseCasesAsync(id: string) {
  return loadDomainUseCases(id);
}

export async function getPilotDomainGlossaryAsync(id: string) {
  return loadDomainGlossary(id);
}

export async function getPilotDomainSTTMMappingAsync(id: string) {
  return loadDomainSTTM(id);
}

export async function getPilotDomainBronzeTablesAsync(id: string) {
  return loadDomainBronzeTables(id);
}

export async function getPilotDomainSilverTablesAsync(id: string) {
  return loadDomainSilverTables(id);
}

export async function getPilotDomainGoldTablesAsync(id: string) {
  return loadDomainGoldTables(id);
}

export async function getPilotDomainBronzeIngestionJobsAsync(id: string) {
  return loadDomainBronzeIngestionJobs(id);
}

export async function getPilotDomainLogicalModelAsync(id: string) {
  return loadDomainLogicalModel(id);
}
