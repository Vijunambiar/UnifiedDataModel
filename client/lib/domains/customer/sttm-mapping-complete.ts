// Customer Domain - COMPLETE Source to Target Mapping (STTM) - 100% Coverage
// Maps FIS-ADS source tables → Bronze → Silver → Gold
// All 18 tables from STTM Excel file (8 CORE_CUSTOMERS tables)

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
import { brgCustToAcctRelationship } from "./sttm-mapping-full-excel";
import { dimCustomerDemographyMappings } from "./sttm-dim-customer-demography";
import { dimCustomerIdentifierMappings } from "./sttm-dim-customer-identifier";
import { dimCustomerEmailMappings } from "./sttm-dim-customer-email";
import { dimCustomerNameMappings } from "./sttm-dim-customer-name";
import { dimCustomerContactMappings } from "./sttm-dim-customer-contact";
import { dimCustomerAddressMappings } from "./sttm-dim-customer-address";
import { dimCustomerAttributeMappings } from "./sttm-dim-customer-attribute";

// ============================================================================
// COMBINE ALL CUSTOMER STTM MAPPINGS - 100% Coverage (230 columns)
// ============================================================================
export const customerSTTMMapping_Complete: ColumnMapping[] = [
  ...brgCustToAcctRelationship,              // 19 columns
  ...dimCustomerDemographyMappings,          // 20 columns
  ...dimCustomerIdentifierMappings,          // 32 columns
  ...dimCustomerEmailMappings,               // 14 columns
  ...dimCustomerNameMappings,                // 19 columns
  ...dimCustomerContactMappings,             // 18 columns
  ...dimCustomerAddressMappings,             // 24 columns
  ...dimCustomerAttributeMappings,           // 84 columns
];

// STTM gaps - empty with 100% coverage
export const customerSTTMGaps_Complete: ColumnMapping[] = [];

// Updated table coverage summary
export const customerTableCoverage_Complete = [
  {
    fisTable: "BRG_CUST_TO_ACCT_RELATIONSHIP",
    columnCount: 19,
    mappedCount: 19,
    coverage: "100%",
    businessKey: "CUSTOMER_NUMBER, ACCOUNT_NUMBER",
    silverTable: "BRG_CUST_TO_ACCT_RELATIONSHIP",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "DIM_CUSTOMER_DEMOGRAPHY",
    columnCount: 20,
    mappedCount: 20,
    coverage: "100%",
    businessKey: "CUSTOMER_NUMBER",
    silverTable: "DIM_CUSTOMER_DEMOGRAPHY",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "DIM_CUSTOMER_IDENTIFER",
    columnCount: 32,
    mappedCount: 32,
    coverage: "100%",
    businessKey: "CUSTOMER_NUMBER",
    silverTable: "DIM_CUSTOMER_IDENTIFER",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "DIM_CUSTOMER_EMAIL",
    columnCount: 14,
    mappedCount: 14,
    coverage: "100%",
    businessKey: "CUSTOMER_NUMBER",
    silverTable: "DIM_CUSTOMER_EMAIL",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "DIM_CUSTOMER_NAME",
    columnCount: 19,
    mappedCount: 19,
    coverage: "100%",
    businessKey: "CUSTOMER_NUMBER",
    silverTable: "DIM_CUSTOMER_NAME",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "DIM_CUSTOMER_CONTACT",
    columnCount: 18,
    mappedCount: 18,
    coverage: "100%",
    businessKey: "CUSTOMER_NUMBER",
    silverTable: "DIM_CUSTOMER_CONTACT",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "DIM_CUSTOMER_ADDRESS",
    columnCount: 24,
    mappedCount: 24,
    coverage: "100%",
    businessKey: "CUSTOMER_NUMBER",
    silverTable: "DIM_CUSTOMER_ADDRESS",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
  {
    fisTable: "DIM_CUSTOMER_ATTRIBUTE",
    columnCount: 84,
    mappedCount: 84,
    coverage: "100%",
    businessKey: "CUSTOMER_NUMBER",
    silverTable: "DIM_CUSTOMER_ATTRIBUTE",
    goldTable: "CUSTOMER_DEPOSIT_AGGR",
  },
];

export default customerSTTMMapping_Complete;
