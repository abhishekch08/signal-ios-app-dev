# Signal — personal newspaper

This repository contains the existing Node/HTML Signal personal newspaper and a fully native SwiftUI iPhone client under `ios/`.

## Run backend

```bash
npm start
```

Open `http://127.0.0.1:4173`. APIs used by iOS: `/api/news`, `/api/weather`, `/api/geocode`, `/api/topics`, `/api/health`.

## iOS app

Open `ios/SignalIOS.xcodeproj` in Xcode 16 or later. The app targets iOS 17+, points to `https://signal-personal-news.onrender.com`, and requires no embedded API keys.

Implemented: native Today’s Briefing, full topic navigation, Movies & Series isolation, bookmarks, theme/topic/location persistence, weather/Indian AQI, current location, place search with MapKit fallback, in-app Safari, pull-to-refresh, disk cache, errors/empty states, loading UI, eight-topic API batching, and client deduplication.

See [`ios/README.md`](ios/README.md) for testing, configuration, TestFlight, and App Store deployment.
