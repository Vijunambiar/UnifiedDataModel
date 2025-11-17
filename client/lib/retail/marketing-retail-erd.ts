/**
 * MARKETING-RETAIL ERD DEFINITIONS
 * 
 * Logical and Physical ERD definitions based on Fivetran-documented schemas
 * Sources: Fivetran Google Ads, Facebook Ads, HubSpot, Salesforce Marketing Cloud, GA4, Segment schemas
 */

// LOGICAL ERD - Conceptual Model
export const marketingRetailLogicalERD = {
  entities: [
    {
      name: 'Campaign',
      type: 'core',
      description: 'Marketing campaign master entity',
      attributes: [
        { name: 'campaign_id', type: 'STRING', isPrimaryKey: true },
        { name: 'campaign_name', type: 'STRING' },
        { name: 'campaign_type', type: 'STRING' },
        { name: 'campaign_status', type: 'STRING' },
        { name: 'start_date', type: 'DATE' },
        { name: 'end_date', type: 'DATE' },
        { name: 'budget_allocated', type: 'DECIMAL(18,2)' },
        { name: 'utm_source', type: 'STRING' },
        { name: 'utm_medium', type: 'STRING' },
        { name: 'utm_campaign', type: 'STRING' },
      ],
    },
    {
      name: 'Lead',
      type: 'core',
      description: 'Marketing qualified leads',
      attributes: [
        { name: 'lead_id', type: 'STRING', isPrimaryKey: true },
        { name: 'customer_id', type: 'STRING', isForeignKey: true },
        { name: 'lead_source', type: 'STRING' },
        { name: 'lead_score', type: 'INTEGER' },
        { name: 'lead_status', type: 'STRING' },
        { name: 'submission_timestamp', type: 'TIMESTAMP' },
      ],
    },
    {
      name: 'Email Send',
      type: 'event',
      description: 'Email delivery events',
      attributes: [
        { name: 'message_id', type: 'STRING', isPrimaryKey: true },
        { name: 'campaign_id', type: 'STRING', isForeignKey: true },
        { name: 'customer_id', type: 'STRING', isForeignKey: true },
        { name: 'email_address', type: 'STRING' },
        { name: 'send_timestamp', type: 'TIMESTAMP' },
        { name: 'send_status', type: 'STRING' },
      ],
    },
    {
      name: 'Customer Segment',
      type: 'core',
      description: 'Customer segmentation',
      attributes: [
        { name: 'segment_id', type: 'STRING', isPrimaryKey: true },
        { name: 'segment_name', type: 'STRING' },
        { name: 'segment_type', type: 'STRING' },
        { name: 'rfm_segment', type: 'STRING' },
      ],
    },
    {
      name: 'Offer',
      type: 'core',
      description: 'Marketing offers and promotions',
      attributes: [
        { name: 'offer_id', type: 'STRING', isPrimaryKey: true },
        { name: 'offer_name', type: 'STRING' },
        { name: 'offer_type', type: 'STRING' },
        { name: 'discount_percentage', type: 'DECIMAL(5,2)' },
        { name: 'start_date', type: 'DATE' },
        { name: 'end_date', type: 'DATE' },
      ],
    },
    {
      name: 'Attribution Touchpoint',
      type: 'event',
      description: 'Marketing attribution touchpoints',
      attributes: [
        { name: 'event_id', type: 'STRING', isPrimaryKey: true },
        { name: 'customer_id', type: 'STRING', isForeignKey: true },
        { name: 'campaign_id', type: 'STRING', isForeignKey: true },
        { name: 'touchpoint_timestamp', type: 'TIMESTAMP' },
        { name: 'touchpoint_type', type: 'STRING' },
        { name: 'channel', type: 'STRING' },
      ],
    },
  ],
  relationships: [
    {
      from: 'Email Send',
      to: 'Campaign',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'campaign_id',
    },
    {
      from: 'Email Send',
      to: 'Customer',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'customer_id',
    },
    {
      from: 'Lead',
      to: 'Customer',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'customer_id',
    },
    {
      from: 'Attribution Touchpoint',
      to: 'Campaign',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'campaign_id',
    },
    {
      from: 'Attribution Touchpoint',
      to: 'Customer',
      type: 'many-to-one',
      cardinality: 'N:1',
      foreignKey: 'customer_id',
    },
  ],
};

