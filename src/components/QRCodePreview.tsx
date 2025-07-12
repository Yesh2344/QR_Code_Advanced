import { useState } from "react";

interface QRCodePreviewProps {
  qrCodeUrl: string;
  onDownload: (format: "png" | "svg") => void;
  onSave: () => void;
  title?: string;
}

export function QRCodePreview({ qrCodeUrl, onDownload, onSave, title }: QRCodePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'QR Code',
          url: qrCodeUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      copyToClipboard();
    }
  };

  if (!qrCodeUrl) {
    return (
      <div className="w-[300px] h-[300px] border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500">
        Enter content to generate QR code
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <img
          src={qrCodeUrl}
          alt="QR Code"
          className="border border-gray-200 rounded cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setIsFullscreen(true)}
        />
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded text-xs hover:bg-opacity-70"
        >
          🔍
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => onDownload("png")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          📥 PNG
        </button>
        <button
          onClick={() => onDownload("svg")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          📥 SVG
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          💾 Save
        </button>
        <button
          onClick={shareQRCode}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
        >
          📤 Share
        </button>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-2xl max-h-full">
            <img
              src={qrCodeUrl}
              alt="QR Code - Fullscreen"
              className="max-w-full max-h-full rounded"
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-white text-black p-2 rounded-full hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
