# Local storybook fonts

Caveat and Nunito are the same variable fonts previously downloaded by next/font/google. These WOFF2 files retain Latin, Latin Extended A, typographic punctuation and the existing layout features. Their source licenses accompany the files.

Source licenses: https://github.com/google/fonts/blob/main/ofl/caveat/OFL.txt and https://github.com/google/fonts/blob/main/ofl/nunito/OFL.txt.

Subsetting used fontTools (development tooling only, no application dependency): `--unicodes=U+0000-00FF,U+0100-017F,U+2000-206F,U+2190-2193,U+2212,U+FFFD --layout-features=* --flavor=woff2`.

Sizes: Caveat 74,572 → 71,760 bytes; Nunito 39,152 → 33,944 bytes. Caveat is requested through its stylesheet instead of competing in the initial font preload queue. System fonts remain the fallback for characters outside this subset.
