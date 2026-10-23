# Beyond Life Productions

## Vercel deployment

This is a static website. `vercel.json` serves the project root without a build step. In Vercel, select the repository directory containing `index.html` as the Root Directory.

Git deployments only include committed files. Commit the HTML pages, CSS files, `script.js`, `assets/`, `.gitignore`, and `vercel.json`, then push to the connected production branch. A repository containing only this README will return a 404 at the home URL.

Use the Other framework preset, no build command, and `.` as the output directory. After deployment, confirm the production domain points to that successful deployment.

A responsive, static multi-page photography website. Open `index.html` or serve this folder with `python -m http.server 8080`. No build step is required.

## Pages

- `index.html`: opening paper reveal, monochrome hero, pinned Feel section, photography preview, philosophy preview, client testimonials and contact invitation.
- `about.html`: storytellers introduction, creative philosophy and founders' perspective.
- `photography.html`: Love, Family, Joy and The Unexpected editorial galleries, animated camera viewer, and four clickable couple folders with modal albums.
- `films.html`: wedding reel with video controls, plus previews for future films.
- `contact.html`: contact invitation and enquiry form for name, email, phone, wedding date, venue, service and story.

Desktop and mobile navigation link between separate HTML pages. The active page is indicated in the navigation. The header is transparent over the Home hero and cream on interior pages. Shared styles and behavior live in `styles.css` and `script.js`; optional features initialize only on pages that contain them.

## Interactions

- Home: skippable translucent paper splash, direct-cut hero image changes, and floating photographs in the pinned Feel section.
- Testimonials: three supplied reviews, selectable by couple, with automatic photo-to-note flips after four seconds in view and manual turn controls.
- Photography: compact camera entrance and photo viewer, plus individual galleries for Swati & Kiran, Preksha & Akshay, Apurva & Pulkit, and Fatima & Zafir.
- Films: `assets/videos/reel1.mov` plays with native controls.
- Contact: validation runs before opening the visitor's email app with the completed enquiry. There is no server-side submission or automatic email delivery.
- Reduced-motion preferences, pause controls, keyboard navigation and Escape-to-close galleries are supported.

## Replace before publishing

- `hello@beyondlifeproductions.in` remains an unverified demo email address. Update the links and form destination in `script.js`.
- About Us now contains Hitesh Jain's supplied founder biography and the story behind the Beyond Life name. His supplied portrait is included as `assets/images/hitesh-jain.webp`.
- Vivek & Mehul and Neha & Uthsav currently use explicitly labeled placeholder gallery photos. Zafer & Fatima use the matching local photograph.
- Additional film titles/covers are previews awaiting the complete films.
- Couple album assignments in `coupleAlbums` in `script.js` are provisional visual matches to the supplied reference; confirm against the full original albums.

## Validation

`node --check script.js` verifies JavaScript syntax. `.preview/check-multipage.py` verifies all five pages' local links, cross-page anchors, assets, unique IDs and primary headings.

All five pages passed browser checks at 1440px and 390px widths: navigation, layout overflow, couple gallery opening/closing, testimonial selection, enquiry validation and absence of runtime exceptions. Browser screenshots are in `.preview/multipage-*.png`. The previous single-page site is backed up in `.preview/index.before-multipage.html` and `.preview/script.before-multipage.js`.

Footer contact details use +91 789812466 and hello@beyondlifeproductions.com from the supplied reference. Instagram links to @beyondlifeproductions. The Facebook icon currently links to the Facebook homepage as a placeholder; replace it with the client profile before publishing.

"# beyondlifeproductions" 
