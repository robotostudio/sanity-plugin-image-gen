import {SparklesIcon} from '@sanity/icons'
import type {AssetSourceComponentProps} from 'sanity'

import {ImageAssetSource} from './components/image-asset-source'

export const getAIImagePlugin = (route: string) => {
  const HOC = (args: AssetSourceComponentProps & {route: string}) => (
    <ImageAssetSource {...args} route={route} />
  )
  return {
    name: 'sanity-image-gen',
    title: 'Generate Image',
    icon: SparklesIcon,
    component: HOC,
  }
}
