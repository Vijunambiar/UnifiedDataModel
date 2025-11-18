// Deposits Domain - COMPLETE Source to Target Mapping (STTM) - 100% Coverage
// All tables from STTM Excel file (10 CORE_DEPOSIT tables, 241 columns)

export interface ColumnMapping {
  sourceSystem: string;
  sourceTable: string;
  sourceColumn: string;
  bronzeSchema: string;
  bronzeTable: string;
  bronzeColumn: string;
  silverSchema: string;
  silverTable: string;
  silverColumn: string;
  goldSchema: string;
  goldTable: string;
  goldColumn: string | null;
  dataType: string;
  businessLogic: string;
  businessMeaning: string;
  mappingType?: "Direct" | "Derived" | "System" | "SCD2";
}

// Import all new individual table mappings
import { dimDepositMappings } from "./sttm-dim-deposit";
import { dimAccountMappings } from "./sttm-dim-account";
import { fctDepositCertificateTransactionMappings } from "./sttm-fct-deposit-certificate-transaction";
import { fctDepositDailyBalanceMappings } from "./sttm-fct-deposit-daily-balance";
import { fctDepositAccountTransactionMappings } from "./sttm-fct-deposit-account-transaction";
import { fctDepositHoldTransactionMappings } from "./sttm-fct-deposit-hold-transaction";
import { fctDepositMaintenanceTransactionMappings } from "./sttm-fct-deposit-maintenance-transaction";
import { fctDepositStopTransactionMappings } from "./sttm-fct-deposit-stop-transaction";

// ============================================================================
// COMBINE ALL DEPOSITS STTM MAPPINGS - 100% Coverage (241 columns)
// ============================================================================
export const depositsSTTMMapping_Complete: ColumnMapping[] = [
  ...dimDepositMappings,                          // 72 columns
  ...dimAccountMappings,                          // 37 columns
  ...fctDepositCertificateTransactionMappings,    // 24 columns
  ...fctDepositDailyBalanceMappings,              // 21 columns
  ...fctDepositAccountTransactionMappings,        // 26 columns
  ...fctDepositHoldTransactionMappings,           // 21 columns
  ...fctDepositMaintenanceTransactionMappings,    // 15 columns
  ...fctDepositStopTransactionMappings,           // 25 columns
];

export const depositsSTTMGaps_Complete: ColumnMapping[] = [];

export const depositsTableCoverage_Complete = [
  {
    fisTable: "DIM_DEPOSIT",
    columnCount: 72,
    mappedCount: 72,
    coverage: "100%",
    businessKey: "ACCOUNT_NUMBER",
    silverTable: "DIM_DEPOSIT",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "DIM_ACCOUNT",
    columnCount: 37,
    mappedCount: 37,
    coverage: "100%",
    businessKey: "ACCOUNT_NUMBER",
    silverTable: "DIM_ACCOUNT",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    columnCount: 24,
    mappedCount: 24,
    coverage: "100%",
    businessKey: "ACCOUNT_NUMBER, CERTIFICATE_NUMBER",
    silverTable: "FCT_DEPOSIT_CERTIFICATE_TRANSACTION",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "FCT_DEPOSIT_DAILY_BALANCE",
    columnCount: 21,
    mappedCount: 21,
    coverage: "100%",
    businessKey: "ACCOUNT_NUMBER, BALANCE_DATE",
    silverTable: "FCT_DEPOSIT_DAILY_BALANCE",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
    columnCount: 26,
    mappedCount: 26,
    coverage: "100%",
    businessKey: "ACCOUNT_NUMBER, TRANSACTION_ID",
    silverTable: "FCT_DEPOSIT_ACCOUNT_TRANSACTION",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "FCT_DEPOSIT_HOLD_TRANSACTION",
    columnCount: 21,
    mappedCount: 21,
    coverage: "100%",
    businessKey: "ACCOUNT_NUMBER, HOLD_ID",
    silverTable: "FCT_DEPOSIT_HOLD_TRANSACTION",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
    columnCount: 15,
    mappedCount: 15,
    coverage: "100%",
    businessKey: "ACCOUNT_NUMBER, TRANSACTION_DATE",
    silverTable: "FCT_DEPOSIT_MAINTENANCE_TRANSACTION",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "FCT_DEPOSIT_STOP_TRANSACTION",
    columnCount: 25,
    mappedCount: 25,
    coverage: "100%",
    businessKey: "ACCOUNT_NUMBER, STOP_PAYMENT_ID",
    silverTable: "FCT_DEPOSIT_STOP_TRANSACTION",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
];

export default depositsSTTMMapping_Complete;
