import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";
import { QRCodePreview } from "./components/QRCodePreview";
import { QRTypeSelector } from "./components/QRTypeSelector";
import { BulkGenerator } from "./components/BulkGenerator";

interface QRCodeData {
  type: string;
  content: string;
  title?: string;
  metadata?: {
    ssid?: string;
    password?: string;
    security?: string;
    name?: string;
    phone?: string;
    email?: string;
    phoneNumber?: string;
    message?: string;
    emailTo?: string;
    subject?: string;
    body?: string;
  };
  customization?: {
    size?: number;
    color?: string;
    backgroundColor?: string;
    errorCorrection?: string;
  };
}

export function QRGenerator() {
  const [qrType, setQrType] = useState("text");
  const [showBulkGenerator, setShowBulkGenerator] = useState(false);
  const [qrData, setQrData] = useState<QRCodeData>({
    type: "text",
    content: "",
    customization: {
      size: 300,
      color: "000000",
      backgroundColor: "ffffff",
      errorCorrection: "M",
    },
  });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const saveQRCode = useMutation(api.qrCodes.saveQRCode);
  const qrHistory = useQuery(api.qrCodes.getQRHistory) || [];
  const deleteQRCode = useMutation(api.qrCodes.deleteQRCode);

  // Generate QR code URL using QR Server API
  useEffect(() => {
    if (qrData.content.trim()) {
      const encodedData = encodeURIComponent(qrData.content);
      const size = qrData.customization?.size || 300;
      const color = qrData.customization?.color || "000000";
      const bgcolor = qrData.customization?.backgroundColor || "ffffff";
      const ecc = qrData.customization?.errorCorrection || "M";
      
      setQrCodeUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&color=${color}&bgcolor=${bgcolor}&ecc=${ecc}`
      );
    } else {
      setQrCodeUrl("");
    }
  }, [qrData.content, qrData.customization]);

  const handleTypeChange = (type: string) => {
    setQrType(type);
    setQrData(prev => ({
      ...prev,
      type,
      content: "",
      title: "",
      metadata: {},
    }));
  };

  const generateContent = () => {
    switch (qrType) {
      case "wifi":
        const { ssid, password, security } = qrData.metadata || {};
        if (ssid) {
          return `WIFI:T:${security || "WPA"};S:${ssid};P:${password || ""};H:false;;`;
        }
        return "";
      case "vcard":
        const { name, phone, email } = qrData.metadata || {};
        if (name) {
          return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\n${phone ? `TEL:${phone}\n` : ""}${email ? `EMAIL:${email}\n` : ""}END:VCARD`;
        }
        return "";
      case "sms":
        const { phoneNumber, message } = qrData.metadata || {};
        if (phoneNumber) {
          return `sms:${phoneNumber}${message ? `?body=${encodeURIComponent(message)}` : ""}`;
        }
        return "";
      case "email":
        const { emailTo, subject, body } = qrData.metadata || {};
        if (emailTo) {
          const params = [];
          if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
          if (body) params.push(`body=${encodeURIComponent(body)}`);
          return `mailto:${emailTo}${params.length ? `?${params.join("&")}` : ""}`;
        }
        return "";
      case "phone":
        return qrData.content ? `tel:${qrData.content}` : "";
      default:
        return qrData.content;
    }
  };

  const updateContent = () => {
    const content = generateContent();
    setQrData(prev => ({ ...prev, content }));
  };

  useEffect(() => {
    updateContent();
  }, [qrData.metadata, qrType]);

  const handleSave = async () => {
    if (!qrData.content.trim()) {
      toast.error("Please enter content to generate QR code");
      return;
    }

    try {
      await saveQRCode({
        type: qrData.type,
        content: qrData.content,
        title: qrData.title,
        metadata: qrData.metadata,
        customization: qrData.customization,
      });
      toast.success("QR code saved to history!");
    } catch (error) {
      toast.error("Failed to save QR code");
    }
  };

  const downloadQR = async (format: "png" | "svg") => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(
        format === "svg" 
          ? qrCodeUrl.concat("&format=svg")
          : qrCodeUrl
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to download QR code");
    }
  };

  const loadFromHistory = (item: any) => {
    setQrType(item.type);
    setQrData({
      type: item.type,
      content: item.content,
      title: item.title,
      metadata: item.metadata,
      customization: item.customization || {
        size: 300,
        color: "000000",
        backgroundColor: "ffffff",
        errorCorrection: "M",
      },
    });
  };

  const handleDelete = async (id: Id<"qrCodes">) => {
    try {
      await deleteQRCode({ id });
      toast.success("QR code deleted from history");
    } catch (error) {
      toast.error("Failed to delete QR code");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Bulk Generator Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">QR Code Generator</h2>
        <button
          onClick={() => setShowBulkGenerator(!showBulkGenerator)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          {showBulkGenerator ? "Single Mode" : "Bulk Mode"}
        </button>
      </div>

      {showBulkGenerator ? (
        <BulkGenerator />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold mb-4">Generate QR Code</h3>
              
              {/* Type Selection */}
              <QRTypeSelector value={qrType} onChange={handleTypeChange} />

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={qrData.title || ""}
                  onChange={(e) => setQrData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your QR code a name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Dynamic Fields */}
              {qrType === "text" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Text Content</label>
                  <textarea
                    value={qrData.content}
                    onChange={(e) => setQrData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your text here"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {qrType === "url" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">URL</label>
                  <input
                    type="url"
                    value={qrData.content}
                    onChange={(e) => setQrData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {qrType === "phone" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={qrData.content}
                    onChange={(e) => setQrData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {qrType === "sms" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={qrData.metadata?.phoneNumber || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, phoneNumber: e.target.value }
                      }))}
                      placeholder="+1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message (optional)</label>
                    <textarea
                      value={qrData.metadata?.message || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, message: e.target.value }
                      }))}
                      placeholder="Pre-filled message text"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {qrType === "email" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={qrData.metadata?.emailTo || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, emailTo: e.target.value }
                      }))}
                      placeholder="recipient@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject (optional)</label>
                    <input
                      type="text"
                      value={qrData.metadata?.subject || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, subject: e.target.value }
                      }))}
                      placeholder="Email subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message (optional)</label>
                    <textarea
                      value={qrData.metadata?.body || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, body: e.target.value }
                      }))}
                      placeholder="Pre-filled email message"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {qrType === "wifi" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={qrData.metadata?.ssid || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, ssid: e.target.value }
                      }))}
                      placeholder="MyWiFiNetwork"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={qrData.metadata?.password || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, password: e.target.value }
                      }))}
                      placeholder="WiFi password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Security Type</label>
                    <select
                      value={qrData.metadata?.security || "WPA"}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, security: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Open Network</option>
                    </select>
                  </div>
                </div>
              )}

              {qrType === "vcard" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={qrData.metadata?.name || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, name: e.target.value }
                      }))}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={qrData.metadata?.phone || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, phone: e.target.value }
                      }))}
                      placeholder="+1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={qrData.metadata?.email || ""}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, email: e.target.value }
                      }))}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Customization Panel */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Customization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Size (px)</label>
                  <select
                    value={qrData.customization?.size || 300}
                    onChange={(e) => setQrData(prev => ({
                      ...prev,
                      customization: { ...prev.customization, size: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={200}>200x200</option>
                    <option value={300}>300x300</option>
                    <option value={400}>400x400</option>
                    <option value={500}>500x500</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Error Correction</label>
                  <select
                    value={qrData.customization?.errorCorrection || "M"}
                    onChange={(e) => setQrData(prev => ({
                      ...prev,
                      customization: { ...prev.customization, errorCorrection: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Foreground Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={`#${qrData.customization?.color || "000000"}`}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        customization: { ...prev.customization, color: e.target.value.substring(1) }
                      }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrData.customization?.color || "000000"}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        customization: { ...prev.customization, color: e.target.value.replace("#", "") }
                      }))}
                      placeholder="000000"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={`#${qrData.customization?.backgroundColor || "ffffff"}`}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        customization: { ...prev.customization, backgroundColor: e.target.value.substring(1) }
                      }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrData.customization?.backgroundColor || "ffffff"}
                      onChange={(e) => setQrData(prev => ({
                        ...prev,
                        customization: { ...prev.customization, backgroundColor: e.target.value.replace("#", "") }
                      }))}
                      placeholder="ffffff"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="flex flex-col items-center space-y-4">
                <QRCodePreview
                  qrCodeUrl={qrCodeUrl}
                  onDownload={downloadQR}
                  onSave={handleSave}
                  title={qrData.title}
                />
              </div>
            </div>
          </div>

          {/* History Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">History</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {qrHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No QR codes saved yet</p>
              ) : (
                qrHistory.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {item.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} QR`}
                        </h4>
                        <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => loadFromHistory(item)}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
