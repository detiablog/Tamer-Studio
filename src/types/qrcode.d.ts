declare module "qrcode" {
  interface QRCodeToFileOptions {
    type?: "image/png" | "image/jpeg" | "image/svg+xml";
    quality?: number;
    margin?: number;
    width?: number;
    scalable?: boolean;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  function toDataURL(text: string, options?: QRCodeToFileOptions): Promise<string>;
  function toString(text: string, options?: QRCodeToFileOptions & { type?: "utf8" }): Promise<string>;
  function toFile(path: string, text: string, options?: QRCodeToFileOptions): Promise<void>;
  function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeToFileOptions): Promise<void>;
}
