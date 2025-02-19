/* eslint-disable @typescript-eslint/no-explicit-any */
import {SearchIcon} from '@sanity/icons'
import {
  Button,
  Dialog,
  Grid,
  Label,
  Select,
  Spinner,
  Stack,
  Text,
  TextInput,
  ThemeProvider,
} from '@sanity/ui'
import {type ChangeEvent, memo, useCallback, useState} from 'react'
import type {AssetFromSource} from 'sanity'

import {ASPECT_RATIOS, DEFAULT_OPTIONS, IMAGE_COUNT_OPTIONS, SIZE_OPTIONS} from '../constant'
import type {GenerateImageResponse, ImageGenerationOptions} from '../types'
import {StyledComponents} from './image-asset-source-styles'

interface ImageAssetSourceProps {
  onClose: () => void
  onSelect?: (image: AssetFromSource[]) => void
  route: string
}

// Add this component for the loading state
const LoadingStateContent = memo(function LoadingStateContent() {
  return (
    <StyledComponents.LoadingState>
      <Spinner />
      <Text size={1} muted>
        Generating your images...
      </Text>
    </StyledComponents.LoadingState>
  )
})

// Add this component for the image grid
const ImageGridContent = memo(function ImageGridContent({
  images,
  onSelect,
  prompt,
}: {
  images: string[]
  onSelect?: (image: AssetFromSource[]) => void
  prompt: string
}) {
  const handleImageClick = useCallback(
    (image: string) => {
      if (onSelect) {
        onSelect([
          {
            kind: 'base64',
            value: image,
            assetDocumentProps: {
              _type: 'sanity.imageAsset',
              description: prompt,
              creditLine: 'Generated image by Sanity AI Image Plugin',
              title: prompt,
            },
          } as unknown as AssetFromSource,
        ])
      }
    },
    [onSelect, prompt],
  )

  if (!images.length) {
    return (
      <StyledComponents.EmptyState>
        <SearchIcon style={{width: 32, height: 32, opacity: 0.5}} />
        <Stack space={2}>
          <Text align="center" size={2} weight="semibold">
            No images generated
          </Text>
          <Text align="center" size={1} muted>
            Enter a prompt and click generate to create images
          </Text>
        </Stack>
      </StyledComponents.EmptyState>
    )
  }

  return (
    <StyledComponents.GridWrapper style={{minHeight: '400px'}}>
      <Grid columns={[1, 2]} gap={[1, 1, 2, 3]} padding={4}>
        {images.map((image, index) => (
          <div
            key={`${index.toString()}-${image}`}
            onClick={() => handleImageClick(`data:image/png;base64,${image}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleImageClick(`data:image/png;base64,${image}`)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <img
              src={`data:image/png;base64,${image}`}
              alt={`${prompt} index ${index.toString() + 1}`}
              loading="lazy"
              style={{
                width: '100%',
                display: 'block',
              }}
            />
          </div>
        ))}
      </Grid>
    </StyledComponents.GridWrapper>
  )
})

// Add this component for the options accordion
const GenerationOptionsAccordion = memo(function GenerationOptionsAccordion({
  options,
  onOptionChange,
  isLoading,
}: {
  options: ImageGenerationOptions
  onOptionChange: <K extends keyof ImageGenerationOptions>(
    key: K,
    value: ImageGenerationOptions[K],
  ) => void
  isLoading: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Stack space={4}>
      <StyledComponents.CollapsibleHeader
        onClick={() => setIsOpen(!isOpen)}
        mode="ghost"
        style={{borderTop: 'none'}}
      >
        <StyledComponents.HeaderContent>
          <Text weight="semibold" size={1}>
            Advanced Options
          </Text>
          <StyledComponents.ChevronIcon $isOpen={isOpen} />
        </StyledComponents.HeaderContent>
      </StyledComponents.CollapsibleHeader>

      <StyledComponents.CollapsibleContent $isOpen={isOpen}>
        <StyledComponents.OptionGrid>
          <Stack space={3}>
            <Label size={1}>Aspect Ratio</Label>
            <Select
              value={options.aspectRatio}
              onChange={(e) =>
                onOptionChange(
                  'aspectRatio',
                  e.currentTarget.value as ImageGenerationOptions['aspectRatio'],
                )
              }
              disabled={isLoading}
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack space={3}>
            <Label size={1}>Image Size</Label>
            <Select
              value={options.size}
              onChange={(e) =>
                onOptionChange('size', e.currentTarget.value as ImageGenerationOptions['size'])
              }
              disabled={isLoading}
            >
              {SIZE_OPTIONS.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack space={3}>
            <Label size={1}>Number of Images</Label>
            <Select
              value={options.numberOfImages}
              onChange={(e) =>
                onOptionChange(
                  'numberOfImages',
                  Number(e.currentTarget.value) as ImageGenerationOptions['numberOfImages'],
                )
              }
              disabled={isLoading}
            >
              {IMAGE_COUNT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack space={3}>
            <Label size={1}>Negative Prompt</Label>
            <TextInput
              value={options.negativePrompt}
              onChange={(e) => onOptionChange('negativePrompt', e.currentTarget.value)}
              placeholder="Elements to avoid in the image"
              disabled={isLoading}
            />
          </Stack>
        </StyledComponents.OptionGrid>
      </StyledComponents.CollapsibleContent>
    </Stack>
  )
})

export function ImageAssetSource({onClose, onSelect, route}: ImageAssetSourceProps) {
  // State
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<ImageGenerationOptions>(DEFAULT_OPTIONS)

  // Handlers
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value)
    setError(null)
  }, [])

  const handleOptionChange = useCallback(
    <K extends keyof ImageGenerationOptions>(key: K, value: ImageGenerationOptions[K]) => {
      setOptions((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    [],
  )

  const generateImage = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: query,
          aspectRatio: options.aspectRatio,
          numberOfImages: options.numberOfImages,
          size: options.size,
          ...(options.negativePrompt && {
            negativePrompt: options.negativePrompt,
          }),
        }),
      })

      if (!response.ok) {
        throw new Error(response.statusText)
      }

      const data: GenerateImageResponse = await response.json()
      if (!data?.images?.length) {
        throw new Error('No images generated')
      }
      setImages(data?.images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setIsLoading(false)
    }
  }, [query, options, route])

  // Replace renderGenerationOptions with this
  const renderGenerationOptions = useCallback(() => {
    return (
      <GenerationOptionsAccordion
        options={options}
        onOptionChange={handleOptionChange}
        isLoading={isLoading}
      />
    )
  }, [options, handleOptionChange, isLoading])

  const renderContent = useCallback(() => {
    return (
      <StyledComponents.ContentContainer>
        {isLoading ? (
          <LoadingStateContent />
        ) : (
          <ImageGridContent images={images} onSelect={onSelect} prompt={query} />
        )}
      </StyledComponents.ContentContainer>
    )
  }, [isLoading, images, onSelect, query])

  return (
    <ThemeProvider>
      <Dialog
        animate
        id="ai-image-asset-source"
        header="Generate image with AI"
        onClose={onClose}
        open
        width={3}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            generateImage()
          }}
        >
          <StyledComponents.DialogContent padding={4}>
            <StyledComponents.SearchInputContainer>
              <StyledComponents.InputWrapper>
                <StyledComponents.SearchInput
                  label="Prompt"
                  placeholder="Enter a prompt to generate an image"
                  icon={SearchIcon}
                  clearButton={query !== ''}
                  onClear={() => setQuery('')}
                  value={query}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </StyledComponents.InputWrapper>
              <StyledComponents.ButtonWrapper>
                <Button
                  type="submit"
                  textAlign="center"
                  text={isLoading ? 'Generating...' : 'Generate'}
                  style={{width: '100%'}}
                  disabled={isLoading}
                  tone={error ? 'critical' : 'default'}
                />
              </StyledComponents.ButtonWrapper>
            </StyledComponents.SearchInputContainer>

            {renderGenerationOptions()}

            {error && (
              <Text size={1} style={{color: 'red'}}>
                {error}
              </Text>
            )}

            {renderContent()}
          </StyledComponents.DialogContent>
        </form>
      </Dialog>
    </ThemeProvider>
  )
}
