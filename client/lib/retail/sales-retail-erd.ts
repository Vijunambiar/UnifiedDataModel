import type { ERDEntity, ERDRelationship } from '../schema-types';

/**
 * SALES-RETAIL DOMAIN - ENTITY RELATIONSHIP DIAGRAM
 * 
 * Physical data model showing entities and relationships
 */

export const salesRetailERDEntities: ERDEntity[] = [
  // CORE SALES ENTITIES
  {
    name: 'Opportunity',
    tableName: 'bronze.retail_sales_opportunities',
    primaryKey: 'opportunity_id',
    attributes: [
      { name: 'opportunity_id', type: 'BIGINT', isPrimaryKey: true },
      { name: 'opportunity_name', type: 'STRING' },
      { name: 'account_id', type: 'BIGINT', isForeignKey: true },
      { name: 'lead_id', type: 'BIGINT', isForeignKey: true },
      { name: 'owner_id', type: 'BIGINT', isForeignKey: true },
      { name: 'sales_territory_id', type: 'BIGINT', isForeignKey: true },
      { name: 'stage', type: 'STRING' },
      { name: 'amount', type: 'DECIMAL(18,2)' },
      { name: 'probability', type: 'DECIMAL(5,2)' },
      { name: 'close_date', type: 'DATE' },
      { name: 'product_type', type: 'STRING' },
      { name: 'is_won', type: 'BOOLEAN' },
      { name: 'is_lost', type: 'BOOLEAN' },
      { name: 'created_date', type: 'DATE' },
    ],
  },
  
  {
    name: 'Lead',
    tableName: 'bronze.retail_sales_leads',
    primaryKey: 'lead_id',
    attributes: [
      { name: 'lead_id', type: 'BIGINT', isPrimaryKey: true },
      { name: 'full_name', type: 'STRING' },
      { name: 'email', type: 'STRING' },
      { name: 'phone', type: 'STRING' },
      { name: 'owner_id', type: 'BIGINT', isForeignKey: true },
      { name: 'sales_territory_id', type: 'BIGINT', isForeignKey: true },
      { name: 'lead_source', type: 'STRING' },
      { name: 'status', type: 'STRING' },
      { name: 'lead_score', type: 'INTEGER' },
      { name: 'product_interest', type: 'STRING' },
      { name: 'is_converted', type: 'BOOLEAN' },
      { name: 'converted_opportunity_id', type: 'BIGINT', isForeignKey: true },
      { name: 'created_date', type: 'DATE' },
    ],
  },
  
  {
    name: 'Sales Activity',
    tableName: 'bronze.retail_sales_activities',
    primaryKey: 'activity_id',
    attributes: [
      { name: 'activity_id', type: 'BIGINT', isPrimaryKey: true },
      { name: 'opportunity_id', type: 'BIGINT', isForeignKey: true },
      { name: 'lead_id', type: 'BIGINT', isForeignKey: true },
      { name: 'owner_id', type: 'BIGINT', isForeignKey: true },
      { name: 'activity_type', type: 'STRING' },
      { name: 'subject', type: 'STRING' },
      { name: 'activity_date', type: 'DATE' },
      { name: 'status', type: 'STRING' },
      { name: 'outcome', type: 'STRING' },
      { name: 'duration_minutes', type: 'INTEGER' },
    ],
  },
  
  {
    name: 'Quote',
    tableName: 'bronze.retail_sales_quotes',
    primaryKey: 'quote_id',
    attributes: [
      { name: 'quote_id', type: 'BIGINT', isPrimaryKey: true },
      { name: 'opportunity_id', type: 'BIGINT', isForeignKey: true },
      { name: 'account_id', type: 'BIGINT', isForeignKey: true },
      { name: 'owner_id', type: 'BIGINT', isForeignKey: true },
      { name: 'quote_number', type: 'STRING' },
      { name: 'status', type: 'STRING' },
      { name: 'total_amount', type: 'DECIMAL(18,2)' },
      { name: 'product_type', type: 'STRING' },
      { name: 'quoted_apr', type: 'DECIMAL(10,6)' },
      { name: 'sent_date', type: 'DATE' },
      { name: 'accepted_date', type: 'DATE' },
      { name: 'is_accepted', type: 'BOOLEAN' },
    ],
  },
  
  {
    name: 'Sales Rep',
    tableName: 'bronze.retail_sales_reps',
    primaryKey: 'sales_rep_id',
    attributes: [
      { name: 'sales_rep_id', type: 'BIGINT', isPrimaryKey: true },
      { name: 'employee_id', type: 'BIGINT' },
      { name: 'sales_rep_name', type: 'STRING' },
      { name: 'email', type: 'STRING' },
      { name: 'sales_team', type: 'STRING' },
      { name: 'sales_territory_id', type: 'BIGINT', isForeignKey: true },
      { name: 'manager_id', type: 'BIGINT', isForeignKey: true },
      { name: 'annual_quota', type: 'DECIMAL(18,2)' },
      { name: 'commission_rate', type: 'DECIMAL(5,2)' },
      { name: 'is_active', type: 'BOOLEAN' },
    ],
  },
  
  {
    name: 'Sales Territory',
    tableName: 'bronze.retail_sales_territories',
    primaryKey: 'territory_id',
    attributes: [
      { name: 'territory_id', type: 'BIGINT', isPrimaryKey: true },
      { name: 'territory_name', type: 'STRING' },
      { name: 'parent_territory_id', type: 'BIGINT', isForeignKey: true },
      { name: 'territory_level', type: 'STRING' },
      { name: 'region', type: 'STRING' },
      { name: 'states', type: 'STRING' },
      { name: 'is_active', type: 'BOOLEAN' },
    ],
  },
  
  {
    name: 'Commission',
    tableName: 'bronze.retail_sales_commissions',
    primaryKey: 'commission_id',
    attributes: [
      { name: 'commission_id', type: 'BIGINT', isPrimaryKey: true },
      { name: 'sales_rep_id', type: 'BIGINT', isForeignKey: true },
      { name: 'opportunity_id', type: 'BIGINT', isForeignKey: true },
      { name: 'commission_type', type: 'STRING' },
      { name: 'revenue_amount', type: 'DECIMAL(18,2)' },
      { name: 'commission_amount', type: 'DECIMAL(18,2)' },
      { name: 'commission_period', type: 'STRING' },
      { name: 'is_paid', type: 'BOOLEAN' },
      { name: 'payment_date', type: 'DATE' },
    ],
  },
  
  {
    name: 'Customer Referral',
    tableName: 'bronze.retail_customer_referrals',
    primaryKey: 'referral_id',
    attributes: [
      { name: 'referral_id', type: 'BIGINT', isPrimaryKey: true },
      { name: 'referrer_customer_id', type: 'BIGINT', isForeignKey: true },
      { name: 'referred_customer_id', type: 'BIGINT', isForeignKey: true },
      { name: 'lead_id', type: 'BIGINT', isForeignKey: true },
      { name: 'opportunity_id', type: 'BIGINT', isForeignKey: true },
      { name: 'referral_status', type: 'STRING' },
      { name: 'referral_date', type: 'DATE' },
      { name: 'conversion_date', type: 'DATE' },
      { name: 'referral_reward_amount', type: 'DECIMAL(18,2)' },
      { name: 'is_converted', type: 'BOOLEAN' },
    ],
  },
];

