// Lazy-loading cache for domain data to avoid loading all domains upfront
const domainDataCache = new Map<string, Promise<any>>();

export async function loadDomainMetadata(domainId: string) {
  if (domainDataCache.has(`${domainId}-metadata`)) {
    return domainDataCache.get(`${domainId}-metadata`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/shared/metadata").then(
      (m) => m.customerDomainMetadata,
    );
  } else if (domainId === "deposits") {
    promise = import("./deposits/metadata").then(
      (m) => m.depositsDomainMetadata,
    );
  } else if (domainId === "transactions") {
    promise = import("./transactions/metadata").then(
      (m) => m.transactionsDomainMetadata,
    );
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-metadata`, promise);
  return promise;
}

export async function loadDomainGoldMetrics(domainId: string) {
  if (domainDataCache.has(`${domainId}-goldMetrics`)) {
    return domainDataCache.get(`${domainId}-goldMetrics`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/gold/metrics-catalog").then(
      (m) => m.customerGoldMetrics,
    );
  } else if (domainId === "deposits") {
    promise = import("./deposits/gold-metrics").then(
      (m) => m.depositsGoldMetrics,
    );
  } else if (domainId === "transactions") {
    promise = import("./transactions/gold-metrics").then(
      (m) => m.transactionsGoldMetrics,
    );
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-goldMetrics`, promise);
  return promise;
}

export async function loadDomainSubDomains(domainId: string) {
  if (domainDataCache.has(`${domainId}-subDomains`)) {
    return domainDataCache.get(`${domainId}-subDomains`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/shared/metadata").then(
      (m) => m.customerSubDomains,
    );
  } else if (domainId === "deposits") {
    promise = import("./deposits/metadata").then((m) => m.depositsSubDomains);
  } else if (domainId === "transactions") {
    promise = import("./transactions/metadata").then(
      (m) => m.transactionsSubDomains,
    );
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-subDomains`, promise);
  return promise;
}

export async function loadDomainUseCases(domainId: string) {
  if (domainDataCache.has(`${domainId}-useCases`)) {
    return domainDataCache.get(`${domainId}-useCases`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/shared/use-cases").then(
      (m) => m.customerUseCases,
    );
  } else if (domainId === "deposits") {
    promise = import("./deposits/use-cases").then((m) => m.depositsUseCases);
  } else if (domainId === "transactions") {
    promise = import("./transactions/use-cases").then(
      (m) => m.transactionsUseCases,
    );
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-useCases`, promise);
  return promise;
}

export async function loadDomainGlossary(domainId: string) {
  if (domainDataCache.has(`${domainId}-glossary`)) {
    return domainDataCache.get(`${domainId}-glossary`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/shared/glossary").then(
      (m) => m.customerGlossary,
    );
  } else if (domainId === "deposits") {
    promise = import("./deposits/glossary").then((m) => m.depositsGlossary);
  } else if (domainId === "transactions") {
    promise = import("./transactions/glossary").then(
      (m) => m.transactionsGlossary,
    );
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-glossary`, promise);
  return promise;
}

export async function loadDomainSTTM(domainId: string) {
  if (domainDataCache.has(`${domainId}-sttm`)) {
    return domainDataCache.get(`${domainId}-sttm`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/silver/sttm-mapping").then((m) => ({
      mappings: m.customerSTTMMapping_Combined.map((col: any) => ({
        sourceSystem: col.sourceSystem,
        sourceColumn: col.sourceColumn,
        targetTable: col.silverTable,
        targetColumn: col.silverColumn,
      })),
      gaps: m.customerSTTMGaps,
      tableCoverage: m.customerTableCoverage.map((t: any) => ({
        name: t.fisTable,
        coverage: parseInt(t.coverage.replace("%", "")) || 0,
      })),
    }));
  } else if (domainId === "deposits") {
    promise = import("./deposits/sttm-mapping").then((m) => ({
      mappings: m.depositsSTTMMapping_Combined.map((col: any) => ({
        sourceSystem: col.sourceSystem,
        sourceColumn: col.sourceColumn,
        targetTable: col.silverTable,
        targetColumn: col.silverColumn,
      })),
      gaps: m.depositsSTTMGaps,
      tableCoverage: m.depositsTableCoverage.map((t: any) => ({
        name: t.fisTable,
        coverage: parseInt(t.coverage.replace("%", "")) || 0,
      })),
    }));
  } else if (domainId === "transactions") {
    promise = import("./transactions/sttm-mapping").then((m) => ({
      mappings: m.transactionsSTTMMapping.map((col: any) => ({
        sourceSystem: col.sourceSystem,
        sourceColumn: col.sourceColumn,
        targetTable: col.silverTable,
        targetColumn: col.silverColumn,
      })),
      gaps: m.transactionsSTTMGaps,
      tableCoverage: m.transactionsTableCoverage.map((t: any) => ({
        name: t.fisTable,
        coverage: parseInt(t.coverage.replace("%", "")) || 0,
      })),
    }));
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-sttm`, promise);
  return promise;
}

