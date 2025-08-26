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

  const loadTemplate = (templateType: string) => {
    const templates = {
      'sales-funnel': {
        nodes: [
          {
            id: 'sf1',
            type: 'marketing',
            position: { x: 100, y: 50 },
            data: { label: 'Awareness', category: 'ads', description: 'Generate brand awareness through targeted advertising' },
          },
          {
            id: 'sf2',
            type: 'marketing',
            position: { x: 300, y: 120 },
            data: { label: 'Interest', category: 'branding', description: 'Capture interest with compelling content' },
          },
          {
            id: 'sf3',
            type: 'marketing',
            position: { x: 500, y: 190 },
            data: { label: 'Consideration', category: 'sales', description: 'Nurture leads with targeted follow-ups' },
          },
          {
            id: 'sf4',
            type: 'marketing',
            position: { x: 700, y: 260 },
            data: { label: 'Purchase', category: 'sales', description: 'Convert leads into customers' },
          },
          {
            id: 'sf5',
            type: 'marketing',
            position: { x: 900, y: 330 },
            data: { label: 'Retention', category: 'retention', description: 'Keep customers engaged and loyal' },
          },
        ],
        edges: [
          { id: 'e-sf1-sf2', source: 'sf1', target: 'sf2', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-sf2-sf3', source: 'sf2', target: 'sf3', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-sf3-sf4', source: 'sf3', target: 'sf4', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-sf4-sf5', source: 'sf4', target: 'sf5', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
        ],
      },
      'customer-journey': {
        nodes: [
          {
            id: 'cj1',
            type: 'marketing',
            position: { x: 150, y: 100 },
            data: { label: 'Discovery', category: 'analytics', description: 'Customer becomes aware of their problem' },
          },
          {
            id: 'cj2',
            type: 'marketing',
            position: { x: 350, y: 100 },
            data: { label: 'Research', category: 'branding', description: 'Customer researches solutions' },
          },
          {
            id: 'cj3',
            type: 'marketing',
            position: { x: 550, y: 100 },
            data: { label: 'Evaluation', category: 'sales', description: 'Customer compares options' },
          },
          {
            id: 'cj4',
            type: 'marketing',
            position: { x: 750, y: 100 },
            data: { label: 'Purchase', category: 'sales', description: 'Customer makes a decision to buy' },
          },
          {
            id: 'cj5',
            type: 'marketing',
            position: { x: 350, y: 250 },
            data: { label: 'Onboarding', category: 'retention', description: 'Help customer get started' },
          },
          {
            id: 'cj6',
            type: 'marketing',
            position: { x: 550, y: 250 },
            data: { label: 'Support', category: 'retention', description: 'Ongoing customer support' },
          },
          {
            id: 'cj7',
            type: 'marketing',
            position: { x: 750, y: 250 },
            data: { label: 'Advocacy', category: 'retention', description: 'Customer becomes brand advocate' },
          },
        ],
        edges: [
          { id: 'e-cj1-cj2', source: 'cj1', target: 'cj2', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cj2-cj3', source: 'cj2', target: 'cj3', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cj3-cj4', source: 'cj3', target: 'cj4', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cj4-cj5', source: 'cj4', target: 'cj5', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cj5-cj6', source: 'cj5', target: 'cj6', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cj6-cj7', source: 'cj6', target: 'cj7', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
        ],
      },
      'campaign-flow': {
        nodes: [
          {
            id: 'cf1',
            type: 'marketing',
            position: { x: 200, y: 50 },
            data: { label: 'Campaign Strategy', category: 'branding', description: 'Define campaign goals and messaging' },
          },
          {
            id: 'cf2',
            type: 'marketing',
            position: { x: 100, y: 150 },
            data: { label: 'Content Creation', category: 'branding', description: 'Create campaign assets and copy' },
          },
          {
            id: 'cf3',
            type: 'marketing',
            position: { x: 300, y: 150 },
            data: { label: 'Media Planning', category: 'ads', description: 'Plan media channels and budget allocation' },
          },
          {
            id: 'cf4',
            type: 'marketing',
            position: { x: 200, y: 250 },
            data: { label: 'Campaign Launch', category: 'ads', description: 'Execute campaign across channels' },
          },
          {
            id: 'cf5',
            type: 'marketing',
            position: { x: 100, y: 350 },
            data: { label: 'Performance Tracking', category: 'analytics', description: 'Monitor campaign metrics' },
          },
          {
            id: 'cf6',
            type: 'marketing',
            position: { x: 300, y: 350 },
            data: { label: 'Optimization', category: 'analytics', description: 'Adjust and optimize performance' },
          },
        ],
        edges: [
          { id: 'e-cf1-cf2', source: 'cf1', target: 'cf2', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cf1-cf3', source: 'cf1', target: 'cf3', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cf2-cf4', source: 'cf2', target: 'cf4', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cf3-cf4', source: 'cf3', target: 'cf4', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cf4-cf5', source: 'cf4', target: 'cf5', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cf4-cf6', source: 'cf4', target: 'cf6', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
        ],
      },
      'content-strategy': {
        nodes: [
          {
            id: 'cs1',
            type: 'marketing',
            position: { x: 200, y: 50 },
            data: { label: 'Content Planning', category: 'branding', description: 'Plan content themes and calendar' },
          },
          {
            id: 'cs2',
            type: 'marketing',
            position: { x: 100, y: 150 },
            data: { label: 'Blog Content', category: 'branding', description: 'Create educational blog posts' },
          },
          {
            id: 'cs3',
            type: 'marketing',
            position: { x: 300, y: 150 },
            data: { label: 'Social Media', category: 'ads', description: 'Develop social media content' },
          },
          {
            id: 'cs4',
            type: 'marketing',
            position: { x: 500, y: 150 },
            data: { label: 'Video Content', category: 'branding', description: 'Produce video content' },
          },
          {
            id: 'cs5',
            type: 'marketing',
            position: { x: 200, y: 250 },
            data: { label: 'Content Distribution', category: 'ads', description: 'Distribute across channels' },
          },
          {
            id: 'cs6',
            type: 'marketing',
            position: { x: 400, y: 250 },
            data: { label: 'Performance Analysis', category: 'analytics', description: 'Analyze content performance' },
          },
        ],
        edges: [
          { id: 'e-cs1-cs2', source: 'cs1', target: 'cs2', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cs1-cs3', source: 'cs1', target: 'cs3', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cs1-cs4', source: 'cs1', target: 'cs4', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cs2-cs5', source: 'cs2', target: 'cs5', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cs3-cs5', source: 'cs3', target: 'cs5', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cs4-cs6', source: 'cs4', target: 'cs6', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-cs5-cs6', source: 'cs5', target: 'cs6', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
        ],
      },
      'social-media': {
        nodes: [
          {
            id: 'sm1',
            type: 'marketing',
            position: { x: 200, y: 50 },
            data: { label: 'Social Strategy', category: 'branding', description: 'Define social media strategy' },
          },
          {
            id: 'sm2',
            type: 'marketing',
            position: { x: 50, y: 150 },
            data: { label: 'Facebook', category: 'ads', description: 'Facebook marketing campaigns' },
          },
          {
            id: 'sm3',
            type: 'marketing',
            position: { x: 200, y: 150 },
            data: { label: 'Instagram', category: 'ads', description: 'Instagram content and ads' },
          },
          {
            id: 'sm4',
            type: 'marketing',
            position: { x: 350, y: 150 },
            data: { label: 'LinkedIn', category: 'ads', description: 'Professional networking content' },
          },
          {
            id: 'sm5',
            type: 'marketing',
            position: { x: 125, y: 250 },
            data: { label: 'Engagement', category: 'retention', description: 'Community management and engagement' },
          },
          {
            id: 'sm6',
            type: 'marketing',
            position: { x: 275, y: 250 },
            data: { label: 'Analytics', category: 'analytics', description: 'Track social media performance' },
          },
        ],
        edges: [
          { id: 'e-sm1-sm2', source: 'sm1', target: 'sm2', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-sm1-sm3', source: 'sm1', target: 'sm3', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-sm1-sm4', source: 'sm1', target: 'sm4', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-sm2-sm5', source: 'sm2', target: 'sm5', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-sm3-sm5', source: 'sm3', target: 'sm5', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-sm4-sm6', source: 'sm4', target: 'sm6', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e-sm5-sm6', source: 'sm5', target: 'sm6', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
        ],
      },
    };

    const template = templates[templateType as keyof typeof templates];
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
      setDiagramTitle(`${templateType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Template`);
      toast.success(`Loaded ${templateType.replace('-', ' ')} template!`);
    }
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => loadTemplate('sales-funnel')}
              >
                Sales Funnel Template
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => loadTemplate('customer-journey')}
              >
                Customer Journey
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => loadTemplate('campaign-flow')}
              >
                Campaign Flow
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => loadTemplate('content-strategy')}
              >
                Content Strategy
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => loadTemplate('social-media')}
              >
                Social Media Plan
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