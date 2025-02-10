import {ChevronDownIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Grid, Stack, TextInput} from '@sanity/ui'
import {styled} from 'styled-components'

// Styled Components
export const StyledComponents = {
  SearchInput: styled(TextInput)`
    position: sticky;
    flex: 1;
    top: 0;
    z-index: 1;
  `,

  SearchInputContainer: styled(Flex)`
    display: flex;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem 0;
  `,

  InputWrapper: styled.div`
    width: 70%;
    padding-right: 0.5rem;
  `,

  ButtonWrapper: styled.div`
    width: 30%;
    // padding-left: 0.5rem;
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
      align-items: center
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
    `,

  ImageContainer: styled.div`
    border: 2px solid transparent;
    transition: border-color 0.2s ease-in-out;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;

    &:hover {
      border-color: var(--card-focus-ring-color);
    }
  `,
  DialogContent: styled(Stack)`
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,

  ContentContainer: styled(Card)`
    flex: 1;
    min-height: 0; /* Critical for nested flex scroll */
    background-color: var(--card-bg-color);
    border: 1px solid var(--card-border-color);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,

  EmptyState: styled(Flex)`
    flex: 1;
    min-height: 400px;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
    color: var(--card-muted-fg-color);
  `,

  LoadingState: styled(Flex)`
    flex: 1;
    min-height: 400px;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
  `,

  GridWrapper: styled(Flex)`
    flex: 1;
    min-height: 0; /* Critical for nested flex scroll */
    width: 100%;
    overflow: hidden;
  `,

  ImageGrid: styled(Grid)`
    padding: 1rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
    width: 100%;
    height: 100%;
    overflow-y: scroll; /* Changed from auto to ensure scrolling */
    overflow-x: hidden;

    /* Maintain grid alignment */
    align-items: start;
    align-content: start;

    /* Ensure grid takes full height */
    min-height: min-content;

    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      margin: 0.5rem;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--card-border-color);
      border-radius: 3px;

      &:hover {
        background: var(--card-shadow-color);
      }
    }

    /* Firefox scrollbar styling */
    scrollbar-width: thin;
    scrollbar-color: var(--card-border-color) transparent;

    @media (max-width: 480px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `,

  ImageCard: styled(Card)`
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    transition:
      transform 0.2s ease-in-out,
      box-shadow 0.2s ease-in-out;
    cursor: pointer;
    background-color: var(--card-code-bg-color);
    padding: 0.75rem;
    border: 1px solid var(--card-border-color);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--card-shadow-umbra-color) 0px 4px 8px;
    }
  `,

  ImageWrapper: styled(Flex)`
    position: relative;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    overflow: hidden;
    background-color: var(--card-bg-color);
  `,

  StyledImage: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 3px;
  `,

  CollapsibleHeader: styled(Button)`
    width: 100%;
    padding: 0.5rem 0;
    border: none;
    background: none;
    border-top: 1px solid var(--card-border-color);
    margin-top: 1rem;

    &:hover {
      background: none;
      opacity: 0.8;
    }
  `,

  HeaderContent: styled(Flex)`
    width: 100%;
    justify-content: space-between;
    align-items: center;
  `,

  ChevronIcon: styled(ChevronDownIcon)<{$isOpen: boolean}>`
    transform: rotate(${({$isOpen}) => ($isOpen ? '180deg' : '0deg')});
    transition: transform 0.2s ease;
  `,

  CollapsibleContent: styled(Box)<{$isOpen: boolean}>`
    padding: ${({$isOpen}) => ($isOpen ? '1rem 0' : '0')};
    height: ${({$isOpen}) => ($isOpen ? 'auto' : '0')};
    overflow: hidden;
    opacity: ${({$isOpen}) => ($isOpen ? '1' : '0')};
    transition: all 0.2s ease-in-out;
  `,
}
