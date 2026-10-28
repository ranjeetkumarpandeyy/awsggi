# AWS Student Community Day Ludhiana 2026

Static website, no build step. Files: `index.html`, `assets/site.css`, `assets/site.js`, `assets/data.js`.

## Add people and photos
Open `assets/data.js`. Add one line per person to `speakers`, `faculty` or `team`:

    { name: "Full Name", role: "Designation", photo: "assets/people/name.jpg", link: "https://www.linkedin.com/in/..." }

Speakers can also have `topic: "Talk title"`. Photo and link are optional (initials show without a photo).
Put people photos in `assets/people/` and event photos in `assets/gallery/`, then list the gallery files in `gallery: [...]`.
Photos are shown uncropped in two rows that scroll in opposite directions.

## Run
`npm start` (http://localhost:3000) or open `index.html`. Deploy by uploading the folder to any static host.
