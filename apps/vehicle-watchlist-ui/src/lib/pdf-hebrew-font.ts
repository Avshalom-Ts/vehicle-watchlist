// Hebrew font support for jsPDF
import { jsPDF } from 'jspdf';

// Add Hebrew font support to jsPDF document
export const addHebrewFontSupport = async (doc: jsPDF): Promise<jsPDF> => {
  try {
    // Load font from local public folder
    const fontUrl = '/LinBiolinum_aBL.ttf';

    const response = await fetch(fontUrl);
    const fontArrayBuffer = await response.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(fontArrayBuffer);

    // Add font to PDF
    doc.addFileToVFS('LinBiolinum.ttf', fontBase64);
    doc.addFont('LinBiolinum.ttf', 'LinBiolinum', 'normal');

    return doc;
  } catch (error) {
    console.error('Failed to load Hebrew font:', error);
    // Fallback to courier
    doc.setFont('courier');
    return doc;
  }
};

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Function to fix Hebrew text direction for PDF (RTL support)
export const fixHebrewText = (text: string): string => {
  if (!text) return text;

  // Hebrew Unicode range
  const hebrewPattern = /[\u0590-\u05FF]/;

  // Check if text contains Hebrew
  if (!hebrewPattern.test(text)) {
    return text; // Not Hebrew, return as-is
  }

  // Split text into words and reverse each word and the order
  // This handles mixed Hebrew and numbers/English
  const words = text.split(' ');
  const reversedWords = words.map(word => {
    // Check if word contains Hebrew
    if (hebrewPattern.test(word)) {
      // Reverse Hebrew characters
      return word.split('').reverse().join('');
    }
    return word;
  });

  // Reverse word order for RTL
  return reversedWords.reverse().join(' ');
};
