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

  // if Observeble<any> then can not use subscription, map only. But only for JSON response
  public postStartValue(value: any) {
    this.startValue = value;
    return this.http.get('http://localhost:8080/updateStatisticsCounter/' + this.startValue, { responseType: 'text' })
      .subscribe((respo: any) => console.log(respo));
  }

  public getWeatherResponse(value: any): Observable<any> {
    console.log(value)
      return this.http.get('http://localhost:8080/weatherStatus/' + value)// {responseType: 'text'})
        .pipe(map((responseWeather: any) => responseWeather));
  }


  //sending url by date to backend --> fetching json response
  public getJsonResponse(): Observable<any> {
  //  var regex = new RegExp("^(?:[0-9]{2})?[0-9]{2}-[0-3]?[0-9]-[0-3]?[0-9]$");
  //  if (regex.test(this.date)) {
        return this.http.get('http://localhost:8080/jsonByDate/' + this.date)//, {responseType: 'text'})
        .pipe(map((responseByDate: any) => responseByDate));
    //}
    //else return EMPTY;
  }

  //sending url by date to backend --> fetching json response
  public getJsonForChart(): Observable<any> {
      return this.http.get('http://localhost:8080/getChartData/' + this.date)//, {responseType: 'text'})
        .pipe(map((responseChart: any) => responseChart));
  }

  // if Observeble<any> then can not use subscription, map only. But it will not work when is text response. Json only
  public getMostCommonStartValue(): Observable<any> {
    return this.http.get('http://localhost:8080/mostCommonStartValue')
      .pipe(map((dailyStats: any) => dailyStats));
  }

  // if Observeble<any> then can not use subscription, map only. But it will not work when is text response. Json only
  public getMostCommonStartValueInterval(value: any): Observable<any> {
    return this.http.get('http://localhost:8080/mostCommonStartValueInterval/' + value)
      .pipe(map((intervalStats: any) => intervalStats));
  }

  public getCurrencyStats(interval: any, value: any): Observable<any> {
    return this.http.get('http://localhost:8080/currencyUsage/' + interval + '/'+ value)
      .pipe(map((interval: any) => interval ));
  }

  public contactPage(name:any, surname:any, contact:any, message:any) {
    return this.http.get('http://localhost:8080/contactInfo/'+name+'/'+surname+'/'+contact+'/'+message, { responseType: 'text' })
      .subscribe((item: any) => alert(item));
  }

  public login(user: any, psw: any): Observable<any> {
    return this.http.get('http://localhost:8080/login/'+user+'/'+psw)
      .pipe(map((item: any) => item));
  }
  public getMessages(): Observable<any> {
    return this.http.get('http://localhost:8080/getMessages')
      .pipe(map((item:any) => item));
  }

  public getWeather(): Observable<any> {
    return this.http.get('http://localhost:8080/weatherOnDemand')
      .pipe(map((weather: any) => weather));
  }
}
