export interface GenerateImageResponse {
  images: string[]
  metadata: {
    prompt: string
    aspectRatio: string
    model: string
    generatedAt: string
  }
}

export interface ImageGenerationOptions {
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:2'
  numberOfImages: 1 | 2 | 3 | 4
  negativePrompt: string
  enhancePrompt: boolean
  size: 'small' | 'medium' | 'large' | 'extra-large'
}
