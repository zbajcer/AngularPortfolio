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

  public authenticateUser(id: any, psw: any): Observable<any> {
    return this.http.get('http://localhost:8080/authenticateUser/' + id +'/'+psw) //, { responseType: 'text' })
    .pipe(map((response: any) => response));
  }

  public addBook(title: any, writerLast:any, writerFirst:any, genre: any): Observable<any> {
    return this.http.get('http://localhost:8080/addNewBook/' + title +'/'+ writerLast +'/'+ writerFirst +'/'+ genre)//, { responseType: 'text' })
    .pipe(map((response: any) => response));
  }

  public addUser( newUserAdmin: any, newUserUsername: any, newUserPassword: any, newUserFirstname: any, newUserLastName: any, newUserTelephone: any, newUserAddress: any) {
    return this.http.get('http://localhost:8080/addNewUser/' + newUserAdmin +'/'+ newUserUsername +'/'+ newUserPassword +'/'+ newUserFirstname +'/'+ newUserLastName +'/'+ newUserTelephone +'/'+ newUserAddress, { responseType: 'text'})
    .pipe(map((response: any) => response));
  }

  public getBooks(): Observable<any> {
    return this.http.get('http://localhost:8080/books')
      .pipe(map((books: any) => books));
  }

  public getLoanBooks(userID: any): Observable<any> {
    return this.http.get('http://localhost:8080/userLoan/' + userID)
      .pipe(map((books: any) => books));
  }

  public verifyUser(userID: any): Observable<any> {
    return this.http.get('http://localhost:8080/user/' + userID)
      .pipe(map((user: any) => user));
  }

  public loanBook(uid: any, bid: any): Observable<any> {
    return this.http.get('http://localhost:8080/loan/' + uid +'/'+bid) //, { responseType: 'text' })
    .pipe(map((response: any) => response));
  }

  public returnBook(book: any): Observable<any> {
    return this.http.get('http://localhost:8080/return/' + book) //, { responseType: 'text' })
    .pipe(map((response: any) => response));
  }

  public deleteUserFromDB(user: any): Observable<any> {
    return this.http.get('http://localhost:8080/delete/' + user) //, { responseType: 'text' })
    .pipe(map((response: any) => response));
  }

  public extendBookLoan(user: any, book:any, admin: any): Observable<any> {
    return this.http.get('http://localhost:8080/extendLoan/' + user + '/' + book +'/'+ admin) //, { responseType: 'text' })
    .pipe(map((response: any) => response));
  }

}
