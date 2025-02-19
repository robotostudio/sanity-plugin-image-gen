import type {ImageGenerationOptions} from './types'

// Constants
export const ASPECT_RATIOS = [
  {value: '1:1', label: 'Square (1:1)'},
  {value: '16:9', label: 'Landscape (16:9)'},
  {value: '4:3', label: 'Standard (4:3)'},
  {value: '3:2', label: 'Classic (3:2)'},
] as const

export const IMAGE_COUNT_OPTIONS = [
  {value: 1, label: '1'},
  {value: 2, label: '2'},
  {value: 3, label: '3'},
  {value: 4, label: '4'},
] as const

// Add size options constant after ASPECT_RATIOS
export const SIZE_OPTIONS = [
  {value: 'small', label: 'Small'},
  {value: 'medium', label: 'Medium'},
  {value: 'large', label: 'Large'},
  {value: 'extra-large', label: 'Extra Large'},
] as const

export const DEFAULT_OPTIONS: ImageGenerationOptions = {
  aspectRatio: '1:1',
  numberOfImages: 1,
  negativePrompt: '',
  enhancePrompt: true,
  size: 'medium',
}
