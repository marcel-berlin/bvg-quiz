// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://bvgquiz.vercel.app",
  i18n: {
    locales: ["de", "en"],
    defaultLocale: "de",
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Public Sans",
      cssVariable: "--font-sans",
      weights: [400, 600, 800],
      subsets: ["latin"],
      display: "swap",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Atkinson Hyperlegible",
      cssVariable: "--font-display",
      weights: [400, 700],
      subsets: ["latin"],
      display: "swap",
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
