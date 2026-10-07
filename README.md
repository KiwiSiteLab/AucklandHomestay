# Victoria House · Auckland Homestay

Three independent Auckland stays. Astro static website with owner-provided property photography, responsive landscape backgrounds, automatic WebGL fog dissolve and refined pointer interactions.

Website: https://kiwisitelab.github.io/AucklandHomestay/

## Development

Run `npm ci --prefix website`, then `node tools/astro.mjs dev`. Production deployment uses GitHub Actions on the main branch.

## Contact and booking

Enquiry forms generate text locally for sending through WeChat. No automatic email, live availability or online payment service is connected. Booking and payment links appear only when real HTTPS links are configured in the property data.

Background originals and local QA material are excluded from this repository; web-optimized backgrounds and public property-gallery originals are included.
