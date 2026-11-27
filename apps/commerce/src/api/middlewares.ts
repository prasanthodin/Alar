import { configureStoreSearch, defineMiddlewares } from '@medusajs/framework/http'
import { KERNEL_ROUTE_MATCHERS, kernelRouteGuard } from '../lib/kernel-route-guard'

export default defineMiddlewares({
  routes: [
    // The route allow-list (AD-21, Story 1.4). Global middlewares (no method)
    // run before every route middleware and handler, so a refused request
    // changes nothing. Shop routes under /store/shop and /admin/shop pass.
    ...KERNEL_ROUTE_MATCHERS.map((matcher) => ({
      matcher,
      middlewares: [kernelRouteGuard],
    })),
    // The product index declares filterable `status` and `sales_channel_ids`, so
    // the route narrows it to published products in the key's sales channels.
    // POST /store/search is not on the allow-list yet; the story that first calls
    // it adds it there.
    {
      method: ['POST'],
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
  ],
})
