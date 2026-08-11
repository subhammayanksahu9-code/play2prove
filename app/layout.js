// ==========================================
// START - GLOBAL CSS IMPORT
// Isse poori website ki design/style load hogi
// ==========================================

import "./styles.css";
import "./globals.css";

// ==========================================
// END - GLOBAL CSS IMPORT
// ==========================================


// ==========================================
// START - WEBSITE INFORMATION
// Google/browser ko website ka naam aur description batata hai
// ==========================================

export const metadata = {
  title: "Play2Prove | Play. Compete. Earn. Prove.",
  description:
    "Play2Prove is a competitive gaming tournament platform for gamers to play, compete, earn rewards and prove their skills.",
};

// ==========================================
// END - WEBSITE INFORMATION
// ==========================================


// ==========================================
// START - MAIN WEBSITE LAYOUT
// Ye poori Play2Prove website ka main outer structure hai
// ==========================================

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// ==========================================
// END - MAIN WEBSITE LAYOUT
// ==========================================
