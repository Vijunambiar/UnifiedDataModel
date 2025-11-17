import * as XLSX from "xlsx";
import { bankingAreas } from "./banking-areas";
import { bankingDomains } from "./enterprise-domains";

export function exportBankingAreasToXLSX() {
  const workbook = XLSX.utils.book_new();

  const overviewData: any[] = [
    ["Banking Areas Overview"],
    [""],
    [
      "Banking Area",
      "Description",
      "Total Domains",
      "Total Metrics",
      "Customer Segments",
      "Strategic Priority",
      "Revenue Model",
    ],
    ...bankingAreas.map((area) => [
      area.name,
      area.description,
      area.metrics.totalDomains,
      area.metrics.totalMetrics,
      area.metrics.customerSegments,
      area.strategicPriority,
      area.revenueModel.join("; "),
    ]),
  ];

  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  overviewSheet["!cols"] = [
    { wch: 30 },
    { wch: 80 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 60 },
  ];
  XLSX.utils.book_append_sheet(
    workbook,
    overviewSheet,
    "Banking Areas Overview",
  );

  const capabilitiesData: any[] = [
    ["Banking Area Capabilities"],
    [""],
    ["Banking Area", "Key Capabilities", "Target Customers"],
    ...bankingAreas.map((area) => [
      area.name,
      area.keyCapabilities.join("\n• "),
      area.targetCustomers.join("; "),
    ]),
  ];

  const capabilitiesSheet = XLSX.utils.aoa_to_sheet(capabilitiesData);
  capabilitiesSheet["!cols"] = [{ wch: 30 }, { wch: 100 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, capabilitiesSheet, "Capabilities");

  const detailedData: any[] = [
    ["Detailed Domain Information"],
    [""],
    [
      "Banking Area",
      "Domain Name",
      "Description",
      "Sub-Domains",
      "Data Sources",
      "Use Cases",
      "Key Entities",
      "Priority",
      "Complexity",
      "Business Value",
      "Bronze Tables",
      "Silver Tables",
      "Gold Tables",
      "Total Metrics",
      "Regulatory Context",
      "Stakeholders",
      "Refresh Frequency",
    ],
  ];

  bankingAreas.forEach((area) => {
    const areaDomains = bankingDomains.filter((domain) =>
      area.domainIds.includes(domain.id),
    );

    areaDomains.forEach((domain) => {
      detailedData.push([
        area.name,
        domain.name,
        domain.description,
        domain.subDomains.join("\n• "),
        domain.dataSources.join("\n• "),
        domain.useCases.join("\n• "),
        domain.keyEntities.join("; "),
        domain.priority,
        domain.complexity,
        domain.businessValue,
        domain.tablesCount.bronze,
        domain.tablesCount.silver,
        domain.tablesCount.gold,
        domain.keyMetricsCount,
        domain.regulatoryContext.join("\n• "),
        domain.stakeholders.join("; "),
        domain.dataFlow.refreshFrequency,
      ]);
    });
  });

  const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
  detailedSheet["!cols"] = [
    { wch: 30 },
    { wch: 30 },
    { wch: 80 },
    { wch: 50 },
    { wch: 50 },
    { wch: 60 },
    { wch: 50 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 50 },
    { wch: 40 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, detailedSheet, "Detailed Domains");

  const dataFlowData: any[] = [
    ["Domain Data Flow"],
    [""],
    [
      "Banking Area",
      "Domain Name",
      "Upstream Sources",
      "Downstream Consumers",
      "Refresh Frequency",
      "Latency SLA",
    ],
  ];

  bankingAreas.forEach((area) => {
    const areaDomains = bankingDomains.filter((domain) =>
      area.domainIds.includes(domain.id),
    );

    areaDomains.forEach((domain) => {
      dataFlowData.push([
        area.name,
        domain.name,
        domain.dataFlow.upstreamSources.join("\n• "),
        domain.dataFlow.downstreamConsumers.join("\n• "),
        domain.dataFlow.refreshFrequency,
        domain.dataFlow.latencySLA || "N/A",
      ]);
    });
  });

  const dataFlowSheet = XLSX.utils.aoa_to_sheet(dataFlowData);
  dataFlowSheet["!cols"] = [
    { wch: 30 },
    { wch: 30 },
    { wch: 60 },
    { wch: 60 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, dataFlowSheet, "Data Flow");

  const summaryData: any[] = [
    ["Summary Statistics"],
    [""],
    ["Metric", "Value"],
    ["Total Banking Areas", bankingAreas.length],
    ["Total Domains", bankingDomains.length],
    [
      "Total Metrics",
      bankingAreas.reduce((sum, a) => sum + a.metrics.totalMetrics, 0),
    ],
    [
      "Core Business Areas",
      bankingAreas.filter((a) => a.strategicPriority === "Core").length,
    ],
    [
      "Growth Business Areas",
      bankingAreas.filter((a) => a.strategicPriority === "Growth").length,
    ],
    [
      "Emerging Business Areas",
      bankingAreas.filter((a) => a.strategicPriority === "Emerging").length,
    ],
    [""],
    ["Banking Area Breakdown"],
    ["Banking Area", "Domain Count", "Metrics Count"],
    ...bankingAreas.map((area) => [
      area.name,
      area.metrics.totalDomains,
      area.metrics.totalMetrics,
    ]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  const timestamp = new Date().toISOString().split("T")[0];
  const fileName = `Banking_Areas_Export_${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
