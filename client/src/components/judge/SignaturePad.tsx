import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, RotateCcw, Check, PenTool, Type } from "lucide-react";

interface SignaturePadProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (signature: string) => void;
  title?: string;
  description?: string;
  judgeName?: string;
}

export const SignaturePad = ({
  open,
  onClose,
  onConfirm,
  title = "Digital Signature",
  description = "Please sign to confirm your submission",
  judgeName,
}: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");

  useEffect(() => {
    if (!open) {
      clearSignature();
    }
  }, [open]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0077CC";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirm = () => {
    if (signatureMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasSignature) return;

      const signature = canvas.toDataURL("image/png");
      onConfirm(signature);
      clearSignature();
    } else {
      if (!typedSignature.trim()) return;
      onConfirm(typedSignature);
      setTypedSignature("");
    }
    onClose();
  };

  const canConfirm = signatureMode === "draw" ? hasSignature : typedSignature.trim().length > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Set drawing style
    ctx.strokeStyle = "#0077CC";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A]">{title}</DialogTitle>
          <DialogDescription className="text-[#4A4A4A]">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={signatureMode} onValueChange={(v) => setSignatureMode(v as "draw" | "type")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Draw
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Type
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="space-y-4">
              <Label className="text-[#1A1A1A]">Draw Your Signature</Label>
              <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg bg-[#F5F7FA] relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-[200px] cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-[#4A4A4A] text-sm">Sign here</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={clearSignature}
                  variant="outline"
                  size="sm"
                  className="border-[#E0E0E0]"
                  disabled={!hasSignature}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <p className="text-xs text-[#4A4A4A]">
                  {hasSignature ? "Signature captured" : "Please provide your signature"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="type" className="space-y-4">
              <Label className="text-[#1A1A1A]">Type Your Signature</Label>
              <Input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder={judgeName || "Enter your full name"}
                className="text-lg font-signature"
                autoFocus
              />
              <p className="text-xs text-[#4A4A4A]">
                Type your full name as your digital signature
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#E0E0E0]"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#0077CC] hover:bg-[#005FA3]"
            disabled={!canConfirm}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm & Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

