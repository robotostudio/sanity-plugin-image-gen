import {definePlugin} from 'sanity'

import {ImageAssetSource} from './components/image-asset-source'

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {myPlugin} from 'sanity-plugin-ai-image'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [myPlugin()],
 * })
 * ```
 */
export const aiImagePlugin = definePlugin(() => {
  console.log('aiImagePlugin')
  return {
    name: 'sanity-plugin-ai-image',
    form: {
      image: {
        assetSources: (prev) => {
          return [
            ...prev,
            {
              name: 'sanity-ai-image',
              title: 'Generate Image',
              component: ImageAssetSource,
            },
          ]
        },
      },
    },
  }
})
