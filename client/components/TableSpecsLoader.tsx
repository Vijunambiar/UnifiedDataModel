import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Database, GitBranch, Table2, TrendingUp } from "lucide-react";
import { TableSchemaViewer } from "@/components/TableSchemaViewer";

interface TableSpecsLoaderProps {
  domainId: string;
  domain: any;
}

export function TableSpecsLoader({ domainId, domain }: TableSpecsLoaderProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bronzeTables, setBronzeTables] = useState<any[]>([]);
  const [silverTables, setSilverTables] = useState<any[]>([]);
  const [goldDimensions, setGoldDimensions] = useState<any[]>([]);
  const [goldFacts, setGoldFacts] = useState<any[]>([]);

  useEffect(() => {
    // Reset state when domain changes
    setLoading(true);
    setError(null);
    setBronzeTables([]);
    setSilverTables([]);
    setGoldDimensions([]);
    setGoldFacts([]);

    // Dynamically import table specifications based on domain
    const loadTableSpecs = async () => {
      console.log('[TableSpecsLoader] Loading specs for domain:', domainId);
      try {
        if (domainId === 'customer-commercial') {
          const [bronze, silver, gold] = await Promise.all([
            import("@/lib/commercial/customer-commercial-bronze-layer"),
            import("@/lib/commercial/customer-commercial-silver-layer"),
            import("@/lib/commercial/customer-commercial-gold-layer"),
          ]);
          setBronzeTables(bronze.customerCommercialBronzeTables || []);
          setSilverTables(silver.customerCommercialSilverTables || []);
          setGoldDimensions(gold.customerCommercialGoldLayer?.dimensions || []);
          setGoldFacts(gold.customerCommercialGoldLayer?.facts || []);
        } else if (domainId === 'loans-commercial') {
          const [bronze, silver, gold] = await Promise.all([
            import("@/lib/commercial/loans-commercial-bronze-layer"),
            import("@/lib/commercial/loans-commercial-silver-layer"),
            import("@/lib/commercial/loans-commercial-gold-layer"),
          ]);
          setBronzeTables(bronze.loansCommercialBronzeTables || []);
          setSilverTables(silver.loansCommercialSilverTables || []);
          setGoldDimensions(gold.loansCommercialGoldLayer?.dimensions || []);
          setGoldFacts(gold.loansCommercialGoldLayer?.facts || []);
        } else if (domainId === 'deposits-commercial') {
          const [bronze, silver, gold] = await Promise.all([
            import("@/lib/commercial/deposits-commercial-bronze-layer"),
            import("@/lib/commercial/deposits-commercial-silver-layer"),
            import("@/lib/commercial/deposits-commercial-gold-layer"),
          ]);
          setBronzeTables(bronze.depositsCommercialBronzeTables || []);
          setSilverTables(silver.depositsCommercialSilverTables || []);
          setGoldDimensions(gold.depositsCommercialGoldLayer?.dimensions || []);
          setGoldFacts(gold.depositsCommercialGoldLayer?.facts || []);
        } else if (domainId === 'payments-commercial') {
          const [bronze, silver, gold] = await Promise.all([
            import("@/lib/commercial/payments-commercial-bronze-layer"),
            import("@/lib/commercial/payments-commercial-silver-layer"),
            import("@/lib/commercial/payments-commercial-gold-layer"),
          ]);
          setBronzeTables(bronze.paymentsCommercialBronzeTables || []);
          setSilverTables(silver.paymentsCommercialSilverTables || []);
          setGoldDimensions(gold.paymentsCommercialGoldLayer?.dimensions || []);
          setGoldFacts(gold.paymentsCommercialGoldLayer?.facts || []);
        } else if (domainId === 'treasury-commercial') {
          const [bronze, silver, gold] = await Promise.all([
            import("@/lib/commercial/treasury-commercial-bronze-layer"),
            import("@/lib/commercial/treasury-commercial-silver-layer"),
            import("@/lib/commercial/treasury-commercial-gold-layer"),
          ]);
          setBronzeTables(bronze.treasuryCommercialBronzeTables || []);
          setSilverTables(silver.treasuryCommercialSilverTables || []);
          setGoldDimensions(gold.treasuryCommercialGoldLayer?.dimensions || []);
          setGoldFacts(gold.treasuryCommercialGoldLayer?.facts || []);
        } else if (domainId === 'trade-finance-commercial') {
          const comprehensive = await import("@/lib/commercial/trade-finance-commercial-comprehensive");
          setBronzeTables(comprehensive.tradeFinanceCommercialBronzeLayer?.tables || []);
          setSilverTables(comprehensive.tradeFinanceCommercialSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.tradeFinanceCommercialGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.tradeFinanceCommercialGoldLayer?.facts || []);
        } else if (domainId === 'merchant-services-commercial') {
          const comprehensive = await import("@/lib/commercial/merchant-services-commercial-comprehensive");
          setBronzeTables(comprehensive.merchantServicesCommercialBronzeLayer?.tables || []);
          setSilverTables(comprehensive.merchantServicesCommercialSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.merchantServicesCommercialGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.merchantServicesCommercialGoldLayer?.facts || []);
        } else if (domainId === 'abl-commercial') {
          const comprehensive = await import("@/lib/commercial/abl-commercial-comprehensive");
          setBronzeTables(comprehensive.ablCommercialBronzeLayer?.tables || []);
          setSilverTables(comprehensive.ablCommercialSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.ablCommercialGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.ablCommercialGoldLayer?.facts || []);
        } else if (domainId === 'leasing-commercial') {
          const comprehensive = await import("@/lib/commercial/leasing-commercial-comprehensive");
          setBronzeTables(comprehensive.leasingCommercialBronzeLayer?.tables || []);
          setSilverTables(comprehensive.leasingCommercialSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.leasingCommercialGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.leasingCommercialGoldLayer?.facts || []);
        } else if (domainId === 'customer-retail') {
          const comprehensive = await import("@/lib/retail/customer-retail-comprehensive");
          setBronzeTables(comprehensive.customerRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.customerRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.customerRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.customerRetailGoldLayer?.facts || []);
        } else if (domainId === 'deposits-retail') {
          const comprehensive = await import("@/lib/retail/deposits-retail-comprehensive");
          setBronzeTables(comprehensive.depositsRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.depositsRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.depositsRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.depositsRetailGoldLayer?.facts || []);
        } else if (domainId === 'loans-retail') {
          const comprehensive = await import("@/lib/retail/loans-retail-comprehensive");
          setBronzeTables(comprehensive.loansRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.loansRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.loansRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.loansRetailGoldLayer?.facts || []);
        } else if (domainId === 'cards-retail') {
          const comprehensive = await import("@/lib/retail/cards-retail-comprehensive");
          setBronzeTables(comprehensive.cardsRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.cardsRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.cardsRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.cardsRetailGoldLayer?.facts || []);
        } else if (domainId === 'payments-retail') {
          const comprehensive = await import("@/lib/retail/payments-retail-comprehensive");
          setBronzeTables(comprehensive.paymentsRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.paymentsRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.paymentsRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.paymentsRetailGoldLayer?.facts || []);
        } else if (domainId === 'customer-core') {
          const comprehensive = await import("@/lib/customer-core-comprehensive");
          setBronzeTables(comprehensive.customerCoreBronzeLayer?.tables || []);
          setSilverTables(comprehensive.customerCoreSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.customerCoreGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.customerCoreGoldLayer?.facts || []);
        } else if (domainId === 'branch-retail') {
          const comprehensive = await import("@/lib/retail/branch-retail-comprehensive");
          setBronzeTables(comprehensive.branchRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.branchRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.branchRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.branchRetailGoldLayer?.facts || []);
        } else if (domainId === 'marketing-retail') {
          const comprehensive = await import("@/lib/retail/marketing-retail-comprehensive");
          setBronzeTables(comprehensive.marketingRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.marketingRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.marketingRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.marketingRetailGoldLayer?.facts || []);
        } else if (domainId === 'sales-retail') {
          const comprehensive = await import("@/lib/retail/sales-retail-comprehensive");
          setBronzeTables(comprehensive.salesRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.salesRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.salesRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.salesRetailGoldLayer?.facts || []);
        } else if (domainId === 'collections-retail') {
          const comprehensive = await import("@/lib/retail/collections-retail-comprehensive");
          setBronzeTables(comprehensive.collectionsRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.collectionsRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.collectionsRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.collectionsRetailGoldLayer?.facts || []);
        } else if (domainId === 'compliance-retail') {
          const comprehensive = await import("@/lib/retail/compliance-retail-comprehensive");
          setBronzeTables(comprehensive.complianceRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.complianceRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.complianceRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.complianceRetailGoldLayer?.facts || []);
        } else if (domainId === 'customer-service-retail') {
          const comprehensive = await import("@/lib/retail/customer-service-retail-comprehensive");
          setBronzeTables(comprehensive.customerServiceRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.customerServiceRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.customerServiceRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.customerServiceRetailGoldLayer?.facts || []);
        } else if (domainId === 'digital-retail') {
          const comprehensive = await import("@/lib/retail/digital-retail-comprehensive");
          setBronzeTables(comprehensive.digitalRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.digitalRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.digitalRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.digitalRetailGoldLayer?.facts || []);
        } else if (domainId === 'fraud-retail') {
          const comprehensive = await import("@/lib/retail/fraud-retail-comprehensive");
          setBronzeTables(comprehensive.fraudRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.fraudRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.fraudRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.fraudRetailGoldLayer?.facts || []);
        } else if (domainId === 'insurance-retail') {
          const comprehensive = await import("@/lib/retail/insurance-retail-comprehensive");
          setBronzeTables(comprehensive.insuranceRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.insuranceRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.insuranceRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.insuranceRetailGoldLayer?.facts || []);
        } else if (domainId === 'investment-retail') {
          const comprehensive = await import("@/lib/retail/investment-retail-comprehensive");
          setBronzeTables(comprehensive.investmentRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.investmentRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.investmentRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.investmentRetailGoldLayer?.facts || []);
        } else if (domainId === 'open-banking-retail') {
          const comprehensive = await import("@/lib/retail/open-banking-retail-comprehensive");
          setBronzeTables(comprehensive.openBankingRetailBronzeLayer?.tables || []);
          setSilverTables(comprehensive.openBankingRetailSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.openBankingRetailGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.openBankingRetailGoldLayer?.facts || []);
        } else if (domainId === 'risk-commercial') {
          const comprehensive = await import("@/lib/commercial/risk-commercial-comprehensive");
          setBronzeTables(comprehensive.riskCommercialBronzeLayer?.tables || []);
          setSilverTables(comprehensive.riskCommercialSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.riskCommercialGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.riskCommercialGoldLayer?.facts || []);
        } else if (domainId === 'compliance-commercial') {
          const comprehensive = await import("@/lib/commercial/compliance-commercial-comprehensive");
          setBronzeTables(comprehensive.complianceCommercialBronzeLayer?.tables || []);
          setSilverTables(comprehensive.complianceCommercialSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.complianceCommercialGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.complianceCommercialGoldLayer?.facts || []);
        } else if (domainId === 'mortgages') {
          const comprehensive = await import("@/lib/mortgage-comprehensive");
          setBronzeTables(comprehensive.mortgageBronzeLayer?.tables || []);
          setSilverTables(comprehensive.mortgageSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.mortgageGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.mortgageGoldLayer?.facts || []);
        } else if (domainId === 'loans') {
          const comprehensive = await import("@/lib/loans-comprehensive");
          setBronzeTables(comprehensive.loansBronzeLayer?.tables || []);
          setSilverTables(comprehensive.loansSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.loansGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.loansGoldLayer?.facts || []);
        } else if (domainId === 'deposits') {
          const comprehensive = await import("@/lib/deposits-comprehensive");
          setBronzeTables(comprehensive.depositsBronzeLayer?.tables || []);
          setSilverTables(comprehensive.depositsSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.depositsGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.depositsGoldLayer?.facts || []);
        } else if (domainId === 'credit-cards') {
          const comprehensive = await import("@/lib/creditcards-comprehensive");
          setBronzeTables(comprehensive.creditCardsBronzeLayer?.tables || []);
          setSilverTables(comprehensive.creditCardsSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.creditCardsGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.creditCardsGoldLayer?.facts || []);
        } else if (domainId === 'payments') {
          const comprehensive = await import("@/lib/payments-comprehensive");
          setBronzeTables(comprehensive.paymentsBronzeLayer?.tables || []);
          setSilverTables(comprehensive.paymentsSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.paymentsGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.paymentsGoldLayer?.facts || []);
        } else if (domainId === 'treasury') {
          const comprehensive = await import("@/lib/treasury-alm-comprehensive");
          setBronzeTables(comprehensive.treasuryBronzeLayer?.tables || []);
          setSilverTables(comprehensive.treasurySilverLayer?.tables || []);
          setGoldDimensions(comprehensive.treasuryGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.treasuryGoldLayer?.facts || []);
        } else if (domainId === 'fraud') {
          const comprehensive = await import("@/lib/fraud-comprehensive");
          setBronzeTables(comprehensive.fraudBronzeLayer?.tables || []);
          setSilverTables(comprehensive.fraudSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.fraudGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.fraudGoldLayer?.facts || []);
        } else if (domainId === 'wealth') {
          const comprehensive = await import("@/lib/wealth-comprehensive");
          setBronzeTables(comprehensive.wealthBronzeLayer?.tables || []);
          setSilverTables(comprehensive.wealthSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.wealthGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.wealthGoldLayer?.facts || []);
        } else if (domainId === 'fx') {
          const comprehensive = await import("@/lib/fx-comprehensive");
          setBronzeTables(comprehensive.fxBronzeLayer?.tables || []);
          setSilverTables(comprehensive.fxSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.fxGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.fxGoldLayer?.facts || []);
        } else if (domainId === 'compliance') {
          const comprehensive = await import("@/lib/compliance-aml-comprehensive");
          setBronzeTables(comprehensive.complianceBronzeLayer?.tables || []);
          setSilverTables(comprehensive.complianceSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.complianceGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.complianceGoldLayer?.facts || []);
        } else if (domainId === 'collections') {
          const comprehensive = await import("@/lib/collections-comprehensive");
          setBronzeTables(comprehensive.collectionsBronzeLayer?.tables || []);
          setSilverTables(comprehensive.collectionsSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.collectionsGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.collectionsGoldLayer?.facts || []);
        } else if (domainId === 'operations') {
          const comprehensive = await import("@/lib/operations-comprehensive");
          setBronzeTables(comprehensive.operationsBronzeLayer?.tables || []);
          setSilverTables(comprehensive.operationsSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.operationsGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.operationsGoldLayer?.facts || []);
        } else if (domainId === 'channels') {
          const comprehensive = await import("@/lib/channels-comprehensive");
          setBronzeTables(comprehensive.channelsBronzeLayer?.tables || []);
          setSilverTables(comprehensive.channelsSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.channelsGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.channelsGoldLayer?.facts || []);
        } else if (domainId === 'risk') {
          const comprehensive = await import("@/lib/risk-comprehensive");
          setBronzeTables(comprehensive.riskBronzeLayer?.tables || []);
          setSilverTables(comprehensive.riskSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.riskGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.riskGoldLayer?.facts || []);
        } else if (domainId === 'revenue') {
          const comprehensive = await import("@/lib/revenue-profitability-comprehensive");
          setBronzeTables(comprehensive.revenueBronzeLayer?.tables || []);
          setSilverTables(comprehensive.revenueSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.revenueGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.revenueGoldLayer?.facts || []);
        } else if (domainId === 'trade-finance') {
          const comprehensive = await import("@/lib/tradefinance-comprehensive");
          setBronzeTables(comprehensive.tradeFinanceBronzeLayer?.tables || []);
          setSilverTables(comprehensive.tradeFinanceSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.tradeFinanceGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.tradeFinanceGoldLayer?.facts || []);
        } else if (domainId === 'cash-management') {
          const comprehensive = await import("@/lib/cashmanagement-comprehensive");
          setBronzeTables(comprehensive.cashManagementBronzeLayer?.tables || []);
          setSilverTables(comprehensive.cashManagementSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.cashManagementGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.cashManagementGoldLayer?.facts || []);
        } else if (domainId === 'merchant-services') {
          const comprehensive = await import("@/lib/merchantservices-comprehensive");
          setBronzeTables(comprehensive.merchantServicesBronzeLayer?.tables || []);
          setSilverTables(comprehensive.merchantServicesSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.merchantServicesGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.merchantServicesGoldLayer?.facts || []);
        } else if (domainId === 'leasing') {
          const comprehensive = await import("@/lib/leasing-comprehensive");
          setBronzeTables(comprehensive.leasingBronzeLayer?.tables || []);
          setSilverTables(comprehensive.leasingSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.leasingGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.leasingGoldLayer?.facts || []);
        } else if (domainId === 'asset-based-lending') {
          const comprehensive = await import("@/lib/abl-comprehensive");
          setBronzeTables(comprehensive.ablBronzeLayer?.tables || []);
          setSilverTables(comprehensive.ablSilverLayer?.tables || []);
          setGoldDimensions(comprehensive.ablGoldLayer?.dimensions || []);
          setGoldFacts(comprehensive.ablGoldLayer?.facts || []);
        }
        console.log('[TableSpecsLoader] Successfully loaded specs');
      } catch (err) {
        console.error("[TableSpecsLoader] Error loading table specifications:", err);
        setError(err instanceof Error ? err.message : "Failed to load table specifications");
      } finally {
        setLoading(false);
      }
    };

    loadTableSpecs();
  }, [domainId]);

  const hasTableSpecs = bronzeTables.length > 0 || silverTables.length > 0 || goldDimensions.length > 0;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading table specifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-semibold mb-2">Error Loading Table Specifications</p>
        <p className="text-sm">{error}</p>
        <p className="text-sm mt-4 text-muted-foreground">
          Please try refreshing the page. If the problem persists, check the browser console for details.
        </p>
      </div>
    );
  }

  if (!hasTableSpecs) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-semibold mb-2">Complete table specifications coming soon</p>
        <p className="text-sm">
          Detailed Bronze, Silver, and Gold layer table schemas with full column definitions will be available for this domain.
        </p>
        <p className="text-sm mt-2 text-primary">
          Currently available for: All Commercial Banking domains (Customer, Loans, Deposits, Payments, Treasury, Trade Finance, Merchant Services, ABL, Leasing, Risk, Compliance), All Retail Banking domains (Customer, Deposits, Loans, Cards, Payments, Branch, Digital, Investment, Insurance, Collections, Customer Service, Marketing, Sales, Fraud, Compliance, Open Banking), and Enterprise domains (Customer Core, Mortgages, Loans, Deposits, Credit Cards, Payments, Treasury, Fraud, Wealth, FX, Compliance, Collections, Operations, Channels, Risk, Revenue, Trade Finance, Cash Management, Merchant Services, Leasing, Asset-Based Lending)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-900">{bronzeTables.length}</div>
            <div className="text-sm text-amber-700">Bronze Tables</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-900">{silverTables.length}</div>
            <div className="text-sm text-blue-700">Silver Tables</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-900">{goldDimensions.length}</div>
            <div className="text-sm text-yellow-700">Gold Dimensions</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-900">{goldFacts.length}</div>
            <div className="text-sm text-purple-700">Gold Facts</div>
          </CardContent>
        </Card>
      </div>

      {/* Bronze Layer */}
      {bronzeTables.length > 0 && (
        <TableSchemaViewer
          tables={bronzeTables}
          layerName="Bronze"
          layerColor="text-amber-600"
          layerIcon={<Database className="h-6 w-6 text-amber-600" />}
          domainName={domain.name}
        />
      )}

      {/* Silver Layer */}
      {silverTables.length > 0 && (
        <TableSchemaViewer
          tables={silverTables}
          layerName="Silver"
          layerColor="text-blue-600"
          layerIcon={<GitBranch className="h-6 w-6 text-blue-600" />}
          domainName={domain.name}
        />
      )}

      {/* Gold Layer - Dimensions */}
      {goldDimensions.length > 0 && (
        <TableSchemaViewer
          tables={goldDimensions}
          layerName="Gold - Dimensions"
          layerColor="text-yellow-600"
          layerIcon={<Table2 className="h-6 w-6 text-yellow-600" />}
          domainName={domain.name}
        />
      )}

      {/* Gold Layer - Facts */}
      {goldFacts.length > 0 && (
        <TableSchemaViewer
          tables={goldFacts}
          layerName="Gold - Facts"
          layerColor="text-purple-600"
          layerIcon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          domainName={domain.name}
        />
      )}
    </div>
  );
}
