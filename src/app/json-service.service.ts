import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EMPTY } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class JsonServiceService {

  private date: string;
  private startValue: string;
  private interval: any;

  constructor(private http: HttpClient) { }

  //getter for choosen date from UI
  public sendDate(value: string) {
    this.date = value;
  }
  //getter for requested interval statistics value
  public sendIntervalValue(value: any) {
    this.interval = value;
  }

  public postStartValue(value: any) {
    this.startValue = value;
    return this.http.get('http://localhost:8080/updateCounter/' + this.startValue, { responseType: 'text' })
    .subscribe((respo: any) => respo);
  }
  // --> fetching json response
  public getJsonResponse(): Observable<any> {
    return this.http.get('http://localhost:8080/converter/' + this.date)//, {responseType: 'text'})
    .pipe(map((responseByDate: any) => responseByDate));
  }

  public getCurrencyStatistic(mostCommonInterval: any, currencyInterval:any, currency: any): Observable<any> {
    return this.http.get('http://localhost:8080/converterStatistics/' + mostCommonInterval + '/'+ currencyInterval +'/'+ currency)
    .pipe(map((statistics: any) => statistics ));
  }

  public getWeatherResponse(value: any): Observable<any> {
    return this.http.get('http://localhost:8080/weather/' + value)// {responseType: 'text'})
    .pipe(map((responseWeather: any) => responseWeather));
  }

  public getEarthquake(): Observable<any> {
    return this.http.get('http://localhost:8080/earthquake')
      .pipe(map((quake: any) => quake));
  }

  public contactPage(name:any, surname:any, contact:any, message:any) {
    return this.http.get('http://localhost:8080/contact/'+name+'/'+surname+'/'+contact+'/'+message, { responseType: 'text' })
    .subscribe((item: any) => alert(item));
  }

}
