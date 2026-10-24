import localFont from "next/font/local";
import "./globals.css";

const monaSans = localFont({
  src: "./fonts/MonaSans.woff2",
  variable: "--font-mona",
  weight: "200 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 125%" }],
});

export const metadata = {
  title: {
    default: "Fomi Step Editor",
    template: "%s · Fomi",
  },
  description:
    "Edit once, apply to the whole shoot, and nothing you lock can change.",
};

export const viewport = {
  themeColor: "#f7f7f4",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={monaSans.variable}>
      <body className="font-sans">
        <a
          href="#main"
          className="fixed top-2 left-2 z-50 -translate-y-16 rounded-button bg-ink px-4 py-2 text-ui font-semibold text-white transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
