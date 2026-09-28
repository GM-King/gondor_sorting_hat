# Gondor Sorting Hat

A self-contained fantasy name sorter. Enter a first and last name to receive one of the 52 marked race/class combinations from the supplied table, along with a silly browser-drawn portrait and repeatable body measurements. `pine` or `pineapple` as either complete name field reveals Leather Ball after ten extra seconds of sorting.

## Preview locally

Install Node.js 20 or newer, then run `node preview.mjs` from this folder. Open <http://127.0.0.1:4173>. No package installation or build step is needed. Run `node --test tests/*.test.mjs` for the sorting and artwork checks.

## Publish with Cloudflare Pages

Upload the contents of this folder to the root of a GitHub repository, keeping `public/` and `public/assets/` intact. The repository should contain `public/index.html`, not `sorting_hat/public/index.html`. Include both PNG files in `public/assets/`. Skip `.idea/` and any temporary browser profiles or generated review files; `.gitignore` excludes them when using Git, but GitHub's web upload requires you to omit them yourself.

In Cloudflare, create a **Pages** project (using Git integration), import that repository, and use:

| Setting | Value |
| --- | --- |
| Framework preset | `None` |
| Production branch | `main` |
| Root directory | Leave blank (repository root) |
| Build command | `exit 0` |
| Build output directory | `public` |

Cloudflare's [static HTML guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) documents these settings. Cloudflare will serve `public/index.html` at the site root.

No environment variables, API keys, Functions, Wrangler configuration, or running preview server are required for deployment. After the first deployment, open the provided `pages.dev` URL and sort a name to confirm the GitHub connection and selected directories are correct. Subsequent commits to `main` deploy automatically.

All sorting and SVG drawing happen in the visitor's browser. Names are neither sent to a server nor stored. The mascot images are bundled in `public/assets`; the page requires no live image generation service.

The mascot artwork was prepared with the built-in imagegen tool using the supplied yelling face and blue hat images as references. The face was extended into a full helmet, neck, and armored shoulders on a transparent background; the hat was recreated without the reference watermark. Prompts used: “preserve the recognisable yelling helmeted face, extend the circular crop into a natural head and armored shoulders, transparent PNG” and “recreate the tall bent cobalt-blue hat with gold band and broad brim, no watermark, transparent PNG.”

Character portraits use deliberately uneven browser-drawn SVG with oversized features, crooked limbs, red shoes, two deterministic body silhouettes, and 50 name-seeded hairstyles. The drawing includes the entered name and `<Gondor Calls For Raid>` above the character; class equipment is drawn over and anchored to the hands. The measurement panel uses the same name seed and body type as the portrait. Run `node tests/gallery.mjs` to generate a local gallery at `tests/gallery.html` for visual review; it is outside the deployed `public` folder.