export async function loadDomainBronzeTables(domainId: string) {
  if (domainDataCache.has(`${domainId}-bronzeTables`)) {
    return domainDataCache.get(`${domainId}-bronzeTables`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/shared/metadata").then(
      (m) => m.customerBronzeTables,
    );
  } else if (domainId === "deposits") {
    promise = import("./deposits/metadata").then((m) => m.depositsBronzeTables);
  } else if (domainId === "transactions") {
    promise = import("./transactions/metadata").then(
      (m) => m.transactionsBronzeTables,
    );
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-bronzeTables`, promise);
  return promise;
}

export async function loadDomainSilverTables(domainId: string) {
  if (domainDataCache.has(`${domainId}-silverTables`)) {
    return domainDataCache.get(`${domainId}-silverTables`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/shared/metadata").then(
      (m) => m.customerSilverTables,
    );
  } else if (domainId === "deposits") {
    promise = import("./deposits/metadata").then((m) => m.depositsSilverTables);
  } else if (domainId === "transactions") {
    promise = import("./transactions/metadata").then(
      (m) => m.transactionsSilverTables,
    );
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-silverTables`, promise);
  return promise;
}

export async function loadDomainGoldTables(domainId: string) {
  if (domainDataCache.has(`${domainId}-goldTables`)) {
    return domainDataCache.get(`${domainId}-goldTables`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = Promise.all([
      import("./customer/shared/metadata").then(
        (m) => m.customerGoldDimensions,
      ),
      import("./customer/shared/metadata").then((m) => m.customerGoldFacts),
    ]).then(([dims, facts]) => [...dims, ...facts]);
  } else if (domainId === "deposits") {
    promise = Promise.all([
      import("./deposits/metadata").then((m) => m.depositsGoldDimensions || []),
      import("./deposits/gold-layer").then(
        (m) => m.depositsGoldLayerComplete?.tables || [],
      ),
    ]).then(([dims, facts]) => [...dims, ...facts]);
  } else if (domainId === "transactions") {
    promise = Promise.all([
      import("./transactions/metadata").then(
        (m) => m.transactionsGoldDimensions || [],
      ),
      import("./transactions/gold-layer").then(
        (m) => m.transactionsGoldLayerComplete?.tables || [],
      ),
    ]).then(([dims, facts]) => [...dims, ...facts]);
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-goldTables`, promise);
  return promise;
}

export async function loadDomainBronzeIngestionJobs(domainId: string) {
  if (domainDataCache.has(`${domainId}-bronzeIngestionJobs`)) {
    return domainDataCache.get(`${domainId}-bronzeIngestionJobs`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/bronze/ingestion-jobs").then(
      (m) => m.customerBronzeIngestionCatalog,
    );
  } else if (domainId === "deposits") {
    promise = import("./deposits/bronze/ingestion-jobs").then(
      (m) => m.depositsBronzeIngestionCatalog,
    );
  } else if (domainId === "transactions") {
    promise = Promise.resolve({ jobs: [], domain: domainId, layer: "Bronze" });
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-bronzeIngestionJobs`, promise);
  return promise;
}

export async function loadDomainLogicalModel(domainId: string) {
  if (domainDataCache.has(`${domainId}-logicalModel`)) {
    return domainDataCache.get(`${domainId}-logicalModel`)!;
  }

  let promise: Promise<any>;

  if (domainId === "customer") {
    promise = import("./customer/bronze/logical-model").then(
      (m) => m.customerLogicalModel,
    );
  } else if (domainId === "deposits") {
    promise = Promise.resolve(null);
  } else if (domainId === "transactions") {
    promise = Promise.resolve(null);
  } else {
    promise = Promise.reject(new Error(`Unknown domain: ${domainId}`));
  }

  domainDataCache.set(`${domainId}-logicalModel`, promise);
  return promise;
}

export function clearDomainCache(domainId?: string) {
  if (domainId) {
    Array.from(domainDataCache.keys()).forEach((key) => {
      if (key.startsWith(domainId)) {
        domainDataCache.delete(key);
      }
    });
  } else {
    domainDataCache.clear();
  }
}
