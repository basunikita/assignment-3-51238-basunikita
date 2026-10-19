import { Archivo, Big_Shoulders, Big_Shoulders_Stencil } from "next/font/google";

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-big-shoulders",
});
const bigShouldersStencil = Big_Shoulders_Stencil({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-big-shoulders-stencil",
});
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });

export const PLATE_ROOM_FONTS = `${bigShoulders.variable} ${bigShouldersStencil.variable} ${archivo.variable}`;