export const salesRetailERDRelationships: ERDRelationship[] = [
  // Lead → Opportunity
  {
    from: 'Lead',
    to: 'Opportunity',
    type: 'One-to-One',
    cardinality: '1:0..1',
    foreignKey: 'converted_opportunity_id',
    description: 'A lead can be converted to one opportunity',
  },
  
  // Opportunity → Quote (One-to-Many)
  {
    from: 'Opportunity',
    to: 'Quote',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'opportunity_id',
    description: 'An opportunity can have multiple quotes',
  },
  
  // Sales Rep → Opportunity (One-to-Many)
  {
    from: 'Sales Rep',
    to: 'Opportunity',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'owner_id',
    description: 'A sales rep owns multiple opportunities',
  },
  
  // Sales Rep → Lead (One-to-Many)
  {
    from: 'Sales Rep',
    to: 'Lead',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'owner_id',
    description: 'A sales rep owns multiple leads',
  },
  
  // Sales Territory → Sales Rep (One-to-Many)
  {
    from: 'Sales Territory',
    to: 'Sales Rep',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'sales_territory_id',
    description: 'A territory has multiple sales reps',
  },
  
  // Sales Territory → Opportunity (One-to-Many)
  {
    from: 'Sales Territory',
    to: 'Opportunity',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'sales_territory_id',
    description: 'A territory contains multiple opportunities',
  },
  
  // Sales Rep (Manager) → Sales Rep (Reports) (One-to-Many hierarchy)
  {
    from: 'Sales Rep',
    to: 'Sales Rep',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'manager_id',
    description: 'A sales manager has multiple direct reports',
  },
  
  // Territory (Parent) → Territory (Child) (One-to-Many hierarchy)
  {
    from: 'Sales Territory',
    to: 'Sales Territory',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'parent_territory_id',
    description: 'A parent territory contains child territories',
  },
  
  // Opportunity → Sales Activity (One-to-Many)
  {
    from: 'Opportunity',
    to: 'Sales Activity',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'opportunity_id',
    description: 'An opportunity has multiple sales activities',
  },
  
  // Lead → Sales Activity (One-to-Many)
  {
    from: 'Lead',
    to: 'Sales Activity',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'lead_id',
    description: 'A lead has multiple sales activities',
  },
  
  // Sales Rep → Sales Activity (One-to-Many)
  {
    from: 'Sales Rep',
    to: 'Sales Activity',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'owner_id',
    description: 'A sales rep performs multiple activities',
  },
  
  // Opportunity → Commission (One-to-Many)
  {
    from: 'Opportunity',
    to: 'Commission',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'opportunity_id',
    description: 'An opportunity generates commissions (direct, split, override)',
  },
  
  // Sales Rep → Commission (One-to-Many)
  {
    from: 'Sales Rep',
    to: 'Commission',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'sales_rep_id',
    description: 'A sales rep earns multiple commissions',
  },
  
  // Customer (Referrer) → Referral (One-to-Many)
  {
    from: 'Customer',
    to: 'Customer Referral',
    type: 'One-to-Many',
    cardinality: '1:N',
    foreignKey: 'referrer_customer_id',
    description: 'A customer can make multiple referrals',
  },
  
  // Referral → Lead (One-to-One)
  {
    from: 'Customer Referral',
    to: 'Lead',
    type: 'One-to-One',
    cardinality: '1:0..1',
    foreignKey: 'lead_id',
    description: 'A referral creates a lead',
  },
  
  // Referral → Opportunity (One-to-One)
  {
    from: 'Customer Referral',
    to: 'Opportunity',
    type: 'One-to-One',
    cardinality: '1:0..1',
    foreignKey: 'opportunity_id',
    description: 'A referral can result in an opportunity',
  },
];

export const salesRetailERD = {
  domain: 'Sales-Retail',
  entities: salesRetailERDEntities,
  relationships: salesRetailERDRelationships,
  totalEntities: 8,
  totalRelationships: 16,
  description: 'Physical data model for retail banking sales domain',
};
