# Gold Layer Aggregation Metrics - Semantic Layer Enhancement

## Summary

Added **18 sophisticated aggregation metrics** (6 per domain) to Customer, Deposits, and Transactions domains, incorporating advanced semantic layer attributes including window functions, percentile calculations, cohort analysis, and multi-dimensional aggregations.

**Total Metrics Per Domain**: 112 (up from 106)

## Semantic Layer Capabilities Implemented

### 1. **Window Functions**
- `LAG` and `LEAD` for period-over-period comparisons
- `ROW_NUMBER` and `RANK` for ranking and tiering
- `FIRST_VALUE` and `LAST_VALUE` for cohort analysis
- `SUM OVER`, `AVG OVER` for running totals and moving averages

### 2. **Percentile Calculations**
- `PERCENTILE_CONT` for continuous percentile distribution
- `NTILE` for quintile/decile bucketing
- Distribution analysis (P10, P25, P50, P75, P90, P95, P99)

### 3. **Moving Averages & Trend Analysis**
- 3-month, 7-day, and 12-month moving averages
- Standard deviation calculations for anomaly detection
- Trend indicators and variance analysis

### 4. **Cohort Analysis**
- Customer acquisition cohort tracking
- Retention rate calculations
- First transaction date cohorts
- Cohort age and maturity metrics

### 5. **Running Totals & Cumulative Metrics**
- Cumulative percentage calculations
- Pareto analysis (80/20 rule)
- Running sum window functions

### 6. **Multi-Dimensional Aggregations**
- Hierarchical grouping (product, channel, time)
- Cross-tabulation analysis
- Concentration and distribution metrics

---

## Customer Domain - New Aggregation Metrics

### CUST-AGG-001: Customer Balance Percentile Distribution
- **Type**: Semantic Segmentation
- **Aggregations**: `PERCENTILE_CONT` (P25, P50, P75, P90, P95)
- **Use Case**: Customer tier assignment and wealth segmentation
- **SQL Features**: CTE, Percentile functions, Multi-table joins

### CUST-AGG-002: Customer Cohort Retention Analysis
- **Type**: Cohort Analysis
- **Aggregations**: `COUNT`, `AVG OVER`, Window partitioning
- **Use Case**: Month-over-month retention by acquisition cohort
- **SQL Features**: `DATE_TRUNC`, `DATEDIFF`, Window functions with partition

### CUST-AGG-003: Customer Lifetime Value Ranking with Running Total
- **Type**: Pareto Analysis
- **Aggregations**: `ROW_NUMBER`, `SUM OVER`, Running totals
- **Use Case**: Top customer identification and revenue concentration
- **SQL Features**: Window frames (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)

### CUST-AGG-004: Customer Activity Trend - 3-Month Moving Average
- **Type**: Time Series Analysis
- **Aggregations**: `AVG OVER`, `LAG`, Moving windows
- **Use Case**: Activity trend detection and MoM growth tracking
- **SQL Features**: Rolling windows (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)

### CUST-AGG-005: Customer RFM Segmentation Score
- **Type**: Behavioral Segmentation
- **Aggregations**: `NTILE` quintile scoring
- **Use Case**: Marketing segmentation (Champions, Loyal, At-Risk, Lost)
- **SQL Features**: Multi-dimensional scoring with NTILE

### CUST-AGG-006: Customer Product Affinity Matrix
- **Type**: Cross-Sell Analysis
- **Aggregations**: Product category aggregations, Penetration rates
- **Use Case**: Cross-sell opportunity identification
- **SQL Features**: CASE-based categorization, Market saturation analysis

---

## Deposits Domain - New Aggregation Metrics

### DEP-AGG-001: Deposit Balance Distribution by Percentile
- **Type**: Statistical Distribution
- **Aggregations**: `PERCENTILE_CONT` (P10-P99), `STDDEV`
- **Use Case**: Balance distribution and outlier detection
- **SQL Features**: Full percentile spectrum with standard deviation

### DEP-AGG-002: Deposit Growth Rate - YoY with Seasonality Adjustment
- **Type**: Time Series Decomposition
- **Aggregations**: `LAG`, 12-month moving average, Seasonal factors
- **Use Case**: Growth trending with seasonal adjustment
- **SQL Features**: Seasonal index calculation, YoY comparison with LAG

### DEP-AGG-003: Account Maturity Ladder - Time-Based Aggregation
- **Type**: Liquidity Gap Analysis
- **Aggregations**: Time bucket aggregation, Weighted average maturity
- **Use Case**: Asset-liability management and liquidity planning
- **SQL Features**: CASE-based bucketing, Weighted calculations

