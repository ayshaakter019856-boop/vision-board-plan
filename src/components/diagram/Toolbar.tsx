import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MousePointer, 
  Square, 
  Circle, 
  Type, 
  Move, 
  Trash2, 
  Undo, 
  Redo,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface ToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const Toolbar = ({
  activeTool,
  onToolChange,
  onClear,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut
}: ToolbarProps) => {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'move', icon: Move, label: 'Move' },
  ];

  return (
    <Card className="absolute top-4 left-4 z-10 p-2 bg-background/95 backdrop-blur border shadow-medium">
      <div className="flex flex-col gap-1">
        {/* Main Tools */}
        <div className="flex flex-col gap-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => onToolChange(tool.id)}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-1" />

        {/* Action Tools */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            onClick={onUndo}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            onClick={onRedo}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-1" />

        {/* Zoom Tools */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            onClick={onZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            onClick={onZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-1" />

        {/* Clear */}
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 text-destructive hover:bg-destructive/10"
          onClick={onClear}
          title="Clear All"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};