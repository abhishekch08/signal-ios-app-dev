import SwiftUI
@main @MainActor struct SignalIOSApp:App{@StateObject var prefs:Preferences;@StateObject var bookmarks=Bookmarks();@StateObject var news:NewsVM;@StateObject var weather:WeatherVM
 init(){let p=Preferences();_prefs=StateObject(wrappedValue:p);_news=StateObject(wrappedValue:NewsVM(p));_weather=StateObject(wrappedValue:WeatherVM(p))}
 var body:some Scene{WindowGroup{TabView{HomeView(news:news,weather:weather).tabItem{Label("Briefing",systemImage:"sparkles")};TopicsView().tabItem{Label("Topics",systemImage:"square.grid.2x2")};SavedView().tabItem{Label("Saved",systemImage:"bookmark")};SettingsView().tabItem{Label("Settings",systemImage:"gearshape")}}.tint(Color.signal).environmentObject(prefs).environmentObject(bookmarks).preferredColorScheme(prefs.theme.scheme)}}}
