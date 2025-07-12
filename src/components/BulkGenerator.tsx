import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface BulkItem {
  id: string;
  type: string;
  content: string;
  title?: string;
}

export function BulkGenerator() {
  const [csvText, setCsvText] = useState("");
  const [items, setItems] = useState<BulkItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const saveQRCode = useMutation(api.qrCodes.saveQRCode);

  const parseCsv = () => {
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      if (!headers.includes('type') || !headers.includes('content')) {
        toast.error("CSV must include 'type' and 'content' columns");
        return;
      }

      const parsed = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const item: any = { id: `bulk-${index}` };
        
        headers.forEach((header, i) => {
          item[header] = values[i] || '';
        });
        
        return item;
      }).filter(item => item.type && item.content);

      setItems(parsed);
      toast.success(`Parsed ${parsed.length} items`);
    } catch (error) {
      toast.error("Failed to parse CSV");
    }
  };

  const generateAll = async () => {
    setIsProcessing(true);
    let successCount = 0;
    
    for (const item of items) {
      try {
        await saveQRCode({
          type: item.type,
          content: item.content,
          title: item.title || `Bulk ${item.type}`,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to save item ${item.id}:`, error);
      }
    }
    
    setIsProcessing(false);
    toast.success(`Generated ${successCount} QR codes`);
    setItems([]);
    setCsvText("");
  };

  const downloadTemplate = () => {
    const template = "type,content,title\ntext,Hello World,Sample Text\nurl,https://example.com,Example Website\nemail,test@example.com,Contact Email";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-bulk-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Bulk Generator</h3>
        <button
          onClick={downloadTemplate}
          className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          📥 Download Template
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            CSV Data (type, content, title)
          </label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="type,content,title&#10;text,Hello World,Sample Text&#10;url,https://example.com,Example Website"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={parseCsv}
            disabled={!csvText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Parse CSV
          </button>
          
          {items.length > 0 && (
            <button
              onClick={generateAll}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Generating..." : `Generate ${items.length} QR Codes`}
            </button>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Preview ({items.length} items)</h4>
            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
              {items.slice(0, 5).map((item) => (
                <div key={item.id} className="text-sm py-1">
                  <span className="font-medium capitalize">{item.type}</span>: {item.content.substring(0, 50)}
                  {item.content.length > 50 && "..."}
                </div>
              ))}
              {items.length > 5 && (
                <div className="text-sm text-gray-500 py-1">
                  ... and {items.length - 5} more items
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
