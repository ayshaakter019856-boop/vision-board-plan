import { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit3, 
  Save, 
  X, 
  DollarSign, 
  Palette, 
  Target, 
  Users, 
  BarChart3,
  StickyNote,
  Trash2
} from "lucide-react";

interface MarketingNodeData {
  label: string;
  category: 'sales' | 'branding' | 'ads' | 'retention' | 'analytics';
  description?: string;
  notes?: string;
}

const categoryConfig = {
  sales: { icon: DollarSign, color: 'bg-sales text-sales-foreground', bgColor: 'bg-sales/5 border-sales/20' },
  branding: { icon: Palette, color: 'bg-branding text-branding-foreground', bgColor: 'bg-branding/5 border-branding/20' },
  ads: { icon: Target, color: 'bg-ads text-ads-foreground', bgColor: 'bg-ads/5 border-ads/20' },
  retention: { icon: Users, color: 'bg-retention text-retention-foreground', bgColor: 'bg-retention/5 border-retention/20' },
  analytics: { icon: BarChart3, color: 'bg-analytics text-analytics-foreground', bgColor: 'bg-analytics/5 border-analytics/20' },
};

export const MarketingNode = memo(({ data, id, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const nodeData = data as unknown as MarketingNodeData;
  const [editData, setEditData] = useState(nodeData);
  const config = categoryConfig[nodeData.category];
  const Icon = config.icon;
  const { setNodes, setEdges } = useReactFlow();

  const handleSave = () => {
    // In a real app, this would update the node data
    setIsEditing(false);
    console.log('Saving node data:', editData);
  };

  const handleCancel = () => {
    setEditData(nodeData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="relative">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-background border-2 border-border hover:border-primary transition-colors"
      />
      
      <Card className={`
        min-w-[200px] max-w-[300px] p-4 
        ${config.bgColor} 
        border-2 
        ${selected ? 'border-primary shadow-medium' : 'border-border shadow-soft'}
        transition-all duration-200 hover:shadow-medium
      `}>
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${config.color} flex items-center gap-1 text-xs`}>
            <Icon className="w-3 h-3" />
            {nodeData.category}
          </Badge>
          
          <div className="flex items-center gap-1">
            {nodeData.notes && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowNotes(!showNotes)}
              >
                <StickyNote className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              title="Delete node"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Node Content */}
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editData.label}
              onChange={(e) => setEditData({ ...editData, label: e.target.value })}
              className="text-sm"
              placeholder="Node label"
            />
            <Textarea
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="text-xs resize-none"
              placeholder="Description"
              rows={2}
            />
            <Textarea
              value={editData.notes || ''}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              className="text-xs resize-none"
              placeholder="Notes or tasks"
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="flex-1">
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm leading-tight">{nodeData.label}</h3>
            {nodeData.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {nodeData.description}
              </p>
            )}
            {showNotes && nodeData.notes && (
              <div className="mt-2 p-2 bg-background/50 rounded border border-border">
                <p className="text-xs text-muted-foreground">{nodeData.notes}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-background border-2 border-border hover:border-primary transition-colors"
      />
    </div>
  );
});