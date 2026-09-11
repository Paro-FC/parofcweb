import localFont from "next/font/local";

export const calSans = localFont({
  src: [
    {
      path: "../../public/fonts/CalSansUI-UILight.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/CalSansUI-UIRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/CalSansUI-UISemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-calsans",
  display: "swap",
});
