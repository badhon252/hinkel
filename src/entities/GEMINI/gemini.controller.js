import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateLineArtPreview = async (req, res) => {
  try {
    const { image, type, prompt: customPrompt } = req.body;
    if (!type) return res.status(400).json({ error: 'No type provided' });
    if (!image)
      return res.status(400).json({ error: 'No image data provided' });

    const promptMap = {
      kids:
        'Category Style: Children’s coloring book. Use very thick, bold, and rounded outlines. Simplify all shapes into friendly, large, and easy-to-color forms. Remove all fine details and focus on simplicity.',
      pets:
        'Category Style: Pet coloring book. Use medium-thick outlines. Preserve the pet’s unique features and breed characteristics from the image. Simplify fur into a few clean, elegant strokes while keeping the animal recognizable.',
      memory:
        'Category Style: Keepsake coloring book. High fidelity is crucial. Accurately trace the people, poses, and expressions from the original photo. Simplify the environment into clean white space while keeping the subjects recognizable.',
      adults:
        'Category Style: Adult coloring book. Use clean, detailed, and consistent outlines. Focus on elegant patterns and precise shapes from the input image. Maintain a professional "technical pen" aesthetic with fine-to-medium line weights.'
    };

    const selectedType =
      type && promptMap[type.toLowerCase()] ? type.toLowerCase() : 'kids';

    const baseQualityPrompt = `
Task: Convert the uploaded image into a high-quality, printable black-and-white coloring book page.

Strict Requirements:
1. OUTPUT: Clean black-and-white line art only.
2. SUBJECT: Strictly preserve the main subject, characters, and pose from the uploaded image. The output must be clearly recognizable as the original subject.
3. LINES: Use solid, crisp, and continuous black outlines. Ensure lines are bold enough to be clearly visible and printable.
4. BACKGROUND: Pure white background. Remove all background clutter and distractions unless they are essential subjects.
5. NO SHADING: Absolute prohibition of grayscale, shading, shadows, gradients, or textures.
6. NO FILL: No large filled black areas. All shapes must be open and ready to be colored.
7. NO ARTIFACTS: No color, no photorealism, no text, no watermarks, and no frames.
`;

    const prompt = [
      baseQualityPrompt,
      promptMap[selectedType],
      customPrompt ? `Additional user instruction: ${customPrompt}` : ''
    ]
      .filter(Boolean)
      .join('\n\n');

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview'
    });

    const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
    const base64Data = image.split(',')[1] || image;

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['IMAGE']
      }
    });

    const response = await result.response;

    const candidate = response.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find((p) => p.inlineData);

    if (imagePart) {
      const base64Response = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      return res.json({ previewUrl: base64Response });
    }

    const finishReason = candidate?.finishReason;
    console.error('Gemini Generation Failed. Finish Reason:', finishReason);

    res.status(500).json({
      error: 'Model did not return an image.',
      reason: finishReason || 'Unknown',
      suggestion:
        finishReason === 'SAFETY'
          ? 'The image was flagged by safety filters. Try a different image or simpler prompt.'
          : 'Check your prompt or model choice.'
    });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: error.message });
  }
};
//test
