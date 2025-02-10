import {SparklesIcon} from '@sanity/icons'
import type {AssetSource} from 'sanity'

import {ImageAssetSource} from './components/image-asset-source'

export function getAIImagePlugin(route: string): AssetSource {
  return {
    name: 'sanity-image-gen',
    title: 'Generate Image',
    icon: SparklesIcon,
    component: (props) => <ImageAssetSource {...props} route={route} />,
  }
}
