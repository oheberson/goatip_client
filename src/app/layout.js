import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicThemeColor } from "@/components/dynamic-theme-color";
import { ManifestUpdater } from "@/components/manifest-updater";

export const metadata = {
  title: "Goatip - Fantasy Soccer Helper",
  description:
    "Create the best fantasy soccer teams with player analysis and formation optimization",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Goatip",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="icon"
          type="image/png"
          sizes="196x196"
          href="/favicon-196.png"
        />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Goatip" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DynamicThemeColor />
          <ManifestUpdater />
          <div className="mobile-container">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
