import {ArrowRightIcon, SearchIcon} from '@sanity/icons'
import {
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Label,
  Select,
  Spinner,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeProvider,
} from '@sanity/ui'
import {type ChangeEvent, memo, useCallback, useState} from 'react'
import styled from 'styled-components'

// Constants
const ASPECT_RATIOS = [
  {value: '1:1', label: 'Square (1:1)'},
  {value: '16:9', label: 'Landscape (16:9)'},
  {value: '4:3', label: 'Standard (4:3)'},
  {value: '3:2', label: 'Classic (3:2)'},
] as const

const IMAGE_COUNT_OPTIONS = [
  {value: 1, label: '1 Image'},
  {value: 2, label: '2 Images'},
  {value: 3, label: '3 Images'},
  {value: 4, label: '4 Images'},
] as const

interface ImageGenerationOptions {
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:2'
  numberOfImages: 1 | 2 | 3 | 4
  negativePrompt: string
  enhancePrompt: boolean
}

const DEFAULT_OPTIONS: ImageGenerationOptions = {
  aspectRatio: '1:1',
  numberOfImages: 1,
  negativePrompt: '',
  enhancePrompt: true,
}

const API_ENDPOINT = 'http://localhost:3000/api/ai-image'

// Types

interface GenerateImageResponse {
  images: string[]
  metadata: {
    prompt: string
    aspectRatio: string
    model: string
    generatedAt: string
  }
}

interface ImageAssetSourceProps {
  onClose: () => void
  onSelect?: (image: string) => void
}

// Styled Components
const StyledComponents = {
  SearchInput: styled(TextInput)`
    position: sticky;
    flex: 1;
    top: 0;
    z-index: 1;
  `,

  SearchInputContainer: styled(Flex)`
    display: flex;
    gap: 1rem;
    width: 100%;
    padding: 1rem 0;
  `,

  InputWrapper: styled.div`
    width: 70%;
    padding-right: 0.5rem;
  `,

  ButtonWrapper: styled.div`
    width: 30%;
    padding-left: 0.5rem;
  `,

  OptionsContainer: styled(Stack)`
    border-top: 1px solid var(--card-border-color);
    margin-top: 1rem;
    padding-top: 1rem;
  `,

  OptionGrid: styled(Grid)`
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  `,

  OptionWrapper: styled(Flex)`
    align-items: center;
    gap: 0.5rem;
  `,

  LoadingContainer: styled(Flex)`
    width: 100%;
    height: 200px;
    align-items: center;
    justify-content: center;
    background-color: var(--card-bg-color);
    border-radius: 4px;
  `,

  GenerateButtonContent: styled(Flex)`
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
  `,

  ImageContainer: styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    width: 100%;
    padding: 1rem 0;
  `,
  ContentContainer: styled(Card)`
    min-height: 300px;
    width: 100%;
    background-color: var(--card-bg-color);
    border: 1px solid var(--card-border-color);
    border-radius: 4px;
    overflow: hidden;
  `,

  EmptyState: styled(Flex)`
    height: 300px;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
    color: var(--card-muted-fg-color);
  `,

  LoadingState: styled(Flex)`
    height: 300px;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
  `,

  ImageGrid: styled(Grid)`
    padding: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    width: 100%;
  `,

  ImageCard: styled(Card)`
    aspect-ratio: 1;
    overflow: hidden;
    transition: transform 0.2s ease-in-out;
    cursor: pointer;

    &:hover {
      transform: scale(1.02);
    }
  `,

  ImageWrapper: styled(Flex)`
    position: relative;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  `,

  StyledImage: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 3px;
  `,
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
}: {
  images: string[]
  onSelect?: (image: string) => void
}) {
  const handleImageClick = useCallback(
    (image: string) => {
      if (onSelect) {
        onSelect(image)
      }
    },
    [onSelect],
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
    <StyledComponents.ImageGrid>
      {images.map((image, index) => (
        <StyledComponents.ImageCard
          key={`${index.toString()}-${image}`}
          padding={2}
          radius={2}
          shadow={1}
          onClick={() => handleImageClick(image)}
        >
          <StyledComponents.ImageWrapper>
            <StyledComponents.StyledImage
              src={`data:image/png;base64,${image}`}
              alt={`Generated image ${index + 1}`}
              loading="lazy"
            />
          </StyledComponents.ImageWrapper>
        </StyledComponents.ImageCard>
      ))}
    </StyledComponents.ImageGrid>
  )
})

