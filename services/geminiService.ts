import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Converts a base64 string (data:image/...) to a raw base64 string without the prefix
 */
const cleanBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

/**
 * Converts a Blob to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateMockup = async (
  logoBase64: string,
  productType: string,
  customInstruction: string = ''
): Promise<string> => {
  try {
    const logoData = cleanBase64(logoBase64);
    
    // Construct a specific prompt for merchandise mockup
    const prompt = `
      Create a high-quality, photorealistic product shot of a ${productType}.
      Place the provided logo design onto the product naturally.
      The product should be well-lit and look like a professional e-commerce photo.
      ${customInstruction ? `Additional instructions: ${customInstruction}` : ''}
      Ensure the logo is clearly visible and centered where appropriate for the item.
      Return only the image.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for logo uploads usually
              data: logoData
            }
          },
          { text: prompt }
        ]
      }
    });

    // Extract the image from the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating mockup:", error);
    throw error;
  }
};

export const editMockup = async (
  imageBase64: string,
  editPrompt: string
): Promise<string> => {
  try {
    const imageData = cleanBase64(imageBase64);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageData
            }
          },
          { text: `Edit this image: ${editPrompt}. Maintain the core product and logo visibility, but apply the requested changes.` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No edited image generated.");
  } catch (error) {
    console.error("Error editing mockup:", error);
    throw error;
  }
};