### DEP-AGG-004: Deposit Flow Analysis - Inflows vs Outflows
- **Type**: Cash Flow Analysis
- **Aggregations**: `SUM OVER` for rolling net flows, 7-day and 30-day windows
- **Use Case**: Liquidity monitoring and flow trend detection
- **SQL Features**: Multiple rolling window calculations in single query

### DEP-AGG-005: Customer Deposit Concentration - Top N Analysis
- **Type**: Concentration Risk
- **Aggregations**: `ROW_NUMBER`, Running sum, Cumulative percentages
- **Use Case**: Regulatory concentration limits and risk management
- **SQL Features**: Top N ranking with Pareto analysis

### DEP-AGG-006: Interest Rate Sensitivity Analysis by Product
- **Type**: Elasticity Analysis
- **Aggregations**: `LAG` for rate changes, Beta coefficient calculation
- **Use Case**: Pricing optimization and rate sensitivity
- **SQL Features**: Correlation analysis using window functions

---

## Transactions Domain - New Aggregation Metrics

### TXN-AGG-001: Transaction Amount Percentile Distribution by Channel
- **Type**: Channel Behavior Analysis
- **Aggregations**: `PERCENTILE_CONT` (P25-P99), `STDDEV`
- **Use Case**: Fraud detection and channel-specific patterns
- **SQL Features**: Grouped percentile analysis by dimension

### TXN-AGG-002: Transaction Velocity Analysis with Moving Windows
- **Type**: Velocity-Based Fraud Detection
- **Aggregations**: `COUNT OVER` with 1hr, 24hr, 7-day RANGE windows
- **Use Case**: Real-time fraud detection and velocity limits
- **SQL Features**: RANGE window frames for time-based velocity

### TXN-AGG-003: Transaction Success Rate Trend - 7-Day Moving Average
- **Type**: Performance Monitoring
- **Aggregations**: `AVG OVER`, `STDDEV OVER`, `LAG`
- **Use Case**: SLA monitoring and anomaly detection
- **SQL Features**: Statistical control limits using 2-sigma bands

### TXN-AGG-004: Transaction Cohort Analysis - First Transaction Date
- **Type**: Customer Lifecycle Analysis
- **Aggregations**: `FIRST_VALUE`, Window partitioning by cohort
- **Use Case**: Customer retention and behavior evolution
- **SQL Features**: Cohort retention with FIRST_VALUE baseline

### TXN-AGG-005: Hourly Transaction Volume with Peak Detection
- **Type**: Capacity Planning
- **Aggregations**: `MAX OVER`, `PERCENTILE_CONT`, `STDDEV OVER`
- **Use Case**: Infrastructure scaling and peak hour identification
- **SQL Features**: Multi-dimensional time analysis (hour, day of week)

### TXN-AGG-006: Transaction Processing Time Percentiles by Type
- **Type**: SLA Performance Monitoring
- **Aggregations**: `PERCENTILE_CONT` (P50-P99) for latency distribution
- **Use Case**: Performance rating and SLA compliance
- **SQL Features**: Latency distribution with performance thresholds

---

## Key SQL Patterns and Techniques

### 1. Common Table Expressions (CTEs)
All aggregation metrics use CTEs for:
- Data preparation and filtering
- Intermediate calculations
- Improved readability and maintainability

### 2. Window Function Variants

#### Frame Types:
```sql
-- Row-based frames
ROWS BETWEEN 2 PRECEDING AND CURRENT ROW  -- 3-period moving average
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -- Running total

-- Range-based frames
RANGE BETWEEN INTERVAL '1' HOUR PRECEDING AND CURRENT ROW  -- Time-based velocity
```

#### Partition Types:
```sql
PARTITION BY customer_number  -- Customer-level calculations
PARTITION BY product_type     -- Product-level aggregations
PARTITION BY cohort_month     -- Cohort-based analysis
```

### 3. Percentile Functions
```sql
-- Continuous percentiles (interpolated)
PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value)

-- Discrete percentiles (actual values)
PERCENTILE_DISC(0.95) WITHIN GROUP (ORDER BY value)

-- Quintile bucketing
NTILE(5) OVER (ORDER BY value DESC)
```

### 4. Analytical Patterns

#### Period-over-Period Comparison:
```sql
LAG(value, 1) OVER (ORDER BY date)  -- Previous period
LAG(value, 12) OVER (ORDER BY month)  -- Year-ago period
```

#### Cumulative Analysis:
```sql
SUM(value) OVER (ORDER BY rank ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) / 
SUM(value) OVER () * 100  -- Cumulative percentage
```

