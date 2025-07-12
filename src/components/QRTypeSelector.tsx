interface QRType {
  value: string;
  label: string;
  icon: string;
  description: string;
}

const QR_TYPES: QRType[] = [
  { value: "text", label: "Text", icon: "📝", description: "Plain text content" },
  { value: "url", label: "URL", icon: "🔗", description: "Website links" },
  { value: "email", label: "Email", icon: "📧", description: "Pre-composed emails" },
  { value: "sms", label: "SMS", icon: "💬", description: "Text messages" },
  { value: "phone", label: "Phone", icon: "📞", description: "Direct dial numbers" },
  { value: "wifi", label: "Wi-Fi", icon: "📶", description: "Network credentials" },
  { value: "vcard", label: "Contact", icon: "👤", description: "Digital business cards" },
];

interface QRTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
}

export function QRTypeSelector({ value, onChange }: QRTypeSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-3">QR Code Type</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {QR_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              value === type.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="text-lg mb-1">{type.icon}</div>
            <div className="font-medium text-sm">{type.label}</div>
            <div className="text-xs text-gray-500 mt-1">{type.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
