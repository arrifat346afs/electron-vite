import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { Buffer } from '../polyfills';
// import { toast } from "sonner";

export async function generatePromptFromUrl(url: string, promptLength: string): Promise<string> {
  // Get the active API key directly from the Electron API
  if (!window.electronAPI) {
    throw new Error('Electron API is not available');
  }

  // Get all API keys
  const apiKeys = await window.electronAPI.getApiKeys();
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error('No API keys found. Please add an API key first.');
  }

  // Find the active API key
  const activeKey = apiKeys.find(key => key.isActive);
  if (!activeKey) {
    throw new Error('No active API key found. Please set an API key as active.');
  }

  console.log(`Using API key: ${activeKey.name} (${activeKey.key.substring(0, 5)}...${activeKey.key.substring(activeKey.key.length - 5)})`);

  // Simply use the model name directly from the API key
  // The name format is "Google - model-name"
  const modelNameMatch = activeKey.name.match(/Google - (.+)/);
  const modelName = modelNameMatch ? modelNameMatch[1] : "gemini-1.5-flash";

  // Log the model being used for debugging
  console.log(`Active key name: ${activeKey.name}`);
  console.log(`Using model: ${modelName}`);

  // Create the vision model with the active API key and selected model
  const visionModel = new ChatGoogleGenerativeAI({
    model: modelName,
    maxOutputTokens: 2048,
    apiKey: activeKey.key,
  });

  try {
    console.log(`Fetching image from URL: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Add additional URL validation
    const urlObj = new URL(url);
    if (urlObj.searchParams.has('exp')) {
      const expTime = parseInt(urlObj.searchParams.get('exp') || '0');
      if (expTime < Date.now() / 1000) {
        throw new Error('URL has expired. Please generate a new download link.');
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`URL does not point to an image: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Image is empty');
    }

    console.log(`Image fetched successfully: ${arrayBuffer.byteLength} bytes`);

    // Convert to base64
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    console.log('Image converted to base64');

    // Determine the image MIME type
    let mimeType = 'image/jpeg'; // Default
    if (contentType) {
      mimeType = contentType;
    }

    const input = [
      new HumanMessage({
        content: [
          {
            type: "text",
            text: `Generate a short, imaginative prompt-style description based on this image. Keep ${promptLength}, and let the image determine the theme.`,
          },
          {
            type: "image_url",
            image_url: `data:${mimeType};base64,${base64Image}`,
          },
        ],
      }),
    ];

    console.log('Sending request to Gemini API...');
    const result = await visionModel.invoke(input);
    console.log('Received response from Gemini API');

    return typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
}
