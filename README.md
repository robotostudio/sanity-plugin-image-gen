# Sanity Plugin Image Gen

A professional-grade image generation plugin for Sanity Studio v3, enabling seamless AI-powered image creation directly within your content workflow. Built with TypeScript and integrated with modern AI image generation models.

## Features

- Enterprise-ready image generation within Sanity Studio
- Precise aspect ratio control (1:1, 16:9, 4:3, 3:2)
- Dynamic image size optimization
- Advanced prompt engineering with negative prompt support
- Multi-image generation capability
- Fully typed TypeScript implementation
- Seamless integration with Sanity's asset pipeline
- Modern React architecture with functional components

## Installation

```sh
npm install sanity-plugin-image-gen
```

## Configuration

Add the plugin to your Sanity Studio configuration:

```ts
import { defineConfig } from 'sanity'
import { imageGen } from 'sanity-plugin-image-gen'

export default defineConfig({
  // ...
  plugins: [
    imageGen({
      apiEndpoint: '/api/generate-image',
    })
  ],
})
```

### Environment Variables

Configure your AI provider credentials:

```env
REPLICATE_API_TOKEN=your_replicate_api_token
```

## Usage

The plugin seamlessly integrates into your existing Sanity Studio image fields:

1. Access any image field in your studio
2. Select the "AI Generate" option from the asset source menu
3. Enter your image description
4. Configure generation parameters (aspect ratio, size, etc.)
5. Generate and select your AI-created image

## API Integration

Create an API route in your Next.js project to handle image generation:

```ts
// app/api/generate-image/route.ts
import { createReplicate } from "@ai-sdk/replicate";
import { experimental_generateImage as generateImage } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

// Constants
const ALLOWED_MODELS = ["black-forest-labs/flux-pro", "black-forest-labs/flux-schnell"] as const;
const MAX_IMAGES_PER_REQUEST = 4;

// Types
type AspectRatio = "1:1" | "16:9" | "4:3" | "3:2";
type ImageSize = "small" | "medium" | "large" | "extra-large";
type AllowedModel = (typeof ALLOWED_MODELS)[number];
type ImageDimension = `${number}x${number}`;

interface ImageGenerationRequest {
  prompt: string;
  aspectRatio: AspectRatio;
  negativePrompt?: string;
  model: AllowedModel;
  size: ImageSize;
  numberOfImages: number;
}

interface ImageGenerationResponse {
  images: string[];
  metadata: {
    prompt: string;
    dimension: ImageDimension;
    aspectRatio: AspectRatio;
    model: AllowedModel;
    generatedAt: string;
  };
}

// Validation Schema
const GenerateImageSchema = z.object({
  prompt: z.string().min(1).max(1000).trim(),
  aspectRatio: z.enum(["1:1", "16:9", "4:3", "3:2"]).default("16:9"),
  negativePrompt: z.string().optional(),
  model: z.enum(ALLOWED_MODELS).default("black-forest-labs/flux-schnell"),
  size: z.enum(["small", "medium", "large", "extra-large"]).default("medium"),
  numberOfImages: z.number().min(1).max(MAX_IMAGES_PER_REQUEST).default(1),
});

// Image Dimension Utilities
const ASPECT_MAP: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1024, height: 576 },
  "4:3": { width: 1024, height: 768 },
  "3:2": { width: 1024, height: 683 },
} as const;

const SIZE_MAP: Record<ImageSize, number> = {
  small: 0.5,
  medium: 1,
  large: 1.5,
  "extra-large": 2,
} as const;

function getDimensions(size: ImageSize, aspect: AspectRatio): ImageDimension {
  const baseSize = ASPECT_MAP[aspect];
  const scale = SIZE_MAP[size];

  const width = Math.round(baseSize.width * scale);
  const height = Math.round(baseSize.height * scale);

  return `${width}x${height}`;
}

// Image Generation Function
async function generateImages(
  params: ImageGenerationRequest,
  apiToken: string,
): Promise<ImageGenerationResponse> {
  if (!apiToken) {
    throw new Error("Replicate API token not configured");
  }

  const replicate = createReplicate({ apiToken });
  const dimension = getDimensions(params.size, params.aspectRatio);

  const { images } = await generateImage({
    model: replicate.image(params.model, {
      maxImagesPerCall: params.numberOfImages,
    }),
    prompt: params.prompt,
    n: params.numberOfImages,
    size: dimension,
    aspectRatio: params.aspectRatio,
    ...(params.negativePrompt && {
      negative_prompt: params.negativePrompt,
    }),
  });

  return {
    images: images.map((img) => img.base64),
    metadata: {
      prompt: params.prompt,
      dimension,
      aspectRatio: params.aspectRatio,
      model: params.model,
      generatedAt: new Date().toISOString(),
    },
  };
}

// Error Handling
function handleError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Validation Error",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    console.error("[ImageGeneration]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.error("[ImageGeneration] Unknown error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

// Route Handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = GenerateImageSchema.parse(body);

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error("Replicate API token not configured");
    }

    const response = await generateImages(validatedData, apiToken);

    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
}

```

## Technical Requirements

- Node.js >= 18
- Sanity Studio v3
- React >= 18
- TypeScript (recommended)

## Development

Built with [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit) for optimal development experience:

1. Run `npm run dev` for hot-reload development
2. Use `npm run build` for production builds
3. Leverage `npm run lint` for code quality

## Support

Created and maintained by [Roboto Studio](https://robotostudio.com/contact?utm_source=sanity-plugin-image-gen). For enterprise support and consulting, [contact our team](https://robotostudio.com/contact?utm_source=sanity-plugin-image-gen).

## License

[MIT](LICENSE) © Roboto Studio
