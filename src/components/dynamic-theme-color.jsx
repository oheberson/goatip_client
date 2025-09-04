"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function DynamicThemeColor() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Use resolvedTheme to get the actual theme (handles 'system' theme)
    const currentTheme = resolvedTheme || theme;
    const themeColor = currentTheme === "dark" ? "#0f172a" : "#ffffff";
    
    // Update the theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    } else {
      // Create the meta tag if it doesn't exist
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = themeColor;
      document.head.appendChild(meta);
    }

    // Update the apple-mobile-web-app-status-bar-style for iOS
    const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaStatusBar) {
      metaStatusBar.setAttribute("content", currentTheme === "dark" ? "black-translucent" : "default");
    }

    // Update the manifest theme color dynamically
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      // We can't directly modify the manifest.json file, but we can update the link
      // This is a workaround - the manifest will still have the static theme color
      // but the meta tag will override it for most browsers
    }

    // For PWA support, also update the document's theme-color
    document.documentElement.style.setProperty('--theme-color', themeColor);
  }, [theme, resolvedTheme]);

  return null; // This component doesn't render anything
}
