/**
 * BRANCH-RETAIL DOMAIN - SEMANTIC LAYER
 * Physical branch operations, staff management, and omnichannel customer interactions
 */

export const branchRetailSemanticLayer = {
  domainId: "branch-retail",
  domainName: "Branch Retail",
  
  measures: [
    {
      name: "total_branches",
      displayName: "Total Branches",
      formula: "COUNT(DISTINCT branch_id)",
      description: "Total number of active retail branches in the network",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Network"
    },
    {
      name: "total_branch_transactions",
      displayName: "Total Branch Transactions",
      formula: "COUNT(transaction_id)",
      description: "Total number of transactions processed at branches",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Activity"
    },
    {
      name: "total_transaction_value",
      displayName: "Total Transaction Value",
      formula: "SUM(transaction_amount)",
      description: "Total value of all branch transactions",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Volume"
    },
    {
      name: "avg_transaction_value",
      displayName: "Average Transaction Value",
      formula: "AVG(transaction_amount)",
      description: "Average value per branch transaction",
      dataType: "Currency",
      aggregation: "AVG",
      format: "$#,##0.00",
      category: "Quality"
    },
    {
      name: "total_customer_visits",
      displayName: "Total Customer Visits",
      formula: "COUNT(DISTINCT visit_id)",
      description: "Total number of customer visits to branches",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Activity"
    },
    {
      name: "total_staff_count",
      displayName: "Total Staff Count",
      formula: "COUNT(DISTINCT employee_id)",
      description: "Total number of branch employees",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Resources"
    },
    {
      name: "avg_wait_time_minutes",
      displayName: "Average Wait Time",
      formula: "AVG(wait_time_minutes)",
      description: "Average customer wait time in minutes",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0.0",
      category: "Service Quality"
    },
    {
      name: "avg_service_time_minutes",
      displayName: "Average Service Time",
      formula: "AVG(service_time_minutes)",
      description: "Average time to complete a transaction",
      dataType: "Number",
      aggregation: "AVG",
      format: "#,##0.0",
      category: "Service Quality"
    },
    {
      name: "customer_satisfaction_score",
      displayName: "Customer Satisfaction Score",
      formula: "AVG(satisfaction_rating)",
      description: "Average customer satisfaction rating (1-5 scale)",
      dataType: "Decimal",
      aggregation: "AVG",
      format: "0.00",
      category: "Service Quality"
    },
    {
      name: "branch_utilization_rate",
      displayName: "Branch Utilization Rate",
      formula: "(actual_visits / capacity_visits) * 100",
      description: "Percentage of branch capacity utilized",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Efficiency"
    },
    {
      name: "cost_per_transaction",
      displayName: "Cost Per Transaction",
      formula: "total_operating_cost / total_transactions",
      description: "Average cost to process one branch transaction",
      dataType: "Currency",
      aggregation: "CALCULATED",
      format: "$#,##0.00",
      category: "Efficiency"
    },
    {
      name: "digital_adoption_rate",
      displayName: "Digital Adoption Rate",
      formula: "(digital_transactions / total_transactions) * 100",
      description: "Percentage of transactions completed via digital channels",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Digital"
    },
    {
      name: "cross_sell_ratio",
      displayName: "Cross-Sell Ratio",
      formula: "products_sold / customer_visits",
      description: "Average number of products sold per customer visit",
      dataType: "Decimal",
      aggregation: "CALCULATED",
      format: "0.00",
      category: "Sales"
    },
    {
      name: "appointment_show_rate",
      displayName: "Appointment Show Rate",
      formula: "(appointments_kept / appointments_scheduled) * 100",
      description: "Percentage of scheduled appointments that were kept",
      dataType: "Percentage",
      aggregation: "CALCULATED",
      format: "0.00%",
      category: "Service Quality"
    },
    {
      name: "teller_transactions_per_hour",
      displayName: "Teller Transactions Per Hour",
      formula: "total_transactions / total_hours_worked",
      description: "Average number of transactions processed per teller hour",
      dataType: "Number",
      aggregation: "CALCULATED",
      format: "#,##0.0",
      category: "Productivity"
    },
    {
      name: "branch_revenue",
      displayName: "Branch Revenue",
      formula: "SUM(fee_income + interest_income + commission_income)",
      description: "Total revenue generated by branch",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Revenue"
    },
    {
      name: "atm_transaction_count",
      displayName: "ATM Transaction Count",
      formula: "COUNT(atm_transaction_id)",
      description: "Total number of ATM transactions",
      dataType: "Number",
      aggregation: "COUNT",
      format: "#,##0",
      category: "Self-Service"
    },
    {
      name: "mobile_deposit_volume",
      displayName: "Mobile Deposit Volume",
      formula: "SUM(mobile_deposit_amount)",
      description: "Total value of mobile check deposits",
      dataType: "Currency",
      aggregation: "SUM",
      format: "$#,##0.00",
      category: "Digital"
    }
  ],

  attributes: [
    {
      name: "branch_type",
      displayName: "Branch Type",
      field: "branch_type",
      dataType: "String",
      description: "Type of branch location",
      lookup: "dim_branch_type"
    },
    {
      name: "branch_region",
      displayName: "Branch Region",
      field: "region_name",
      dataType: "String",
      description: "Geographic region of branch",
      lookup: "dim_geography"
    },
    {
      name: "branch_size",
      displayName: "Branch Size",
      field: "size_category",
      dataType: "String",
      description: "Branch size classification (Small, Medium, Large)",
      lookup: "dim_branch_size"
    },
    {
      name: "service_type",
      displayName: "Service Type",
      field: "service_type",
      dataType: "String",
      description: "Type of service provided (Teller, Advisory, Sales)",
      lookup: "dim_service_type"
    },
    {
      name: "transaction_channel",
      displayName: "Transaction Channel",
      field: "channel_name",
      dataType: "String",
      description: "Channel used for transaction (Branch, ATM, Mobile)",
      lookup: "dim_channel"
    },
    {
      name: "employee_role",
      displayName: "Employee Role",
      field: "role_name",
      dataType: "String",
      description: "Role of branch employee (Teller, Manager, Advisor)",
      lookup: "dim_employee_role"
    },
    {
      name: "branch_status",
      displayName: "Branch Status",
      field: "CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END",
      dataType: "String",
      description: "Current operating status of branch"
    },
    {
      name: "urban_rural",
      displayName: "Urban/Rural",
      field: "location_type",
      dataType: "String",
      description: "Urban or Rural location classification"
    },
    {
      name: "day_of_week",
      displayName: "Day of Week",
      field: "DAYNAME(transaction_date)",
      dataType: "String",
      description: "Day of week for transaction"
    },
    {
      name: "time_of_day",
      displayName: "Time of Day",
      field: "CASE WHEN HOUR(transaction_time) < 12 THEN 'Morning' WHEN HOUR(transaction_time) < 17 THEN 'Afternoon' ELSE 'Evening' END",
      dataType: "String",
      description: "Time period of transaction"
    }
  ],

  hierarchies: [
    {
      name: "Geographic Hierarchy",
      levels: ["Country", "Region", "State", "City", "Branch"],
      description: "Branch location drill-down from country to individual branch"
    },
    {
      name: "Time Hierarchy",
      levels: ["Year", "Quarter", "Month", "Week", "Day", "Hour"],
      description: "Temporal analysis from year to hourly patterns"
    },
    {
      name: "Branch Hierarchy",
      levels: ["Region", "District", "Branch Manager", "Branch"],
      description: "Organizational structure of branch network"
    },
    {
      name: "Service Hierarchy",
      levels: ["Service Category", "Service Type", "Service Detail"],
      description: "Classification of services offered at branches"
    },
    {
      name: "Employee Hierarchy",
      levels: ["Branch Manager", "Department", "Role", "Employee"],
      description: "Staff organizational structure"
    }
  ],

  folders: [
    {
      name: "Branch Network Overview",
      measures: ["total_branches", "total_staff_count", "branch_revenue"],
      description: "High-level metrics for branch network performance",
      icon: "🏢"
    },
    {
      name: "Transaction Activity",
      measures: ["total_branch_transactions", "total_transaction_value", "avg_transaction_value", "atm_transaction_count"],
      description: "Branch transaction volumes and values",
      icon: "💰"
    },
    {
      name: "Customer Experience",
      measures: ["total_customer_visits", "avg_wait_time_minutes", "avg_service_time_minutes", "customer_satisfaction_score"],
      description: "Customer service quality and satisfaction metrics",
      icon: "😊"
    },
    {
      name: "Operational Efficiency",
      measures: ["branch_utilization_rate", "cost_per_transaction", "teller_transactions_per_hour"],
      description: "Branch operational efficiency and productivity",
      icon: "⚡"
    },
    {
      name: "Digital & Omnichannel",
      measures: ["digital_adoption_rate", "mobile_deposit_volume", "atm_transaction_count"],
      description: "Digital channel usage and adoption",
      icon: "📱"
    },
    {
      name: "Sales & Revenue",
      measures: ["branch_revenue", "cross_sell_ratio", "appointment_show_rate"],
      description: "Branch sales performance and revenue generation",
      icon: "📊"
    }
  ]
};

export default branchRetailSemanticLayer;
