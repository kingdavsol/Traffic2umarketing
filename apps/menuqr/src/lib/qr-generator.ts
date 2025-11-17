import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate QR code as data URL (for display in browser)
 */
export async function generateQRCodeDataURL(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 512,
    margin = 2,
    errorCorrectionLevel = 'H',
    color = { dark: '#000000', light: '#FFFFFF' },
  } = options;

  try {
    const dataURL = await QRCode.toDataURL(url, {
      errorCorrectionLevel,
      type: 'image/png',
      width: size,
      margin,
      color,
    });

    return dataURL;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as buffer (for download/save)
 */
export async function generateQRCodeBuffer(
  url: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const {
    size = 1024,
    margin = 2,
    errorCorrectionLevel = 'H',
    color = { dark: '#000000', light: '#FFFFFF' },
  } = options;

  try {
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel,
      width: size,
      margin,
      color,
    });

    return buffer;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate printable QR code with menu name label
 */
export async function generatePrintableQRCode(
  url: string,
  menuName: string,
  restaurantName: string,
  options: QRCodeOptions = {}
): Promise<string> {
  // This returns a data URL for a QR code
  // In a full implementation, you'd use canvas to add text labels
  // For now, we'll just return the QR code
  return generateQRCodeDataURL(url, { ...options, size: 800 });
}
