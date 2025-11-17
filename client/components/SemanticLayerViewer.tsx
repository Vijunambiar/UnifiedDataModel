import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Tag, 
  Layers, 
  Folder,
  TrendingUp,
  Database,
  Filter,
  Clock,
  AlertCircle
} from "lucide-react";

interface SemanticMeasure {
  name: string;
  displayName: string;
  formula: string;
  description: string;
  dataType: string;
  aggregation: string;
  format?: string;
  category: string;
}

interface SemanticAttribute {
  name: string;
  displayName: string;
  field: string;
  dataType: string;
  description: string;
  lookup?: string;
  format?: string;
}

interface SemanticHierarchy {
  name: string;
  levels: string[];
  description: string;
}

interface SemanticFolder {
  name: string;
  measures: string[];
  description: string;
  icon?: string;
}

interface SemanticLayerViewerProps {
  domainId: string;
  domainName: string;
  measures?: SemanticMeasure[];
  attributes?: SemanticAttribute[];
  hierarchies?: SemanticHierarchy[];
  folders?: SemanticFolder[];
}

export function SemanticLayerViewer({
  domainId,
  domainName,
  measures = [],
  attributes = [],
  hierarchies = [],
  folders = []
}: SemanticLayerViewerProps) {
  
  const hasSemantic = measures.length > 0 || attributes.length > 0 || hierarchies.length > 0;

  if (!hasSemantic) {
    return (
      <div className="text-center py-12">
        <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h3 className="text-xl font-semibold mb-2 text-muted-foreground">
          Semantic Layer Coming Soon
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          The semantic layer provides business-friendly measures, attributes, hierarchies, and folders 
          to enable self-service analytics and BI reporting. This domain's semantic layer is currently 
          being developed.
        </p>
        <Card className="max-w-3xl mx-auto border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="h-5 w-5" />
              What is a Semantic Layer?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-3">
            <p className="text-sm text-amber-900">
              A semantic layer is a business-friendly abstraction on top of your data warehouse that:
            </p>
            <ul className="text-sm text-amber-800 space-y-2 list-disc list-inside">
              <li><strong>Measures:</strong> Pre-calculated KPIs and metrics (e.g., Total Revenue, Customer Count, Average Balance)</li>
              <li><strong>Attributes:</strong> Business-friendly field names and descriptions (e.g., Customer Segment, Product Category)</li>
              <li><strong>Hierarchies:</strong> Drill-down paths for analysis (e.g., Country → State → City → Zip Code)</li>
              <li><strong>Folders:</strong> Organized groupings of related measures (e.g., Customer Acquisition, Retention, Profitability)</li>
            </ul>
            <p className="text-sm text-amber-900 mt-4">
              <strong>Business Value:</strong> Enables business users to create reports and dashboards without 
              writing SQL or understanding complex data models.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{measures.length}</div>
                <div className="text-sm text-blue-700">Measures</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{attributes.length}</div>
                <div className="text-sm text-purple-700">Attributes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Layers className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">{hierarchies.length}</div>
                <div className="text-sm text-green-700">Hierarchies</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Folder className="h-8 w-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold text-amber-900">{folders.length}</div>
                <div className="text-sm text-amber-700">Folders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="measures" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measures">
            <Calculator className="h-4 w-4 mr-2" />
            Measures ({measures.length})
          </TabsTrigger>
          <TabsTrigger value="attributes">
            <Tag className="h-4 w-4 mr-2" />
            Attributes ({attributes.length})
          </TabsTrigger>
          <TabsTrigger value="hierarchies">
            <Layers className="h-4 w-4 mr-2" />
            Hierarchies ({hierarchies.length})
          </TabsTrigger>
          <TabsTrigger value="folders">
            <Folder className="h-4 w-4 mr-2" />
            Folders ({folders.length})
          </TabsTrigger>
        </TabsList>

        {/* Measures Tab */}
        <TabsContent value="measures" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Business Measures
              </CardTitle>
              <CardDescription>
                Pre-calculated KPIs and metrics ready for BI tools and dashboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {measures.map((measure, idx) => (
                  <Card key={idx} className="border-blue-100 bg-blue-50/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-blue-900">{measure.displayName}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-1">{measure.name}</div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{measure.aggregation}</Badge>
                          <Badge variant="secondary" className="text-xs">{measure.dataType}</Badge>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">{measure.category}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{measure.description}</p>
                      <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-sm">
                        <div className="text-emerald-400 mb-1">-- Formula:</div>
                        {measure.formula}
                      </div>
                      {measure.format && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Format: <span className="font-mono">{measure.format}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attributes Tab */}
        <TabsContent value="attributes" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-600" />
                Business Attributes
              </CardTitle>
              <CardDescription>
                Business-friendly field names and dimensional attributes for slicing and filtering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {attributes.map((attr, idx) => (
                  <Card key={idx} className="border-purple-100 bg-purple-50/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-purple-900">{attr.displayName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{attr.name}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{attr.dataType}</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{attr.description}</p>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <Database className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Field: </span>
                          <span className="font-mono">{attr.field}</span>
                        </div>
                        {attr.lookup && (
                          <div className="flex items-center gap-2">
                            <Filter className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Lookup: </span>
                            <span className="font-mono text-blue-600">{attr.lookup}</span>
                          </div>
                        )}
                        {attr.format && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Format: </span>
                            <span className="font-mono">{attr.format}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hierarchies Tab */}
        <TabsContent value="hierarchies" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-green-600" />
                Drill-Down Hierarchies
              </CardTitle>
              <CardDescription>
                Predefined drill paths for analytical navigation and aggregation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hierarchies.map((hierarchy, idx) => (
                  <Card key={idx} className="border-green-100 bg-green-50/30">
                    <CardContent className="pt-4">
                      <div className="font-semibold text-lg text-green-900 mb-2">{hierarchy.name}</div>
                      <p className="text-sm text-slate-700 mb-4">{hierarchy.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {hierarchy.levels.map((level, levelIdx) => (
                          <div key={levelIdx} className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                              {level}
                            </Badge>
                            {levelIdx < hierarchy.levels.length - 1 && (
                              <span className="text-green-600 font-bold">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Folders Tab */}
        <TabsContent value="folders" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-amber-600" />
                Business Folders
              </CardTitle>
              <CardDescription>
                Organized groupings of related measures for easy discovery and navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {folders.map((folder, idx) => (
                  <Card key={idx} className="border-amber-100 bg-amber-50/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Folder className="h-5 w-5 text-amber-600" />
                        <div className="font-semibold text-lg text-amber-900">{folder.name}</div>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{folder.description}</p>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-amber-800 mb-1">
                          Measures ({folder.measures.length}):
                        </div>
                        {folder.measures.map((measure, mIdx) => (
                          <div key={mIdx} className="text-xs text-slate-700 ml-4">
                            • {measure}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
