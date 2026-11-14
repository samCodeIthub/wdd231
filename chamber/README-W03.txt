WDD231 W03 - WCCI Chamber Home Page

FILES
- index.html: Chamber landing page
- directory.html: Existing business directory page
- styles/normalize.css: CSS reset
- styles/small.css: Shared styles and mobile/home-page styles
- styles/larger.css: Larger-screen styles
- scripts/config.js: OpenWeatherMap API key setting
- scripts/home.js: Home page weather and random business spotlights
- scripts/directory.js: Existing directory page functionality
- data/members.json: Chamber member records
- images/: WCCI logo and business images

IMPORTANT - ENABLE LIVE WEATHER
1. Create a free OpenWeatherMap account at https://openweathermap.org/
2. Generate an API key from your account.
3. Open scripts/config.js.
4. Replace PASTE_YOUR_OPENWEATHERMAP_API_KEY_HERE with your own API key, keeping the quotation marks.
5. Save the file and open index.html using VS Code Live Server.
6. A new API key can take some time to activate. If weather does not load immediately, wait and try again.

The API key is used by browser JavaScript for this course assignment. Do not use a paid/private production key in a public repository. For a production website, requests should be made through a server-side endpoint.

HERO IMAGE
The current hero uses images/bantama.webp as a local image so the page works immediately and stays lightweight. Replace the src in the hero img element with your own wide Winneba/chamber image when you have one. Keep it as an img element, not a CSS background, to meet the assignment requirement.

TESTING
- Run both index.html and directory.html with Live Server.
- Check the browser console for errors.
- Test at 320px, tablet, and desktop widths.
- Run the W3C HTML validator and the school auditor.
- Run Lighthouse in mobile and desktop modes.
- Use DevTools CSS Overview to check color contrast.
