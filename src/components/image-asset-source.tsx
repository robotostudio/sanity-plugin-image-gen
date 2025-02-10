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
import {type ChangeEvent, useState} from 'react'
import styled from 'styled-components'

export const SearchInput = styled(TextInput)`
  position: sticky;
  flex: 1;
  top: 0;
  z-index: 1;
`

const SearchInputContainer = styled(Flex)`
  display: flex;
  gap: 1rem;
  width: 100%;
  padding: 1rem 0;
`

const InputWrapper = styled.div`
  width: 70%;
  padding-right: 0.5rem;
`

const ButtonWrapper = styled.div`
  width: 30%;
  padding-left: 0.5rem;
`

const OptionsContainer = styled(Stack)`
  border-top: 1px solid var(--card-border-color);
  margin-top: 1rem;
  padding-top: 1rem;
`

const OptionGrid = styled(Grid)`
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const OptionWrapper = styled(Flex)`
  align-items: center;
  gap: 0.5rem;
`

const LoadingContainer = styled(Flex)`
  width: 100%;
  height: 200px;
  align-items: center;
  justify-content: center;
  background-color: var(--card-bg-color);
  border-radius: 4px;
`

const GenerateButtonContent = styled(Flex)`
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
`

type ImageAssetSourceProps = {
  onClose: () => void
  //   onGenerate: () => void
  //   onSelect: (image: any) => void
}

interface GenerateImageResponse {
  images: string[]
  metadata: {
    prompt: string
    aspectRatio: string
    model: string
    generatedAt: string
  }
}

const ImageContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
  padding: 1rem 0;
`

const StyledImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
`

interface ImageGenerationOptions {
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:2'
  numberOfImages: 1 | 2 | 3 | 4
  negativePrompt: string
  enhancePrompt: boolean
}

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

export function ImageAssetSource({onClose}: ImageAssetSourceProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<ImageGenerationOptions>({
    aspectRatio: '1:1',
    numberOfImages: 1,
    negativePrompt: '',
    enhancePrompt: true,
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value)
    setError(null)
  }

  const handleOptionChange = <K extends keyof ImageGenerationOptions>(
    key: K,
    value: ImageGenerationOptions[K],
  ) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleGenerate = async () => {
    if (!query.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3000/api/ai-image', {
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
  }

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
        <Stack space={2} paddingX={4} paddingBottom={4}>
          <SearchInputContainer>
            <InputWrapper>
              <SearchInput
                label="Prompt"
                placeholder="Enter a prompt to generate an image"
                icon={SearchIcon}
                clearButton
                value={query}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </InputWrapper>
            <ButtonWrapper>
              <Button
                textAlign="center"
                onClick={handleGenerate}
                style={{width: '100%'}}
                disabled={isLoading}
                tone={error ? 'critical' : 'default'}
              >
                <GenerateButtonContent>
                  {isLoading ? <Spinner /> : <ArrowRightIcon />}
                  <Text size={2}>{isLoading ? 'Generating...' : 'Generate'}</Text>
                </GenerateButtonContent>
              </Button>
            </ButtonWrapper>
          </SearchInputContainer>

          <OptionsContainer space={4}>
            <Text weight="semibold" size={1}>
              Generation Options
            </Text>

            <OptionGrid>
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
                <OptionWrapper>
                  <Switch
                    checked={options.enhancePrompt}
                    onChange={(e) => handleOptionChange('enhancePrompt', e.currentTarget.checked)}
                    disabled={isLoading}
                  />
                  <Label size={1}>Enhance prompt quality</Label>
                </OptionWrapper>
              </Stack>
            </OptionGrid>
          </OptionsContainer>

          {error && (
            <Text size={1} style={{color: 'red'}}>
              {error}
            </Text>
          )}

          {isLoading ? (
            <LoadingContainer>
              <Stack space={3} align="center">
                <Spinner />
                <Text size={1} muted>
                  Generating your images...
                </Text>
              </Stack>
            </LoadingContainer>
          ) : images.length > 0 ? (
            <ImageContainer>
              {images.map((image, index) => (
                <Card key={`${index.toString()}-${image}`} padding={2}>
                  <StyledImage
                    src={`data:image/png;base64,${image}`}
                    alt={`Generated image ${index + 1}`}
                  />
                </Card>
              ))}
            </ImageContainer>
          ) : (
            <Text size={1} muted>
              No images generated yet
            </Text>
          )}
        </Stack>
      </Dialog>
    </ThemeProvider>
  )
}
