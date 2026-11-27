import { authenticate, configureStoreSearch, defineMiddlewares } from '@medusajs/framework/http'
import { bagCartGuard } from '../lib/bag-guard'
import { KERNEL_ROUTE_MATCHERS, kernelRouteGuard } from '../lib/kernel-route-guard'
import { adminOriginGuard } from '../lib/origin-guard'
import { photoUpload } from '../lib/photo-upload'

export default defineMiddlewares({
  routes: [
    // The route allow-list (AD-21, Story 1.4). The kernel's own CORS,
    // publishable-key, body-parser and auth middlewares run first; this global
    // middleware (no method) then runs before every route middleware and
    // handler, so a refused request changes nothing. Shop routes under
    // /store/shop and /admin/shop pass.
    ...KERNEL_ROUTE_MATCHERS.map((matcher) => ({
      matcher,
      middlewares: [kernelRouteGuard],
    })),
    // The Bag's kernel cart writes (Story 1.8) take only the Variant and the
    // quantity; a new cart is always made in the India region and the key's
    // sales channel, and only Variants of published Designs are accepted.
    // Global (no method), so it runs before the kernel's own body validation.
    {
      matcher: '/store/carts*',
      middlewares: [bagCartGuard],
    },
    // Shop admin routes (Story 1.6) accept only a signed-in admin's session
    // cookie (the dashboard's): no bearer token, no secret API key, no Shopper.
    // Because a cookie is sent cross-site, writes must also come from an
    // ADMIN_CORS origin (request.cross_origin otherwise).
    {
      matcher: '/admin/shop*',
      middlewares: [authenticate('user', ['session']), adminOriginGuard],
    },
    // Design photos: multipart, at most 12 files of 10 MB (upload.invalid_file otherwise).
    {
      method: ['POST'],
      matcher: '/admin/shop/uploads',
      middlewares: [photoUpload],
    },
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
