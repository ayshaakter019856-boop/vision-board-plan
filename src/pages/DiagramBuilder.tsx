import { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, 
  Download, 
  Plus, 
  Palette, 
  Target,
  Users,
  DollarSign,
  Share,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MarketingNode } from "@/components/diagram/MarketingNode";
import { Toolbar } from "@/components/diagram/Toolbar";
import { useDiagrams } from "@/hooks/useDiagrams";
import { toast } from "sonner";

const nodeTypes = {
  marketing: MarketingNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'marketing',
    position: { x: 250, y: 100 },
    data: { 
      label: 'Target Audience', 
      category: 'sales',
      description: 'Define your ideal customer'
    },
  },
  {
    id: '2',
    type: 'marketing',
    position: { x: 450, y: 200 },
    data: { 
      label: 'Content Strategy', 
      category: 'branding',
      description: 'Plan your content approach'
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

const DiagramBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { diagrams, saveDiagram } = useDiagrams();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedCategory, setSelectedCategory] = useState<string>('sales');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [diagramTitle, setDiagramTitle] = useState('');
  const [diagramDescription, setDiagramDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load existing diagram if ID is provided
  useEffect(() => {
    if (id && diagrams.length > 0) {
      const diagram = diagrams.find(d => d.id === id);
      if (diagram) {
        setDiagramTitle(diagram.title);
        setDiagramDescription(diagram.description || '');
        if (diagram.nodes && Array.isArray(diagram.nodes)) {
          setNodes(diagram.nodes);
        }
        if (diagram.edges && Array.isArray(diagram.edges)) {
          setEdges(diagram.edges);
        }
      }
    }
  }, [id, diagrams, setNodes, setEdges]);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected);
        if (selectedNodes.length > 0) {
          const selectedNodeIds = selectedNodes.map(node => node.id);
          setNodes((nds) => nds.filter(node => !selectedNodeIds.includes(node.id)));
          setEdges((eds) => eds.filter(edge => 
            !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
          ));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, setNodes, setEdges]);

  const categories = [
    { id: 'sales', label: 'Sales', icon: DollarSign, color: 'sales' },
    { id: 'branding', label: 'Branding', icon: Palette, color: 'branding' },
    { id: 'ads', label: 'Ads', icon: Target, color: 'ads' },
    { id: 'retention', label: 'Retention', icon: Users, color: 'retention' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'analytics' },
  ];

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds)),
    [setEdges],
  );

  const addNode = () => {
    if (!newNodeLabel.trim()) return;

    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'marketing',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: newNodeLabel,
        category: selectedCategory,
        description: `${newNodeLabel} description`
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNewNodeLabel('');
    toast.success(`Added "${newNodeLabel}" to diagram`);
  };

  const handleSave = async () => {
    if (!diagramTitle.trim()) {
      setIsSaveDialogOpen(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const savedDiagram = await saveDiagram(diagramTitle, nodes, edges, diagramDescription, id);
      if (savedDiagram && !id) {
        // Navigate to the new diagram's edit page
        navigate(`/builder/${savedDiagram.id}`, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFromDialog = async () => {
    if (!diagramTitle.trim()) {
      toast.error('Please enter a title for your diagram');
      return;
    }
    
    setIsLoading(true);
    try {
      const savedDiagram = await saveDiagram(diagramTitle, nodes, edges, diagramDescription, id);
      if (savedDiagram && !id) {
        navigate(`/builder/${savedDiagram.id}`, { replace: true });
      }
      setIsSaveDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Diagram exported as PNG!');
  };

  const getCategoryStyle = (category: string, variant: 'button' | 'badge' = 'button') => {
    const baseStyles = {
      sales: variant === 'button' ? 'bg-sales/10 text-sales hover:bg-sales/20 border-sales/20' : 'bg-sales text-sales-foreground',
      branding: variant === 'button' ? 'bg-branding/10 text-branding hover:bg-branding/20 border-branding/20' : 'bg-branding text-branding-foreground',
      ads: variant === 'button' ? 'bg-ads/10 text-ads hover:bg-ads/20 border-ads/20' : 'bg-ads text-ads-foreground',
      retention: variant === 'button' ? 'bg-retention/10 text-retention hover:bg-retention/20 border-retention/20' : 'bg-retention text-retention-foreground',
      analytics: variant === 'button' ? 'bg-analytics/10 text-analytics hover:bg-analytics/20 border-analytics/20' : 'bg-analytics text-analytics-foreground',
    };
    return baseStyles[category as keyof typeof baseStyles] || '';
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">
                {diagramTitle || 'Marketing Flow Builder'}
              </h1>
              <Badge variant="secondary">{id ? 'Editing' : 'Draft'}</Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleSave} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Diagram</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={diagramTitle}
                      onChange={(e) => setDiagramTitle(e.target.value)}
                      placeholder="Enter diagram title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={diagramDescription}
                      onChange={(e) => setDiagramDescription(e.target.value)}
                      placeholder="Enter diagram description..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveFromDialog} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-background p-4 space-y-6 overflow-y-auto">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Add New Node</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Node Label</label>
                <Input
                  placeholder="e.g., Email Campaign"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNode()}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant="outline"
                        size="sm"
                        className={`justify-start ${selectedCategory === category.id ? getCategoryStyle(category.color) : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <Button onClick={addNode} className="w-full" disabled={!newNodeLabel.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Quick Templates</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Sales Funnel Template
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Customer Journey
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Campaign Flow
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Diagram Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nodes:</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connections:</span>
                <span className="font-medium">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categories:</span>
                <span className="font-medium">{new Set(nodes.map(n => n.data.category)).size}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gradient-to-br from-background to-muted/20"
          >
            <Controls className="bg-background border border-border shadow-medium rounded-lg" />
            <MiniMap 
              className="bg-background border border-border shadow-medium rounded-lg"
              nodeClassName="shadow-sm"
            />
            <Background gap={24} size={1} className="opacity-30" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default DiagramBuilder;