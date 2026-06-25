import Foundation
import MapKit

struct APIClient {
 let base = URL(string: Bundle.main.object(forInfoDictionaryKey:"SIGNAL_API_BASE_URL") as? String ?? "https://signal-personal-news.onrender.com")!
 private let session:URLSession = { let c=URLSessionConfiguration.ephemeral;c.timeoutIntervalForRequest=20;c.timeoutIntervalForResource=30;return URLSession(configuration:c) }()
 func news(topics:[String], refresh:Bool=false) async throws -> NewsResponse {
  var q=[URLQueryItem(name:"topics",value:topics.joined(separator:",")),URLQueryItem(name:"limit",value:"48")];if refresh{q.append(.init(name:"refresh",value:"1"))};return try await get("/api/news",q)
 }
 func weather(_ l:WeatherLocation, refresh:Bool=false) async throws -> Weather {
  var q=[URLQueryItem(name:"lat",value:String(l.lat)),.init(name:"lon",value:String(l.lon)),.init(name:"name",value:l.name)];if let a=l.accuracy{q.append(.init(name:"accuracy",value:String(a)))};if refresh{q.append(.init(name:"refresh",value:"1"))};return try await get("/api/weather",q)
 }
 func geocode(_ text:String,bias:WeatherLocation) async throws->[Place]{ let r:GeocodeResponse=try await get("/api/geocode",[.init(name:"q",value:text),.init(name:"lat",value:String(bias.lat)),.init(name:"lon",value:String(bias.lon))]);return r.results }
 private func get<T:Decodable>(_ path:String,_ query:[URLQueryItem]) async throws->T { var c=URLComponents(url:base.appending(path:path),resolvingAgainstBaseURL:false)!;c.queryItems=query;let (d,r)=try await session.data(from:c.url!);guard let h=r as? HTTPURLResponse,(200..<300).contains(h.statusCode) else{throw URLError(.badServerResponse)};return try JSONDecoder().decode(T.self,from:d) }
}

actor DiskCache {
 static let shared=DiskCache(); private let dir:URL = { let d=FileManager.default.urls(for:.cachesDirectory,in:.userDomainMask)[0].appending(path:"SignalIOS");try? FileManager.default.createDirectory(at:d,withIntermediateDirectories:true);return d }()
 func save<T:Encodable>(_ value:T,_ name:String){ if let d=try? JSONEncoder().encode(value){try? d.write(to:dir.appending(path:name+".json"),options:.atomic)} }
 func load<T:Decodable>(_ type:T.Type,_ name:String)->T?{ guard let d=try? Data(contentsOf:dir.appending(path:name+".json")) else{return nil};return try? JSONDecoder().decode(type,from:d) }
}
struct NewsCache:Codable{let saved:Date;let articles:[Article]};struct WeatherCache:Codable{let saved:Date;let location:WeatherLocation;let weather:Weather}

enum Deduper { static func run(_ input:[Article])->[Article]{ var out:[Article]=[];let cutoff=Date().addingTimeInterval(-14*86400);for a in input.sorted(by:{($0.date ?? .distantPast)>($1.date ?? .distantPast)}) where (a.date ?? .distantPast)>cutoff { if !out.contains(where:{$0.canonical==a.canonical || similar($0.title,a.title)}){out.append(a)} };return out }
 static func similar(_ a:String,_ b:String)->Bool{let stop:Set<String>=["the","a","an","and","or","to","of","in","for","on","with","news","latest","today"];func t(_ s:String)->Set<String>{Set(s.lowercased().split{!$0.isLetter&&!$0.isNumber}.map(String.init).filter{$0.count>2&&!stop.contains($0)})};let x=t(a),y=t(b),n=x.intersection(y).count;return n>=5 && Double(n)/Double(max(1,min(x.count,y.count)))>0.6}
}