#### Trend Detection:
```sql
CASE 
  WHEN current_value < (avg - 2*stddev) THEN 'Significant Degradation'
  WHEN current_value < (avg - stddev) THEN 'Below Average'
  ELSE 'Normal'
END
```

---

## Business Intelligence Use Cases

### 1. Customer Segmentation
- **RFM Analysis** (CUST-AGG-005): Segment customers by Recency, Frequency, Monetary
- **Balance Tiers** (CUST-AGG-001): Platinum/Gold/Silver/Bronze by percentile
- **Lifecycle Stages** (CUST-AGG-002): Cohort-based maturity segmentation

### 2. Risk Management
- **Concentration Risk** (DEP-AGG-005): Top 100 customer deposit concentration
- **Fraud Detection** (TXN-AGG-002): Velocity-based anomaly detection
- **Liquidity Risk** (DEP-AGG-003): Maturity ladder and gap analysis

### 3. Performance Monitoring
- **SLA Compliance** (TXN-AGG-006): P95/P99 processing time by channel
- **Success Rates** (TXN-AGG-003): Trend analysis with statistical controls
- **Capacity Planning** (TXN-AGG-005): Peak detection and utilization

### 4. Trend Analysis
- **Growth Trending** (DEP-AGG-002): YoY growth with seasonal adjustment
- **Activity Patterns** (CUST-AGG-004): 3-month moving averages
- **Flow Analysis** (DEP-AGG-004): Inflow/outflow trend detection

### 5. Revenue Optimization
- **Customer Value** (CUST-AGG-003): CLV ranking with Pareto analysis
- **Product Affinity** (CUST-AGG-006): Cross-sell opportunity identification
- **Rate Sensitivity** (DEP-AGG-006): Elasticity-based pricing optimization

---

## Data Quality & Completeness

### All Metrics Include:
✅ **Complete SQL Definitions** - Fully executable queries  
✅ **Source Table Mappings** - All dependencies documented  
✅ **Business Logic** - Clear explanation of calculation methodology  
✅ **Data Types** - Appropriate precision (DECIMAL, INTEGER, etc.)  
✅ **Units** - Clear measurement units (currency, percentage, count, etc.)  
✅ **Granularity** - Refresh frequency and reporting period  
✅ **Aggregation Method** - Primary aggregation type (SUM, AVG, COUNT, etc.)  
✅ **Owner** - Responsible team for metric governance  
✅ **SLA** - Latency, accuracy, and refresh requirements  
✅ **Related Metrics** - Cross-references to related KPIs  
✅ **Dependencies** - Source table and column dependencies  

---

## Implementation Notes

### Performance Considerations

1. **Window Functions**: Use appropriate partitioning to reduce memory footprint
2. **Percentile Calculations**: Consider materialization for frequently accessed percentiles
3. **CTEs**: Modern optimizers inline CTEs, but consider temp tables for complex multi-stage aggregations
4. **Indexes**: Ensure indexes on partition keys (customer_number, transaction_date, account_type)

### Semantic Layer Integration

These metrics are designed to integrate with BI semantic layers:
- **Dimensions**: Time, Geography, Product, Customer Segment, Channel
- **Hierarchies**: Year → Quarter → Month → Day
- **Calculated Measures**: All metrics are pre-calculated for consistency
- **Drill-Down Paths**: Support for hierarchical navigation

### Extensibility

The pattern established can be extended to:
- Additional domains (Loans, Cards, Wealth)
- New time windows (hourly, quarterly aggregations)
- Additional percentiles (custom quantiles)
- More sophisticated ML-based metrics (propensity scores, churn predictions)

---

## Next Steps

### Recommended Enhancements:
1. **Materialized Views**: Create materialized views for daily/hourly refreshed aggregations
2. **Incremental Processing**: Implement incremental refresh logic for large-scale metrics
3. **Data Quality Checks**: Add validation rules for outlier detection
4. **Performance Tuning**: Optimize window function queries with appropriate indexes
5. **BI Tool Integration**: Expose metrics through semantic layer (Looker, Tableau, Power BI)

### Monitoring & Alerting:
- Set up alerts for metrics exceeding SLA thresholds
- Track query performance for slow-running aggregations
- Monitor data freshness and completeness

---

## Summary Statistics

| Domain | Total Metrics | New Aggregation Metrics | Window Functions | Percentile Metrics | Cohort Metrics |
|--------|--------------|------------------------|------------------|-------------------|----------------|
| Customer | 112 | 6 | 4 | 2 | 2 |
| Deposits | 112 | 6 | 5 | 1 | 0 |
| Transactions | 112 | 6 | 6 | 3 | 1 |
| **Total** | **336** | **18** | **15** | **6** | **3** |

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Data Engineering & Analytics Teams
