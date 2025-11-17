import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bankingAreas } from "@/lib/banking-areas";
import { bankingDomains } from "@/lib/enterprise-domains";
import { evaluateAllDomains, type DomainEvaluation } from "@/lib/domain-evaluation";
import { allSourceSystems } from "@/lib/source-to-target-mapping";
import { Download, TrendingUp, CheckCircle2, AlertCircle, XCircle, Circle, ArrowLeftRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FeatureType =
  | "bronze"
  | "silver"
  | "gold"
  | "metrics"
  | "sttm"
  | "erd";

type GranularFeatureType =
  | "bronze_tables"
  | "bronze_schemas"
  | "bronze_relationships"
  | "silver_tables"
  | "silver_schemas"
  | "silver_scd"
  | "gold_dimensions"
  | "gold_facts"
  | "gold_relationships"
  | "metrics_count"
  | "metrics_formulas"
  | "metrics_units"
  | "sttm_sources"
  | "sttm_mappings"
  | "sttm_coverage"
  | "erd_logical"
  | "erd_physical";

interface FeatureScore {
  score: number; // 0-5
  status: "excellent" | "good" | "fair" | "poor" | "missing";
  color: string;
  icon: React.ReactNode;
  details?: string;
}

interface DomainFeatureMatrix {
  domainId: string;
  domainName: string;
  area: string;
  priority: string;
  features: Record<FeatureType, FeatureScore>;
  overallScore: number;
  overallGrade: string;
}

const features: { id: FeatureType; name: string; description: string }[] = [
  { id: "bronze", name: "Bronze Layer", description: "Raw data ingestion tables" },
  { id: "silver", name: "Silver Layer", description: "Curated & cleansed tables" },
  { id: "gold", name: "Gold Layer", description: "Dimensional model (facts & dims)" },
  { id: "metrics", name: "Metrics", description: "Business metrics catalog" },
  { id: "sttm", name: "STTM", description: "Source-to-target mappings" },
  { id: "erd", name: "ERD Ready", description: "Entity relationship diagrams" },
];

const granularFeatures: { id: GranularFeatureType; name: string; category: string; description: string }[] = [
  // Bronze Layer Details
  { id: "bronze_tables", name: "Table Count", category: "Bronze Layer", description: "Number of bronze tables defined" },
  { id: "bronze_schemas", name: "Schema Quality", category: "Bronze Layer", description: "Completeness of column definitions" },
  { id: "bronze_relationships", name: "Relationships", category: "Bronze Layer", description: "Table relationships defined" },

  // Silver Layer Details
  { id: "silver_tables", name: "Table Count", category: "Silver Layer", description: "Number of silver tables defined" },
  { id: "silver_schemas", name: "Schema Quality", category: "Silver Layer", description: "Completeness of column definitions" },
  { id: "silver_scd", name: "SCD Support", category: "Silver Layer", description: "Slowly Changing Dimension support" },

  // Gold Layer Details
  { id: "gold_dimensions", name: "Dimensions", category: "Gold Layer", description: "Number of dimension tables" },
  { id: "gold_facts", name: "Facts", category: "Gold Layer", description: "Number of fact tables" },
  { id: "gold_relationships", name: "Relationships", category: "Gold Layer", description: "Star schema relationships" },

  // Metrics Details
  { id: "metrics_count", name: "Metric Count", category: "Metrics", description: "Total number of metrics" },
  { id: "metrics_formulas", name: "Formula Quality", category: "Metrics", description: "Metrics with formulas defined" },
  { id: "metrics_units", name: "Metadata", category: "Metrics", description: "Metrics with IDs and units" },

  // STTM Details
  { id: "sttm_sources", name: "Source Systems", category: "STTM", description: "Number of source systems mapped" },
  { id: "sttm_mappings", name: "Field Mappings", category: "STTM", description: "Total field mappings defined" },
  { id: "sttm_coverage", name: "Coverage", category: "STTM", description: "Percentage of tables with STTM" },

  // ERD Details
  { id: "erd_logical", name: "Logical Model", category: "ERD", description: "Entity relationship definitions" },
  { id: "erd_physical", name: "Physical Model", category: "ERD", description: "Database schema diagrams" },
];

function getScoreColor(score: number): string {
  if (score >= 4.5) return "bg-green-500";
  if (score >= 3.5) return "bg-lime-500";
  if (score >= 2.5) return "bg-yellow-500";
  if (score >= 1.5) return "bg-orange-500";
  if (score > 0) return "bg-red-500";
  return "bg-gray-300";
}

function getScoreStatus(score: number): "excellent" | "good" | "fair" | "poor" | "missing" {
  if (score >= 4.5) return "excellent";
  if (score >= 3.5) return "good";
  if (score >= 2.5) return "fair";
  if (score >= 1.5) return "poor";
  if (score > 0) return "poor";
  return "missing";
}

function getScoreIcon(status: "excellent" | "good" | "fair" | "poor" | "missing"): React.ReactNode {
  switch (status) {
    case "excellent":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "good":
      return <CheckCircle2 className="h-5 w-5 text-lime-600" />;
    case "fair":
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    case "poor":
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    case "missing":
      return <XCircle className="h-5 w-5 text-gray-400" />;
  }
}

function calculateFeatureScore(
  evaluation: DomainEvaluation,
  feature: FeatureType,
  domainId: string
): FeatureScore {
  let score = 0;
  let details = "";

  switch (feature) {
    case "bronze":
      if (evaluation.hasBronzeLayer) {
        score = evaluation.bronzeLayer?.hasSchema ? 5 : 3;
        details = `${evaluation.bronzeLayer?.tableCount || 0} tables`;
      }
      break;

    case "silver":
      if (evaluation.hasSilverLayer) {
        score = evaluation.silverLayer?.hasSchema ? 5 : 3;
        details = `${evaluation.silverLayer?.tableCount || 0} tables`;
      }
      break;

    case "gold":
      if (evaluation.hasGoldLayer) {
        const hasRels = evaluation.goldLayer?.hasRelationships;
        score = hasRels ? 5 : 4;
        details = `${evaluation.goldLayer?.tableCount || 0} tables`;
      }
      break;

    case "metrics":
      if (evaluation.metricsCount > 0) {
        if (evaluation.metricsCount >= 200 && evaluation.hasDetailedMetrics) score = 5;
        else if (evaluation.metricsCount >= 100 && evaluation.hasDetailedMetrics) score = 4.5;
        else if (evaluation.metricsCount >= 100) score = 4;
        else if (evaluation.metricsCount >= 50) score = 3;
        else score = 2;
        details = `${evaluation.metricsCount} metrics`;
      }
      break;

    case "sttm":
      // Check if domain has STTM coverage
      const sttmSystems = allSourceSystems.filter(sys => 
        sys.domains.includes(domainId) || sys.domains.some(d => d.includes(domainId.split('-')[0]))
      );
      if (sttmSystems.length > 0) {
        const totalMappings = sttmSystems.reduce((sum, sys) => 
          sum + (sys.sourceSchemas?.length || 0), 0
        );
        if (totalMappings >= 10) score = 5;
        else if (totalMappings >= 5) score = 4;
        else if (totalMappings >= 3) score = 3;
        else if (totalMappings > 0) score = 2;
        details = `${sttmSystems.length} sources, ${totalMappings} mappings`;
      }
      break;

    case "erd":
      const erdReady = evaluation.readyForDrawIo && evaluation.readyForDbDiagram;
      if (erdReady) {
        score = 5;
        details = "Full ERD support";
      } else if (evaluation.readyForDrawIo || evaluation.readyForDbDiagram) {
        score = 3;
        details = "Partial ERD support";
      }
      break;
  }

  const status = getScoreStatus(score);
  return {
    score,
    status,
    color: getScoreColor(score),
    icon: getScoreIcon(status),
    details,
  };
}

function calculateGranularFeatureScore(
  evaluation: DomainEvaluation,
  feature: GranularFeatureType,
  domainId: string
): FeatureScore {
  let score = 0;
  let details = "";

  switch (feature) {
    // Bronze Layer
    case "bronze_tables":
      const bronzeCount = evaluation.bronzeLayer?.tableCount || 0;
      if (bronzeCount >= 20) score = 5;
      else if (bronzeCount >= 15) score = 4;
      else if (bronzeCount >= 10) score = 3;
      else if (bronzeCount >= 5) score = 2;
      else if (bronzeCount > 0) score = 1;
      details = `${bronzeCount} tables`;
      break;

    case "bronze_schemas":
      if (evaluation.bronzeLayer?.hasSchema) {
        score = 5;
        details = "Full schemas";
      } else if (evaluation.hasBronzeLayer) {
        score = 2;
        details = "Partial schemas";
      }
      break;

    case "bronze_relationships":
      if (evaluation.bronzeLayer?.hasRelationships) {
        score = 5;
        details = "Relationships defined";
      } else if (evaluation.hasBronzeLayer) {
        score = 1;
        details = "No relationships";
      }
      break;

    // Silver Layer
    case "silver_tables":
      const silverCount = evaluation.silverLayer?.tableCount || 0;
      if (silverCount >= 15) score = 5;
      else if (silverCount >= 10) score = 4;
      else if (silverCount >= 7) score = 3;
      else if (silverCount >= 4) score = 2;
      else if (silverCount > 0) score = 1;
      details = `${silverCount} tables`;
      break;

    case "silver_schemas":
      if (evaluation.silverLayer?.hasSchema) {
        score = 5;
        details = "Full schemas";
      } else if (evaluation.hasSilverLayer) {
        score = 2;
        details = "Partial schemas";
      }
      break;

    case "silver_scd":
      // Check for SCD support in silver layer tables
      const hasSCD = evaluation.silverLayer?.tables?.some((t: any) => t.scd2 || t.scdType) || false;
      if (hasSCD) {
        score = 5;
        details = "SCD Type 2 support";
      } else if (evaluation.hasSilverLayer) {
        score = 2;
        details = "No SCD support";
      }
      break;

    // Gold Layer
    case "gold_dimensions":
      // Estimate dimensions from gold layer
      const dimCount = Math.floor((evaluation.goldLayer?.tableCount || 0) * 0.6);
      if (dimCount >= 15) score = 5;
      else if (dimCount >= 10) score = 4;
      else if (dimCount >= 6) score = 3;
      else if (dimCount >= 3) score = 2;
      else if (dimCount > 0) score = 1;
      details = `~${dimCount} dimensions`;
      break;

    case "gold_facts":
      // Estimate facts from gold layer
      const factCount = Math.floor((evaluation.goldLayer?.tableCount || 0) * 0.4);
      if (factCount >= 15) score = 5;
      else if (factCount >= 10) score = 4;
      else if (factCount >= 6) score = 3;
      else if (factCount >= 3) score = 2;
      else if (factCount > 0) score = 1;
      details = `~${factCount} facts`;
      break;

    case "gold_relationships":
      if (evaluation.goldLayer?.hasRelationships) {
        score = 5;
        details = "Star schema defined";
      } else if (evaluation.hasGoldLayer) {
        score = 1;
        details = "No relationships";
      }
      break;

    // Metrics
    case "metrics_count":
      const mCount = evaluation.metricsCount;
      if (mCount >= 200) score = 5;
      else if (mCount >= 100) score = 4;
      else if (mCount >= 50) score = 3;
      else if (mCount >= 25) score = 2;
      else if (mCount > 0) score = 1;
      details = `${mCount} metrics`;
      break;

    case "metrics_formulas":
      if (evaluation.hasMetricsFormulas) {
        score = 5;
        details = "Formulas defined";
      } else if (evaluation.metricsCount > 0) {
        score = 1;
        details = "No formulas";
      }
      break;

    case "metrics_units":
      if (evaluation.hasDetailedMetrics) {
        score = 5;
        details = "Full metadata";
      } else if (evaluation.metricsCount > 0) {
        score = 2;
        details = "Basic metadata";
      }
      break;

    // STTM
    case "sttm_sources":
      const sttmSystems = allSourceSystems.filter(sys =>
        sys.domains.includes(domainId) || sys.domains.some(d => d.includes(domainId.split('-')[0]))
      );
      const sourceCount = sttmSystems.length;
      if (sourceCount >= 5) score = 5;
      else if (sourceCount >= 3) score = 4;
      else if (sourceCount >= 2) score = 3;
      else if (sourceCount === 1) score = 2;
      details = `${sourceCount} sources`;
      break;

    case "sttm_mappings":
      const sttmSys = allSourceSystems.filter(sys =>
        sys.domains.includes(domainId) || sys.domains.some(d => d.includes(domainId.split('-')[0]))
      );
      const mappingCount = sttmSys.reduce((sum, sys) => sum + (sys.sourceSchemas?.length || 0), 0);
      if (mappingCount >= 15) score = 5;
      else if (mappingCount >= 10) score = 4;
      else if (mappingCount >= 5) score = 3;
      else if (mappingCount >= 2) score = 2;
      else if (mappingCount > 0) score = 1;
      details = `${mappingCount} mappings`;
      break;

    case "sttm_coverage":
      const totalTables = (evaluation.bronzeLayer?.tableCount || 0);
      const sttmSys2 = allSourceSystems.filter(sys =>
        sys.domains.includes(domainId) || sys.domains.some(d => d.includes(domainId.split('-')[0]))
      );
      const mappingCnt = sttmSys2.reduce((sum, sys) => sum + (sys.sourceSchemas?.length || 0), 0);
      const coverage = totalTables > 0 ? (mappingCnt / totalTables) * 100 : 0;
      if (coverage >= 80) score = 5;
      else if (coverage >= 60) score = 4;
      else if (coverage >= 40) score = 3;
      else if (coverage >= 20) score = 2;
      else if (coverage > 0) score = 1;
      details = `${Math.round(coverage)}% coverage`;
      break;

    // ERD
    case "erd_logical":
      if (evaluation.readyForDrawIo) {
        score = 5;
        details = "Logical model ready";
      } else if (evaluation.logicalEntitiesCount > 0) {
        score = 3;
        details = "Partial logical model";
      }
      break;

    case "erd_physical":
      if (evaluation.readyForDbDiagram) {
        score = 5;
        details = "Physical model ready";
      } else if (evaluation.hasBronzeLayer) {
        score = 2;
        details = "Basic physical model";
      }
      break;
  }

  const status = getScoreStatus(score);
  return {
    score,
    status,
    color: getScoreColor(score),
    icon: getScoreIcon(status),
    details,
  };
}

export default function PlatformSummary() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<DomainEvaluation[]>([]);
  const [matrix, setMatrix] = useState<DomainFeatureMatrix[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [isTransposed, setIsTransposed] = useState(false);
  const [viewMode, setViewMode] = useState<"standard" | "detailed">("standard");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { evaluations: evals } = await evaluateAllDomains();
        setEvaluations(evals);

        // Build feature matrix
        const matrixData: DomainFeatureMatrix[] = evals.map(evaluation => {
          const domain = bankingDomains.find(d => d.id === evaluation.domainId);
          const area = bankingAreas.find(a => a.domainIds.includes(evaluation.domainId));

          const featureScores: Record<FeatureType, FeatureScore> = {
            bronze: calculateFeatureScore(evaluation, "bronze", evaluation.domainId),
            silver: calculateFeatureScore(evaluation, "silver", evaluation.domainId),
            gold: calculateFeatureScore(evaluation, "gold", evaluation.domainId),
            metrics: calculateFeatureScore(evaluation, "metrics", evaluation.domainId),
            sttm: calculateFeatureScore(evaluation, "sttm", evaluation.domainId),
            erd: calculateFeatureScore(evaluation, "erd", evaluation.domainId),
          };

          const overallScore = Object.values(featureScores).reduce((sum, f) => sum + f.score, 0) / features.length;

          return {
            domainId: evaluation.domainId,
            domainName: evaluation.domainName,
            area: area?.name || "Unknown",
            priority: evaluation.priority,
            features: featureScores,
            overallScore,
            overallGrade: evaluation.qualityGrade,
          };
        });

        setMatrix(matrixData);
      } catch (error) {
        console.error("Failed to load platform summary:", error);
        toast({
          title: "Error",
          description: "Failed to load platform summary data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [toast]);

  const filteredMatrix = selectedArea === "all" 
    ? matrix 
    : matrix.filter(m => {
        const area = bankingAreas.find(a => a.domainIds.includes(m.domainId));
        return area?.id === selectedArea;
      });

  // Calculate summary stats
  const stats = {
    totalDomains: matrix.length,
    avgOverallScore: matrix.reduce((sum, m) => sum + m.overallScore, 0) / (matrix.length || 1),
    gradeA: matrix.filter(m => m.overallGrade === "A").length,
    gradeB: matrix.filter(m => m.overallGrade === "B").length,
    gradeC: matrix.filter(m => m.overallGrade === "C").length,
    avgByFeature: features.reduce((acc, f) => {
      acc[f.id] = matrix.reduce((sum, m) => sum + m.features[f.id].score, 0) / (matrix.length || 1);
      return acc;
    }, {} as Record<FeatureType, number>),
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Platform summary export is being prepared...",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading platform summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent mb-2">
            Platform Summary
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive overview of data model coverage, quality, and readiness across all banking domains
          </p>
        </div>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Export Summary
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalDomains}</div>
              <div className="text-sm text-muted-foreground">Total Domains</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.avgOverallScore.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Score (0-5)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.gradeA}</div>
              <div className="text-sm text-muted-foreground">Grade A Domains</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.gradeB}</div>
              <div className="text-sm text-muted-foreground">Grade B Domains</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.gradeC}</div>
              <div className="text-sm text-muted-foreground">Grade C Domains</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Average Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Feature Coverage Across Platform
          </CardTitle>
          <CardDescription>Average score (0-5) for each feature across all domains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-6 gap-4">
            {features.map(feature => (
              <div key={feature.id} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold mb-2" style={{ color: getScoreColor(stats.avgByFeature[feature.id]).replace('bg-', '') }}>
                  {stats.avgByFeature[feature.id].toFixed(1)}
                </div>
                <div className="text-xs font-semibold mb-1">{feature.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColor(stats.avgByFeature[feature.id])}`}
                    style={{ width: `${(stats.avgByFeature[feature.id] / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Area Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold">Filter by Banking Area:</span>
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedArea === "all" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setSelectedArea("all")}
          >
            All Areas
          </Badge>
          {bankingAreas.map(area => (
            <Badge 
              key={area.id}
              variant={selectedArea === area.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedArea(area.id)}
            >
              {area.icon} {area.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Feature Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{isTransposed ? "Feature × Domain Matrix" : "Domain × Feature Matrix"}</CardTitle>
              <CardDescription>
                Quality and coverage indicators for each {isTransposed ? "feature and domain" : "domain and feature"} combination
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTransposed(!isTransposed)}
              className="gap-2"
            >
              <ArrowLeftRight className="h-4 w-4" />
              {isTransposed ? "Show Domains as Rows" : "Show Features as Rows"}
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Excellent (4.5-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-lime-500"></div>
              <span>Good (3.5-4.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>Fair (2.5-3.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span>Poor (1.5-2.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Needs Work (&lt;1.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <span>Missing</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "standard" | "detailed")}>
            <TabsList className="mb-4">
              <TabsTrigger value="standard">Standard View (6 Features)</TabsTrigger>
              <TabsTrigger value="detailed">Detailed View (17 Features)</TabsTrigger>
            </TabsList>

            <TabsContent value="standard">
              <div className="overflow-x-auto">
                {!isTransposed ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-3 font-semibold sticky left-0 bg-white z-10 min-w-[250px]">
                          Domain
                        </th>
                        <th className="text-center p-3 font-semibold min-w-[80px]">Area</th>
                        <th className="text-center p-3 font-semibold min-w-[80px]">Priority</th>
                        {features.map(feature => (
                          <th key={feature.id} className="text-center p-3 font-semibold min-w-[100px]">
                            <div className="text-xs">{feature.name}</div>
                          </th>
                        ))}
                        <th className="text-center p-3 font-semibold min-w-[100px]">
                          <div className="text-xs">Overall</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMatrix.map(row => (
                        <tr key={row.domainId} className="border-b hover:bg-slate-50">
                          <td className="p-3 font-medium sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              <span>{row.domainName}</span>
                              <Badge variant="outline" className="text-xs">{row.overallGrade}</Badge>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="secondary" className="text-xs">
                              {row.area.split(' ')[0]}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={row.priority === "P0" ? "destructive" : row.priority === "P1" ? "default" : "outline"}
                              className="text-xs"
                            >
                              {row.priority}
                            </Badge>
                          </td>
                          {features.map(feature => {
                            const featureScore = row.features[feature.id];
                            return (
                              <td key={feature.id} className="p-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center justify-center gap-1">
                                    <Circle
                                      className={`h-6 w-6 ${featureScore.color} rounded-full`}
                                      fill="currentColor"
                                      strokeWidth={0}
                                    />
                                    <span className="text-xs font-semibold">{featureScore.score.toFixed(1)}</span>
                                  </div>
                                  {featureScore.details && (
                                    <span className="text-[10px] text-muted-foreground">{featureScore.details}</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`text-lg font-bold ${
                                row.overallScore >= 4 ? 'text-green-600' :
                                row.overallScore >= 3 ? 'text-blue-600' :
                                row.overallScore >= 2 ? 'text-yellow-600' :
                                'text-orange-600'
                              }`}>
                                {row.overallScore.toFixed(1)}
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getScoreColor(row.overallScore)}`}
                                  style={{ width: `${(row.overallScore / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-3 font-semibold sticky left-0 bg-white z-10 min-w-[200px]">
                          Feature
                        </th>
                        {filteredMatrix.map(domain => (
                          <th key={domain.domainId} className="text-center p-3 font-semibold min-w-[120px]">
                            <div className="text-xs">{domain.domainName}</div>
                            <Badge variant="outline" className="text-[10px] mt-1">{domain.overallGrade}</Badge>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {features.map(feature => (
                        <tr key={feature.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 font-medium sticky left-0 bg-white">
                            <div>
                              <div className="font-semibold">{feature.name}</div>
                              <div className="text-xs text-muted-foreground">{feature.description}</div>
                            </div>
                          </td>
                          {filteredMatrix.map(domain => {
                            const featureScore = domain.features[feature.id];
                            return (
                              <td key={domain.domainId} className="p-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center justify-center gap-1">
                                    <Circle
                                      className={`h-6 w-6 ${featureScore.color} rounded-full`}
                                      fill="currentColor"
                                      strokeWidth={0}
                                    />
                                    <span className="text-xs font-semibold">{featureScore.score.toFixed(1)}</span>
                                  </div>
                                  {featureScore.details && (
                                    <span className="text-[10px] text-muted-foreground">{featureScore.details}</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="detailed">
              <div className="overflow-x-auto">
                {!isTransposed ? (
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-2 font-semibold sticky left-0 bg-white z-10 min-w-[200px]">
                          Domain
                        </th>
                        {granularFeatures.map(feature => (
                          <th key={feature.id} className="text-center p-2 font-semibold min-w-[90px]">
                            <div className="text-[10px] font-bold">{feature.category}</div>
                            <div className="text-[10px]">{feature.name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMatrix.map(row => {
                        const evaluation = evaluations.find(e => e.domainId === row.domainId);
                        if (!evaluation) return null;

                        return (
                          <tr key={row.domainId} className="border-b hover:bg-slate-50">
                            <td className="p-2 font-medium sticky left-0 bg-white">
                              <div className="flex items-center gap-2">
                                <span className="text-xs">{row.domainName}</span>
                                <Badge variant="outline" className="text-[10px]">{row.overallGrade}</Badge>
                              </div>
                            </td>
                            {granularFeatures.map(feature => {
                              const featureScore = calculateGranularFeatureScore(evaluation, feature.id, row.domainId);
                              return (
                                <td key={feature.id} className="p-2 text-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <Circle
                                      className={`h-5 w-5 ${featureScore.color} rounded-full`}
                                      fill="currentColor"
                                      strokeWidth={0}
                                    />
                                    <span className="text-[10px] font-semibold">{featureScore.score.toFixed(1)}</span>
                                    {featureScore.details && (
                                      <span className="text-[9px] text-muted-foreground">{featureScore.details}</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-2 font-semibold sticky left-0 bg-white z-10 min-w-[180px]">
                          Feature
                        </th>
                        {filteredMatrix.slice(0, 20).map(domain => (
                          <th key={domain.domainId} className="text-center p-2 font-semibold min-w-[100px]">
                            <div className="text-[10px]">{domain.domainName}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {granularFeatures.map(feature => (
                        <tr key={feature.id} className="border-b hover:bg-slate-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">
                            <div>
                              <div className="font-semibold text-[11px]">{feature.category}</div>
                              <div className="text-[10px]">{feature.name}</div>
                            </div>
                          </td>
                          {filteredMatrix.slice(0, 20).map(domain => {
                            const evaluation = evaluations.find(e => e.domainId === domain.domainId);
                            if (!evaluation) return <td key={domain.domainId} className="p-2"></td>;

                            const featureScore = calculateGranularFeatureScore(evaluation, feature.id, domain.domainId);
                            return (
                              <td key={domain.domainId} className="p-2 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <Circle
                                    className={`h-5 w-5 ${featureScore.color} rounded-full`}
                                    fill="currentColor"
                                    strokeWidth={0}
                                  />
                                  <span className="text-[10px] font-semibold">{featureScore.score.toFixed(1)}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {isTransposed && filteredMatrix.length > 20 && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Showing first 20 domains. Switch to standard layout to see all domains.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feature Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map(feature => (
              <div key={feature.id} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-1">{feature.name}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
