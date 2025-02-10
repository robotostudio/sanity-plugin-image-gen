import {ArrowRightIcon, SearchIcon} from '@sanity/icons'
import {Button, Dialog, Flex, Stack, Text, TextInput, ThemeProvider} from '@sanity/ui'
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

type ImageAssetSourceProps = {
  onClose: () => void
  //   onGenerate: () => void
  //   onSelect: (image: any) => void
}

export function ImageAssetSource({onClose}: ImageAssetSourceProps) {
  const [query, setQuery] = useState('')

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value)
  }

  const handleGenerate = () => {
    console.log('query', query)
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
              />
            </InputWrapper>
            <ButtonWrapper>
              <Button
                textAlign="center"
                onClick={handleGenerate}
                text="Generate"
                style={{width: '100%'}}
                icon={ArrowRightIcon}
              />
            </ButtonWrapper>
          </SearchInputContainer>
          <Text size={1} muted>
            No results found
          </Text>
        </Stack>
      </Dialog>
    </ThemeProvider>
  )
}