export function ImageAssetSource({onClose, onSelect}: ImageAssetSourceProps) {
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
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: options.enhancePrompt
            ? `${query}, high quality, detailed, professional photography`
            : query,
          aspectRatio: options.aspectRatio,
          numberOfImages: options.numberOfImages,
          ...(options.negativePrompt && {negativePrompt: options.negativePrompt}),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data: GenerateImageResponse = await response.json()
      setImages(data.images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setIsLoading(false)
    }
  }, [query, options])

  // Render helpers
  const renderGenerationOptions = () => (
    <StyledComponents.OptionsContainer space={4}>
      <Text weight="semibold" size={1}>
        Generation Options
      </Text>

      <StyledComponents.OptionGrid>
        <Stack space={3}>
          <Label size={1}>Aspect Ratio</Label>
          <Select
            value={options.aspectRatio}
            onChange={(e) =>
              handleOptionChange(
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
          <Label size={1}>Number of Images</Label>
          <Select
            value={options.numberOfImages}
            onChange={(e) =>
              handleOptionChange(
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
            onChange={(e) => handleOptionChange('negativePrompt', e.currentTarget.value)}
            placeholder="Elements to avoid in the image"
            disabled={isLoading}
          />
        </Stack>

        <Stack space={3}>
          <div style={{padding: '0.5rem 0'}} />
          <StyledComponents.OptionWrapper>
            <Switch
              checked={options.enhancePrompt}
              onChange={(e) => handleOptionChange('enhancePrompt', e.currentTarget.checked)}
              disabled={isLoading}
            />
            <Label size={1}>Enhance prompt quality</Label>
          </StyledComponents.OptionWrapper>
        </Stack>
      </StyledComponents.OptionGrid>
    </StyledComponents.OptionsContainer>
  )

  const renderContent = useCallback(() => {
    return (
      <StyledComponents.ContentContainer>
        {isLoading ? (
          <LoadingStateContent />
        ) : (
          <ImageGridContent images={images} onSelect={onSelect} />
        )}
      </StyledComponents.ContentContainer>
    )
  }, [isLoading, images, onSelect])

  return (
    <ThemeProvider>
      <Dialog
        animate
        id="ai-image-asset-source"
        header="Generate image with AI"
        onClose={onClose}
        open
        width={4}
        padding={4}
      >
        <Stack space={4} paddingX={4} paddingBottom={4}>
          <StyledComponents.SearchInputContainer>
            <StyledComponents.InputWrapper>
              <StyledComponents.SearchInput
                label="Prompt"
                placeholder="Enter a prompt to generate an image"
                icon={SearchIcon}
                clearButton
                value={query}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </StyledComponents.InputWrapper>
            <StyledComponents.ButtonWrapper>
              <Button
                textAlign="center"
                onClick={generateImage}
                style={{width: '100%'}}
                disabled={isLoading}
                tone={error ? 'critical' : 'default'}
              >
                <StyledComponents.GenerateButtonContent>
                  {isLoading ? <Spinner /> : <ArrowRightIcon />}
                  <Text size={2}>{isLoading ? 'Generating...' : 'Generate'}</Text>
                </StyledComponents.GenerateButtonContent>
              </Button>
            </StyledComponents.ButtonWrapper>
          </StyledComponents.SearchInputContainer>

          {renderGenerationOptions()}

          {error && (
            <Text size={1} style={{color: 'red'}}>
              {error}
            </Text>
          )}

          {renderContent()}
        </Stack>
      </Dialog>
    </ThemeProvider>
  )
}
