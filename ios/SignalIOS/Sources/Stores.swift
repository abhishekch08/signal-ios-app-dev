import SwiftUI

enum Theme:String,CaseIterable,Identifiable{case system,light,dark;var id:String{rawValue};var scheme:ColorScheme?{self == .system ? nil : self == .dark ? .dark:.light}}
@MainActor final class Preferences:ObservableObject{
 @Published var topics:Set<String>{didSet{UserDefaults.standard.set(Array(topics),forKey:"topics")}}
 @Published var theme:Theme{didSet{UserDefaults.standard.set(theme.rawValue,forKey:"theme")}}
 @Published var location:WeatherLocation{didSet{if let d=try? JSONEncoder().encode(location){UserDefaults.standard.set(d,forKey:"location")}}}
 init(){topics=Set(UserDefaults.standard.stringArray(forKey:"topics") ?? Topics.all.map(\.id));theme=Theme(rawValue:UserDefaults.standard.string(forKey:"theme") ?? "system") ?? .system;if let d=UserDefaults.standard.data(forKey:"location"),let l=try? JSONDecoder().decode(WeatherLocation.self,from:d){location=l}else{location = .newDelhi}}
 func toggle(_ id:String){if topics.contains(id),topics.count>1{topics.remove(id)}else{topics.insert(id)}}
}
@MainActor final class Bookmarks:ObservableObject{
 @Published var items:[Article]=[]{didSet{if let d=try? JSONEncoder().encode(items){UserDefaults.standard.set(d,forKey:"bookmarks")}}}
 init(){if let d=UserDefaults.standard.data(forKey:"bookmarks"),let x=try? JSONDecoder().decode([Article].self,from:d){items=x}}
 func has(_ a:Article)->Bool{items.contains{$0.id==a.id}}
 func toggle(_ a:Article){if let i=items.firstIndex(where:{$0.id==a.id}){items.remove(at:i)}else{items.insert(a,at:0)}}
}
