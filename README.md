# Quick QR Generator

A modern, full-featured QR code generator built with React, Convex, and TailwindCSS. Generate, customize, and manage QR codes with real-time history tracking and user authentication.

![Quick QR Generator](public/og-preview.png)

## ✨ Features

### 🎯 QR Code Types
- **Text** - Plain text content
- **URL** - Website links
- **Email** - Pre-composed emails with recipient, subject, and body
- **SMS** - Text messages with phone number and pre-filled message
- **Phone** - Direct dial phone numbers
- **Wi-Fi Network** - Network credentials for easy connection
- **Contact Card (vCard)** - Digital business cards



### 📱 User Experience
- **Real-time Preview** - See your QR code as you type
- **History Management** - Save, load, and delete QR codes
- **User Authentication** - Secure login with username/password
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Toast Notifications** - Clear feedback for all actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd quick-qr-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a new Convex project
   - Set up authentication
   - Deploy the backend functions
   - Generate environment variables

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Backend**: Convex (real-time database & functions)
- **Authentication**: Convex Auth
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **QR Generation**: QR Server API
- **Notifications**: Sonner

## 📁 Project Structure

```
quick-qr-generator/
├── convex/                 # Backend functions and schema
│   ├── auth.ts            # Authentication configuration
│   ├── qrCodes.ts         # QR code CRUD operations
│   └── schema.ts          # Database schema
├── src/                   # Frontend React app
│   ├── components/        # Reusable components
│   ├── QRGenerator.tsx    # Main QR generator component
│   └── App.tsx           # Root component
├── public/               # Static assets
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables
The app uses Convex for backend services. Environment variables are automatically configured when you run `npx convex dev`.

### Customizing QR Code Generation
The app uses the QR Server API for generating QR codes. You can modify the QR generation logic in `src/QRGenerator.tsx`:

```typescript
// Customize QR code URL generation
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&color=${color}&bgcolor=${bgcolor}&ecc=${ecc}`;
```

## 📊 Database Schema

The app uses a simple schema with user authentication and QR code storage:

```typescript
qrCodes: {
  userId: Id<"users">,
  type: string,           // QR code type
  content: string,        // Generated content
  title?: string,         // Optional title
  metadata?: object,      // Type-specific data
  customization?: object, // Visual customization
}
```

## 🎯 Usage Examples

### Creating a Wi-Fi QR Code
1. Select "Wi-Fi Network" from the type dropdown
2. Enter your network name (SSID)
3. Enter the password
4. Choose security type (WPA/WPA2, WEP, or Open)
5. Customize colors and size if desired
6. Download or save to history

### Creating an Email QR Code
1. Select "Email" from the type dropdown
2. Enter recipient email address
3. Optionally add subject and message
4. The QR code will open the default email app when scanned

### Bulk Operations
- Save frequently used QR codes to history
- Load previous QR codes for editing
- Delete outdated QR codes

## 🔒 Security & Privacy

- **User Authentication**: Secure login system with Convex Auth
- **Data Isolation**: Users can only access their own QR codes
- **No External Tracking**: QR codes are generated via API calls, not stored externally
- **Local Processing**: All customization happens client-side

## 🚀 Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables from your `.env.local`
4. Deploy!

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Convex Backend
Your Convex backend is automatically deployed when you run `npx convex dev` or `npx convex deploy`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Convex Docs](https://docs.convex.dev)
- **Community**: [Convex Discord](https://convex.dev/community)
- **Issues**: [GitHub Issues](https://github.com/your-username/quick-qr-generator/issues)

## 🎉 Acknowledgments

- [Convex](https://convex.dev) for the amazing backend platform
- [QR Server](https://goqr.me/api/) for QR code generation API
- [TailwindCSS](https://tailwindcss.com) for styling
- [React](https://react.dev) for the frontend framework

---

**Made with ❤️ using Convex and React**
"# QR_Code_Advanced" 

## Link

https://brilliant-sockeye-866.convex.app/
