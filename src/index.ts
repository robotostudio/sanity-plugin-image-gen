import {definePlugin} from 'sanity'

import {getAIImagePlugin} from './plugin'

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {imageGen} from 'sanity-plugin-ai-image'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [imageGen({
 *     apiEndpoint: 'https://your-api-endpoint.com/generate'
 *   })],
 * })
 * ```
 */

type ImageGenConfig = {
  apiEndpoint: string | URL
}

export const imageGen = definePlugin<ImageGenConfig>(({apiEndpoint}) => {
  if (!apiEndpoint) throw new Error('apiEndpoint is required')
  return {
    name: 'sanity-plugin-image-gen',
    form: {
      image: {
        assetSources: (prev) => {
          const endpoint = apiEndpoint.toString()
          console.log(`Using ${endpoint} to create image from`)
          const plugin = getAIImagePlugin(endpoint)
          return [...prev, plugin]
        },
      },
    },
  }
})
