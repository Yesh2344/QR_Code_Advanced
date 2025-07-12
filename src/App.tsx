import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { QRGenerator } from "./QRGenerator";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Quick QR</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Quick QR Generator</h1>
        <Authenticated>
          <p className="text-lg text-secondary">
            Generate QR codes instantly with history tracking
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-lg text-secondary mb-8">Sign in to save your QR code history</p>
          <div className="max-w-md mx-auto">
            <SignInForm />
          </div>
        </Unauthenticated>
      </div>

      <Authenticated>
        <QRGenerator />
      </Authenticated>
    </div>
  );
}
