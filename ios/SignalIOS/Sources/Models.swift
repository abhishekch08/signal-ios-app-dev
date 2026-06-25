import Foundation

struct Topic: Identifiable, Hashable { let id:String; let label:String; let group:String }
enum Topics {
 static let all:[Topic] = [
 .init(id:"ai",label:"AI labs & models",group:"AI & Compute"),.init(id:"datacenter_cooling",label:"Data center cooling",group:"AI & Compute"),.init(id:"semiconductors",label:"Electronics & chips",group:"AI & Compute"),.init(id:"robotics",label:"Humanoids & robotics",group:"AI & Compute"),
 .init(id:"neurotech",label:"NeuroTech & brain–computer interfaces",group:"NeuroTech & BCI"),.init(id:"temple",label:"Temple by Deepinder Goyal",group:"NeuroTech & BCI"),
 .init(id:"wearables",label:"Wearable tech",group:"Personal Tech & Habits"),.init(id:"digital_wellbeing",label:"Digital wellbeing",group:"Personal Tech & Habits"),.init(id:"convenience_apps",label:"Convenience economy",group:"Personal Tech & Habits"),
 .init(id:"isro",label:"ISRO",group:"SpaceTech, Startups"),.init(id:"space",label:"Space Tech",group:"SpaceTech, Startups"),.init(id:"startups",label:"Deep Tech Startups",group:"SpaceTech, Startups"),.init(id:"drones",label:"Drone Tech",group:"SpaceTech, Startups"),
 .init(id:"electrification",label:"Electrification",group:"Mobility & Cities"),.init(id:"evs",label:"Electric vehicles",group:"Mobility & Cities"),.init(id:"metro",label:"India metro development",group:"Mobility & Cities"),.init(id:"cars",label:"New car launches",group:"Mobility & Cities"),
 .init(id:"glp",label:"GLP-1 & diabetes",group:"Health & Longevity"),.init(id:"cancer",label:"Cancer research",group:"Health & Longevity"),.init(id:"fertility",label:"IVF technology",group:"Health & Longevity"),.init(id:"hiv",label:"HIV research",group:"Health & Longevity"),.init(id:"micronutrients",label:"Vitamins & minerals",group:"Health & Longevity"),
 .init(id:"markets",label:"Major India market movers",group:"Markets & Materials"),.init(id:"commodities",label:"Strategic commodities",group:"Markets & Materials"),
 .init(id:"travel",label:"Travel & luxury",group:"Life & Sport"),.init(id:"cricket",label:"Indian cricket & Dhoni",group:"Life & Sport"),.init(id:"football",label:"FIFA, Messi & football",group:"Life & Sport"),
 .init(id:"screen_releases",label:"Releasing this week",group:"Movies & Series")]
 static let groups = ["AI & Compute","NeuroTech & BCI","Personal Tech & Habits","SpaceTech, Startups","Mobility & Cities","Health & Longevity","Markets & Materials","Life & Sport","Movies & Series"]
 static let homeExcluded:Set<String> = ["screen_releases"]
 static func label(_ id:String)->String { all.first{$0.id==id}?.label ?? id }
}

struct Article: Codable, Identifiable, Hashable {
 let id:String; let title:String; let url:String; let source:String; let sourceUrl:String?; let publisherDomain:String?; let publishedAt:String; let topic:String; let topicLabel:String; let summary:String?; let latestAvailable:Bool?; let stale:Bool?
 var articleURL:URL? { URL(string:url) }
 var date:Date? { ISO8601DateFormatter().date(from:publishedAt) }
 var canonical:String { guard var c=URLComponents(string:url) else{return url}; c.query=nil;c.fragment=nil;return c.string ?? url }
}
struct NewsResponse: Codable { let articles:[Article]; let meta:NewsMeta? }
struct NewsMeta: Codable { let fetchedAt:String?; let partial:Bool?; let failedFeeds:Int? }
struct WeatherLocation:Codable,Hashable { let lat:Double; let lon:Double; let name:String; let accuracy:Double?; static let newDelhi = Self(lat:28.6139,lon:77.2090,name:"New Delhi",accuracy:nil) }
struct Weather:Codable { let resolvedPlace:String?; let place:String?; let latitude:Double; let longitude:Double; let temperature:Int; let feelsLike:Int; let condition:String; let weatherCode:Int; let rainChance:Int; let aqi:Int?; let aqiDisplay:String?; let aqiModelEstimate:Bool?; let aqiStation:String?; let pm25:Double?; let pm10:Double?; let updatedAt:String; let provider:String; let sourceUrl:String?; let stale:Bool? }
struct GeocodeResponse:Codable { let results:[Place] }
struct Place:Codable,Identifiable,Hashable { let name:String; let displayName:String?; let lat:Double; let lon:Double; let provider:String?; var id:String{"\(lat),\(lon)"} }
