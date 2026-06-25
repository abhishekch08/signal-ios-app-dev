# Signal iOS — run, test, and deploy

## Open and run

1. Install Xcode 16 or later on macOS.
2. Open `ios/SignalIOS.xcodeproj`.
3. Select the **SignalIOS** scheme and an iPhone simulator.
4. Press `⌘R`.

The committed `Config/Config.xcconfig` uses the live Render backend. No iOS key is required. Optional `GOOGLE_MAPS_API_KEY` and `DATA_GOV_IN_API_KEY` stay on Render only.

## Local backend

Run `npm start`, copy `Config.local.xcconfig.example` to `Config.local.xcconfig`, then use `127.0.0.1:4173` for Simulator or your Mac LAN IP for a real iPhone.

## Functional test checklist

- Test light, dark, small-iPhone, and large-iPhone layouts.
- Pull to refresh and open articles in the Safari sheet.
- Save stories, terminate the app, and verify persistence.
- Edit topics; verify `screen_releases` never appears in Today’s Briefing.
- Open Movies & Series from Topics.
- Search a landmark and select a suggestion.
- Test current-location permission and denial paths.
- Disable networking; verify cached news/weather and visible error states.
- Test on a physical iPhone before distribution.

## Device signing

Select the app target → **Signing & Capabilities** → choose your Apple Developer team. Change `com.abhishekch08.SignalIOS` if that bundle identifier is unavailable.

## TestFlight/App Store

1. Create an App Store Connect app record with the same bundle identifier.
2. Add description, category, support/privacy URLs, age rating, screenshots, and App Privacy answers.
3. Select **Any iOS Device (arm64)**, then **Product → Archive**.
4. In Organizer select **Distribute App → TestFlight & App Store**, validate, and upload.
5. Add internal TestFlight testers and complete a beta pass.
6. Increment `CURRENT_PROJECT_VERSION` for every upload.
7. Select the processed build in App Store Connect and submit for review.

Location is optional and used only for weather/AQI functionality; bookmarks, theme, selected topics, and chosen location are stored locally.
