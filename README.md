# The Bank of Pixel City

The Bank's site: its rate, its lending to businesses and households, and its bad debts. Follows the Pixel Universe Shared Conventions.

Live at `https://dvexperiments.github.io/Bank/`. Add `?at=2027-09-01T12:00` to watch any moment.

The Bank opens on 1 February 2027. Its simulation lives in the Pixel Exchange's `universe.js` (`PixelUniverse.bank`), because its credit runs through every business's books each day; this site only reads it. See the Exchange's README for how the Bank works.

| File | What it does |
| --- | --- |
| `index.html` | The site. Loads, in order: Weather, Senate, City's universe.js and census.js, the Exchange, City's society.js. |
| `app.js` | The pages: the Bank, business lending, home loans, about. |
| `bank.css` | Styles, on Glacial's tokens. |

The home-loan applicants at the counter are real residents from the Census Office, decided as the Bank would on the day from their working lives; they illustrate the Bank's lending, which is computed district by district.