// PHYSICAL ERD - Implementation Model (Bronze Layer)
export const marketingRetailPhysicalERD = {
  tables: [
    // Google Ads (Fivetran Schema)
    {
      name: 'bronze.google_ads_campaign_stats',
      description: 'Google Ads campaign performance - Fivetran schema',
      schema: {
        // Standard Fivetran fields
        _fivetran_id: 'STRING PRIMARY KEY',
        _fivetran_synced: 'TIMESTAMP',
        
        // Google Ads dimensions (Fivetran standard)
        date: 'DATE',
        customer_id: 'STRING',
        campaign_id: 'STRING',
        campaign_name: 'STRING',
        campaign_status: 'STRING',
        
        // Google Ads metrics (Fivetran standard)
        impressions: 'BIGINT',
        clicks: 'BIGINT',
        cost_micros: 'BIGINT', // Cost in micros (millionths of currency)
        conversions: 'DECIMAL(10,2)',
        conversions_value: 'DECIMAL(18,2)',
        all_conversions: 'DECIMAL(10,2)',
        view_through_conversions: 'BIGINT',
        
        // Additional metrics
        average_cost: 'DECIMAL(10,2)',
        average_cpc: 'DECIMAL(10,2)',
        average_cpm: 'DECIMAL(10,2)',
        ctr: 'DECIMAL(8,6)',
        conversion_rate: 'DECIMAL(8,6)',
        cost_per_conversion: 'DECIMAL(10,2)',
      },
      primaryKey: '_fivetran_id',
      foreignKeys: [
        { column: 'customer_id', references: 'bronze.google_ads_account', referencedColumn: 'customer_id' },
        { column: 'campaign_id', references: 'bronze.google_ads_campaign', referencedColumn: 'id' },
      ],
    },
    {
      name: 'bronze.google_ads_ad_group_stats',
      description: 'Google Ads ad group performance - Fivetran schema',
      schema: {
        _fivetran_id: 'STRING PRIMARY KEY',
        _fivetran_synced: 'TIMESTAMP',
        date: 'DATE',
        customer_id: 'STRING',
        campaign_id: 'STRING',
        ad_group_id: 'STRING',
        ad_group_name: 'STRING',
        ad_group_status: 'STRING',
        impressions: 'BIGINT',
        clicks: 'BIGINT',
        cost_micros: 'BIGINT',
        conversions: 'DECIMAL(10,2)',
        average_cpc: 'DECIMAL(10,2)',
        ctr: 'DECIMAL(8,6)',
      },
      primaryKey: '_fivetran_id',
      foreignKeys: [
        { column: 'campaign_id', references: 'bronze.google_ads_campaign', referencedColumn: 'id' },
      ],
    },
    {
      name: 'bronze.google_ads_keyword_stats',
      description: 'Google Ads keyword performance - Fivetran schema',
      schema: {
        _fivetran_id: 'STRING PRIMARY KEY',
        _fivetran_synced: 'TIMESTAMP',
        date: 'DATE',
        customer_id: 'STRING',
        campaign_id: 'STRING',
        ad_group_id: 'STRING',
        keyword_ad_group_criterion: 'STRING',
        keyword_text: 'STRING',
        keyword_match_type: 'STRING', // EXACT, PHRASE, BROAD
        quality_score: 'INTEGER', // 1-10
        search_impression_share: 'DECIMAL(5,4)',
        impressions: 'BIGINT',
        clicks: 'BIGINT',
        cost_micros: 'BIGINT',
        conversions: 'DECIMAL(10,2)',
      },
      primaryKey: '_fivetran_id',
    },
    
    // Facebook Ads (Fivetran Schema)
    {
      name: 'bronze.facebook_ads_basic_ad',
      description: 'Facebook/Instagram ad performance - Fivetran schema',
      schema: {
        _fivetran_id: 'STRING PRIMARY KEY',
        _fivetran_synced: 'TIMESTAMP',
        date: 'DATE',
        account_id: 'STRING',
        account_name: 'STRING',
        campaign_id: 'STRING',
        campaign_name: 'STRING',
        adset_id: 'STRING',
        adset_name: 'STRING',
        ad_id: 'STRING',
        ad_name: 'STRING',
        
        // Fivetran standard metrics
        impressions: 'BIGINT',
        reach: 'BIGINT',
        frequency: 'DECIMAL(8,4)',
        clicks: 'BIGINT',
        inline_link_clicks: 'BIGINT',
        spend: 'DECIMAL(18,2)',
        cpc: 'DECIMAL(10,2)',
        cpm: 'DECIMAL(10,2)',
        cpp: 'DECIMAL(10,2)', // Cost per 1000 people reached
        ctr: 'DECIMAL(8,6)',
        unique_clicks: 'BIGINT',
        unique_ctr: 'DECIMAL(8,6)',
        
        // Video metrics
        video_view_time: 'BIGINT', // milliseconds
        video_views: 'BIGINT',
        video_avg_time_watched_actions: 'BIGINT',
        
        // Engagement
        post_engagement: 'BIGINT',
        page_engagement: 'BIGINT',
        link_click: 'BIGINT',
        post_reaction: 'BIGINT',
        comment: 'BIGINT',
        post: 'BIGINT',
      },
      primaryKey: '_fivetran_id',
      foreignKeys: [
        { column: 'account_id', references: 'bronze.facebook_ads_account', referencedColumn: 'id' },
      ],
    },
    {
      name: 'bronze.facebook_ads_action_values',
      description: 'Facebook conversion actions - Fivetran schema',
      schema: {
        _fivetran_id: 'STRING PRIMARY KEY',
        _fivetran_synced: 'TIMESTAMP',
        date: 'DATE',
        ad_id: 'STRING',
        action_type: 'STRING', // purchase, lead, add_to_cart, etc.
        value: 'DECIMAL(10,2)',
        action_destination: 'STRING',
        action_reaction: 'STRING',
        action_video_type: 'STRING',
      },
      primaryKey: '_fivetran_id',
      foreignKeys: [
        { column: 'ad_id', references: 'bronze.facebook_ads_basic_ad', referencedColumn: 'ad_id' },
      ],
    },
    
    // HubSpot Marketing (Fivetran Schema)
    {
      name: 'bronze.hubspot_email_campaign',
      description: 'HubSpot email campaigns - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        id: 'BIGINT PRIMARY KEY',
        app_id: 'BIGINT',
        app_name: 'STRING',
        content_id: 'BIGINT',
        name: 'STRING',
        subject: 'STRING',
        from_name: 'STRING',
        reply_to: 'STRING',
        campaign_guid: 'STRING',
        type: 'STRING', // batch, ab, automated, blog, rss, etc.
        created: 'TIMESTAMP',
        updated: 'TIMESTAMP',
      },
      primaryKey: 'id',
    },
    {
      name: 'bronze.hubspot_email_event',
      description: 'HubSpot email events - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        id: 'STRING PRIMARY KEY',
        created: 'TIMESTAMP',
        email_campaign_id: 'BIGINT',
        recipient: 'STRING',
        type: 'STRING', // SENT, DELIVERED, OPEN, CLICK, BOUNCE, etc.
        sent_by_event_id: 'STRING',
        
        // Event-specific fields
        bounce_category: 'STRING',
        response: 'STRING',
        status: 'STRING',
        subject: 'STRING',
        url: 'STRING', // for CLICK events
        
        // Device info
        browser_name: 'STRING',
        browser_family: 'STRING',
        user_agent: 'STRING',
        location_city: 'STRING',
        location_state: 'STRING',
        location_country: 'STRING',
      },
      primaryKey: 'id',
      foreignKeys: [
        { column: 'email_campaign_id', references: 'bronze.hubspot_email_campaign', referencedColumn: 'id' },
      ],
    },
    {
      name: 'bronze.hubspot_contact',
      description: 'HubSpot contacts - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        id: 'BIGINT PRIMARY KEY',
        property_email: 'STRING',
        property_firstname: 'STRING',
        property_lastname: 'STRING',
        property_lifecyclestage: 'STRING',
        property_hs_lead_status: 'STRING',
        property_hubspotscore: 'INTEGER',
        property_createdate: 'TIMESTAMP',
        property_lastmodifieddate: 'TIMESTAMP',
        is_deleted: 'BOOLEAN',
      },
      primaryKey: 'id',
    },
    
    // Salesforce Marketing Cloud (Fivetran Schema)
    {
      name: 'bronze.sfmc_send',
      description: 'Salesforce Marketing Cloud email sends - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        subscriber_key: 'STRING',
        email_address: 'STRING',
        subscriber_id: 'BIGINT',
        list_id: 'BIGINT',
        event_date: 'TIMESTAMP',
        send_id: 'BIGINT',
        subject: 'STRING',
        email_name: 'STRING',
        from_name: 'STRING',
        from_address: 'STRING',
        created_date: 'TIMESTAMP',
        modified_date: 'TIMESTAMP',
        batch_id: 'BIGINT',
        triggered_send_external_key: 'STRING',
      },
    },
    {
      name: 'bronze.sfmc_open',
      description: 'Salesforce Marketing Cloud email opens - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        subscriber_key: 'STRING',
        email_address: 'STRING',
        subscriber_id: 'BIGINT',
        list_id: 'BIGINT',
        event_date: 'TIMESTAMP',
        send_id: 'BIGINT',
        is_unique: 'BOOLEAN',
        batch_id: 'BIGINT',
        triggered_send_external_key: 'STRING',
      },
    },
    {
      name: 'bronze.sfmc_click',
      description: 'Salesforce Marketing Cloud email clicks - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        subscriber_key: 'STRING',
        email_address: 'STRING',
        subscriber_id: 'BIGINT',
        list_id: 'BIGINT',
        event_date: 'TIMESTAMP',
        send_id: 'BIGINT',
        url: 'STRING',
        link_name: 'STRING',
        link_content: 'STRING',
        is_unique: 'BOOLEAN',
        batch_id: 'BIGINT',
      },
    },
    {
      name: 'bronze.sfmc_bounce',
      description: 'Salesforce Marketing Cloud email bounces - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        subscriber_key: 'STRING',
        email_address: 'STRING',
        subscriber_id: 'BIGINT',
        list_id: 'BIGINT',
        event_date: 'TIMESTAMP',
        send_id: 'BIGINT',
        bounce_category: 'STRING', // Hard bounce, Soft bounce, etc.
        bounce_subcategory: 'STRING',
        bounce_type: 'STRING',
        smtp_bounce_reason: 'STRING',
        smtp_code: 'STRING',
        bounce_reason: 'STRING',
        batch_id: 'BIGINT',
      },
    },
    
    // Google Analytics 4 (Fivetran Schema)
    {
      name: 'bronze.ga4_traffic_acquisition',
      description: 'Google Analytics 4 traffic acquisition - Fivetran schema',
      schema: {
        _fivetran_id: 'STRING PRIMARY KEY',
        _fivetran_synced: 'TIMESTAMP',
        date: 'DATE',
        property: 'STRING',
        session_source: 'STRING',
        session_medium: 'STRING',
        session_campaign_name: 'STRING',
        session_default_channel_group: 'STRING',
        
        // GA4 metrics (Fivetran standard)
        active_users: 'BIGINT',
        new_users: 'BIGINT',
        total_users: 'BIGINT',
        sessions: 'BIGINT',
        engaged_sessions: 'BIGINT',
        engagement_rate: 'DECIMAL(8,6)',
        average_session_duration: 'DECIMAL(10,2)',
        sessions_per_user: 'DECIMAL(8,4)',
        event_count: 'BIGINT',
        conversions: 'BIGINT',
        total_revenue: 'DECIMAL(18,2)',
      },
      primaryKey: '_fivetran_id',
    },
    {
      name: 'bronze.ga4_user_acquisition',
      description: 'Google Analytics 4 user acquisition - Fivetran schema',
      schema: {
        _fivetran_id: 'STRING PRIMARY KEY',
        _fivetran_synced: 'TIMESTAMP',
        date: 'DATE',
        property: 'STRING',
        first_user_source: 'STRING',
        first_user_medium: 'STRING',
        first_user_campaign_name: 'STRING',
        first_user_default_channel_group: 'STRING',
        
        new_users: 'BIGINT',
        active_users: 'BIGINT',
        engaged_sessions: 'BIGINT',
        engagement_rate: 'DECIMAL(8,6)',
        conversions: 'BIGINT',
        total_revenue: 'DECIMAL(18,2)',
      },
      primaryKey: '_fivetran_id',
    },
    {
      name: 'bronze.ga4_pages_and_screens',
      description: 'Google Analytics 4 page/screen views - Fivetran schema',
      schema: {
        _fivetran_id: 'STRING PRIMARY KEY',
        _fivetran_synced: 'TIMESTAMP',
        date: 'DATE',
        property: 'STRING',
        page_location: 'STRING',
        page_title: 'STRING',
        page_referrer: 'STRING',
        
        views: 'BIGINT',
        users: 'BIGINT',
        new_users: 'BIGINT',
        sessions: 'BIGINT',
        engaged_sessions: 'BIGINT',
        average_engagement_time: 'DECIMAL(10,2)',
        event_count: 'BIGINT',
      },
      primaryKey: '_fivetran_id',
    },
    
    // Segment (Fivetran Schema)
    {
      name: 'bronze.segment_tracks',
      description: 'Segment event tracking - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        id: 'STRING PRIMARY KEY',
        timestamp: 'TIMESTAMP',
        user_id: 'STRING',
        anonymous_id: 'STRING',
        context_ip: 'STRING',
        context_user_agent: 'STRING',
        
        // Event details
        event: 'STRING',
        event_text: 'STRING',
        
        // Context fields
        context_app_name: 'STRING',
        context_app_version: 'STRING',
        context_device_type: 'STRING',
        context_device_model: 'STRING',
        context_os_name: 'STRING',
        context_os_version: 'STRING',
        context_screen_density: 'INTEGER',
        context_screen_height: 'INTEGER',
        context_screen_width: 'INTEGER',
        
        // Location
        context_location_city: 'STRING',
        context_location_country: 'STRING',
        context_location_region: 'STRING',
        context_location_latitude: 'DECIMAL(10,6)',
        context_location_longitude: 'DECIMAL(10,6)',
        
        // Campaign tracking
        context_campaign_name: 'STRING',
        context_campaign_source: 'STRING',
        context_campaign_medium: 'STRING',
        context_campaign_content: 'STRING',
        context_campaign_term: 'STRING',
      },
      primaryKey: 'id',
    },
    {
      name: 'bronze.segment_identifies',
      description: 'Segment user identifies - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        id: 'STRING PRIMARY KEY',
        timestamp: 'TIMESTAMP',
        user_id: 'STRING',
        anonymous_id: 'STRING',
        
        // User traits
        email: 'STRING',
        name: 'STRING',
        first_name: 'STRING',
        last_name: 'STRING',
        phone: 'STRING',
        created_at: 'TIMESTAMP',
        
        // Context
        context_ip: 'STRING',
        context_user_agent: 'STRING',
        context_location_city: 'STRING',
        context_location_country: 'STRING',
      },
      primaryKey: 'id',
    },
    {
      name: 'bronze.segment_pages',
      description: 'Segment page views - Fivetran schema',
      schema: {
        _fivetran_synced: 'TIMESTAMP',
        id: 'STRING PRIMARY KEY',
        timestamp: 'TIMESTAMP',
        user_id: 'STRING',
        anonymous_id: 'STRING',
        
        // Page details
        name: 'STRING',
        path: 'STRING',
        referrer: 'STRING',
        search: 'STRING',
        title: 'STRING',
        url: 'STRING',
        
        // Context
        context_ip: 'STRING',
        context_user_agent: 'STRING',
        context_campaign_name: 'STRING',
        context_campaign_source: 'STRING',
        context_campaign_medium: 'STRING',
      },
      primaryKey: 'id',
    },
  ],
  relationships: [
    {
      from: 'bronze.google_ads_ad_group_stats',
      to: 'bronze.google_ads_campaign_stats',
      type: 'many-to-one',
      foreignKey: 'campaign_id',
    },
    {
      from: 'bronze.google_ads_keyword_stats',
      to: 'bronze.google_ads_ad_group_stats',
      type: 'many-to-one',
      foreignKey: 'ad_group_id',
    },
    {
      from: 'bronze.facebook_ads_action_values',
      to: 'bronze.facebook_ads_basic_ad',
      type: 'many-to-one',
      foreignKey: 'ad_id',
    },
    {
      from: 'bronze.hubspot_email_event',
      to: 'bronze.hubspot_email_campaign',
      type: 'many-to-one',
      foreignKey: 'email_campaign_id',
    },
    {
      from: 'bronze.segment_tracks',
      to: 'bronze.segment_identifies',
      type: 'many-to-one',
      foreignKey: 'user_id',
    },
    {
      from: 'bronze.segment_pages',
      to: 'bronze.segment_identifies',
      type: 'many-to-one',
      foreignKey: 'user_id',
    },
  ],
};

export default {
  marketingRetailLogicalERD,
  marketingRetailPhysicalERD,
};
