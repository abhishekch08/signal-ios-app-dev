import Foundation
import Combine
import CoreLocation
import MapKit

@MainActor final class NewsVM:ObservableObject{
 @Published var articles:[Article]=[];@Published var loading=false;@Published var error:String?;@Published var selected:String?;@Published var cached=false;@Published var updated:Date?
 let api=APIClient();let prefs:Preferences
 init(_ p:Preferences){prefs=p}
 func load(refresh:Bool=false) async{loading=articles.isEmpty;error=nil;let ids=selected.map{[$0]} ?? prefs.topics.subtracting(Topics.homeExcluded).sorted();if !refresh,articles.isEmpty,let c:NewsCache=await DiskCache.shared.load(NewsCache.self,"news"){articles=Deduper.run(c.articles).filter{ids.contains($0.topic)};cached=!articles.isEmpty;updated=c.saved}
  var all:[Article]=[];var failures=0;for chunk in stride(from:0,to:ids.count,by:8).map({Array(ids[$0..<min($0+8,ids.count)])}){do{all += try await api.news(topics:chunk,refresh:refresh).articles}catch{failures += 1}}
  let fresh=Deduper.run(all);if !fresh.isEmpty{articles=fresh;cached=false;updated = .now;await DiskCache.shared.save(NewsCache(saved:.now,articles:fresh),"news")}else if articles.isEmpty{error="No recent trusted stories are available."}else{error="Live refresh failed. Showing the last successful briefing."};if failures>0 && !articles.isEmpty{error="Some feeds could not refresh. Available trusted stories are shown."};loading=false
 }
}
@MainActor final class WeatherVM:NSObject,ObservableObject,CLLocationManagerDelegate{
 @Published var weather:Weather?;@Published var loading=false;@Published var query="";@Published var places:[Place]=[];@Published var error:String?;let prefs:Preferences;let api=APIClient();let lm=CLLocationManager()
 init(_ p:Preferences){prefs=p;super.init();lm.delegate=self;lm.desiredAccuracy=kCLLocationAccuracyKilometer}
 func load(refresh:Bool=false) async{loading=weather==nil;do{weather=try await api.weather(prefs.location,refresh:refresh);if let w=weather{await DiskCache.shared.save(WeatherCache(saved:.now,location:prefs.location,weather:w),"weather")}}catch{if let c:WeatherCache=await DiskCache.shared.load(WeatherCache.self,"weather"),Date().timeIntervalSince(c.saved)<43200{weather=c.weather};self.error="Weather could not refresh."};loading=false}
 func search()async{let t=query.trimmingCharacters(in:.whitespaces);guard t.count>1 else{places=[];return};do{places=try await api.geocode(t,bias:prefs.location)}catch{let r=MKLocalSearch.Request();r.naturalLanguageQuery=t;do{let x=try await MKLocalSearch(request:r).start();places=x.mapItems.prefix(6).map{.init(name:$0.name ?? t,displayName:$0.placemark.title,lat:$0.placemark.coordinate.latitude,lon:$0.placemark.coordinate.longitude,provider:"mapkit")}}catch{places=[]}}}
 func choose(_ p:Place)async{prefs.location = .init(lat:p.lat,lon:p.lon,name:p.name,accuracy:nil);query=p.name;places=[];await load(refresh:true)}
 func useCurrent(){switch lm.authorizationStatus{case .notDetermined:lm.requestWhenInUseAuthorization();case .authorizedWhenInUse,.authorizedAlways:lm.requestLocation();default:error="Enable location access in Settings or search for a place."}}
 func locationManagerDidChangeAuthorization(_ manager:CLLocationManager){if manager.authorizationStatus == .authorizedWhenInUse || manager.authorizationStatus == .authorizedAlways{manager.requestLocation()}}
 func locationManager(_ manager:CLLocationManager,didUpdateLocations locations:[CLLocation]){guard let l=locations.last else{return};prefs.location = .init(lat:l.coordinate.latitude,lon:l.coordinate.longitude,name:"Current location",accuracy:l.horizontalAccuracy);Task{await load(refresh:true)}}
 func locationManager(_ manager:CLLocationManager,didFailWithError error:Error){self.error=error.localizedDescription}
}
