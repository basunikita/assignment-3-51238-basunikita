import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import ToastProvider from "./components/ToastProvider";
import { RecipeProvider } from "./design-system/RecipeContext";
import { PLATE_ROOM_RECIPE } from "./design-system/recipes/plate-room";
import { PLATE_ROOM_FONTS } from "./fonts";
import "./globals.css";
import { moodStyle, PLATE_ROOM } from "./theme";

export const metadata: Metadata = {
  title: "Plate Log",
  description: "Log every set of your gym routine, see what you lifted last time, and watch your max weight climb.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${PLATE_ROOM_FONTS} min-h-dvh bg-bg font-body text-ink antialiased`} style={moodStyle(PLATE_ROOM)}>
        <RecipeProvider recipe={PLATE_ROOM_RECIPE}>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </RecipeProvider>
      </body>
    </html>
  );
}
