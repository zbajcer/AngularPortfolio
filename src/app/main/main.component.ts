import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { JsonServiceService } from './../json-service.service';
import { Observable, of } from 'rxjs';
import { toArray, take } from 'rxjs/operators';
import { map, debounceTime, delay } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { FormControl, FormGroup, FormsModule, FormBuilder, Validators } from '@angular/forms';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import { add } from 'ol/coordinate';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { Pipe, PipeTransform } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


export interface BooksData {
  uid: string;
  bid: string;
  bookTitle: string;
  authorLastName: string;
  authorFirstName: string;
  issuedDate: string;
  period: string;
  fine: string;
  warning: string;
}

export interface LookBookData {
  bid: string;
  bookTitle: string;
  authorLastName: string;
  authorFirstName: string;
  issuedDate: string;
  bookGenre: string;
}

export interface BorrowedBooksData {
  bid: string;
  bookTitle: string;
  authorLastName: string;
  issuedDate: string;
  period: string;
  fine: string;
  warning: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {
  displayedBookColumns: string[] = ['bid', 'uid', 'bookTitle', 'authorLastName', 'authorFirstName', 'issuedDate', 'period', 'fine', 'warning'];
  dataSourceBook: MatTableDataSource<BooksData>;

  displayedLookBookColumns: string[] = ['bid', 'bookTitle', 'authorLastName', 'authorFirstName', 'bookGenre', 'issuedDate'];
  dataSourceLookBook: MatTableDataSource<LookBookData>;

  displayedBorrowedColumns: string[] = ['bid', 'bookTitle', 'authorLastName', 'issuedDate', 'period', 'fine', 'warning'];
  dataSourceBorrowed: MatTableDataSource<BorrowedBooksData>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('TableBorrowedPaginator', {static: true}) tableBorrowedPaginator: MatPaginator;
    @ViewChild('TableBorrowedSort', {static: true}) tableBorrowedSort: MatSort;

  @ViewChild('TableLookBookPaginator', {static: true}) tableLookBookPaginator: MatPaginator;
    @ViewChild('TableLookBookSort', {static: true}) tableLookBookSort: MatSort;

  @ViewChild('TableDebtorsPaginator', {static: true}) tableDebtorsPaginator: MatPaginator;
    @ViewChild('TableDebtorsSort', {static: true}) tableDebtorsSort: MatSort;



  searchTitle: string = null;
  dt = new Date().toISOString().slice(0, 10);
  today = new Date();
  jstoday = '';
  map;
  base64Image: any;
  crForm: FormGroup;
  signin: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.min(3)])
  });
  hide = true;

  get passwordInput() {
    return this.signin.get('password');
  }

  constructor(
    private data: JsonServiceService,
    private https: HttpClient,
    private fb: FormBuilder,
  ) {
    this.jstoday = formatDate(this.today, 'dd.MM.yyyy.', 'en-US');
  }

  ngOnInit() {
    this.updateDebtorTable();
    this.updateBookTable();
    this.sendDateToService(this.dt);
    this.getConverterData();
    this.weatherCity("Zagreb");
    this.getEarthquakeData();
    this.getAllStatistics(7, 7, 'HRK');
    this.map = new Map({
      target: 'hotel_map',
      layers: [new TileLayer({
        source: new OSM()
      })],
      view: new View({
        center: olProj.fromLonLat([this.lng, this.lat]),
        zoom: 7
      })
    });
    this.crForm = this.fb.group({
      crControl: [1],
      crEndControl: [1]
    });
    this.bookshelfAuth('zbajcer', 'opensesame');

  }

  //sending date from UI to JsonService
  sendDateToService(value: string) {
    this.data.sendDate(value);
  }

  //============================================================================== N A V B A R

  isNavbarCollapsed = false;
  toggleNavbarCollapsing() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  collapseAll() {
    this.isNavbarCollapsed = false;
  }
  //============================================================================== N A V B A R
  //============================================================================== B I O G R A P H Y

  approval = "false";
  password: any;
  PasswordAutorisation(approvalPsw: any) {
    this.password = approvalPsw;
    if (this.password == 'opensesame') {
      this.approval = "OK";
    }
    else {
      alert("Wrong password!");
    }
  }
  //============================================================================== B I O G R A P H Y
  //============================================================================== C O N V E R T E R

  parsedJson: any;
  getConverterData() {
    this.data.getJsonResponse().subscribe((dataByDate: any) => {
      this.parsedJson = JSON.parse(JSON.stringify(dataByDate)
        .replace(/Država/g, "Drzava").replace(/Srednji za devize/g, "Srednji"));
    })
    this.firstSelectValues(1, "HRK");
    this.secondSelectValues(1, "HRK");
  }

  postRequest() {
    this.data.postStartValue(this.valutaStart);
  }

  startSwap: any;
  endSwap: any;
  valutaEndView: any = 'HRK';
  valutaSwapView: any = 'HRK';
  swapOptions(firstOption: any, secondOption: any, amount: any) {
    for (let i = 0; i < this.parsedJson.length; i++) {
      if (firstOption == this.parsedJson[i].Srednji) {
        this.endSwap = this.parsedJson[i].Srednji;
        this.valutaEndView = this.parsedJson[i].Valuta;
        this.jedinicaSecond = this.parsedJson[i].Jedinica;
      }
      if (secondOption == this.parsedJson[i].Srednji) {
        this.startSwap = this.parsedJson[i].Srednji;
        this.valutaStart = this.parsedJson[i].Valuta;
        this.jedinicaFirst = this.parsedJson[i].Jedinica;
      }
    }
    this.crForm = this.fb.group({
      crControl: [this.startSwap],
      crEndControl: [this.endSwap]
    })
    this.calculation(this.startSwap, this.endSwap, amount, 'true');
    this.firstSelectValues(this.jedinicaFirst, this.valutaStart);
    this.secondSelectValues(this.jedinicaSecond, this.valutaEnd);
  }

  jedinicaFirst = 1;
  valutaStart = 'HRK';
  firstSelectValues(jedinica: any, valuta: any) {
    this.jedinicaFirst = jedinica;
    this.valutaStart = valuta;
  }

  jedinicaSecond = 1;
  valutaEnd = 'HRK';
  secondSelectValues(jedinica: any, valuta: any) {
    this.valutaEnd = valuta;
    this.jedinicaSecond = jedinica;
  }

  rezultat: any = 0;
  calculation(srednjiTecajPrvi: number, srednjiTecajDrugi: number, vrijednost: number, swap: any) {
    if (vrijednost == 0) {
      this.rezultat = 0.00;
    }
    else {
      this.rezultat = ((vrijednost * (Number(srednjiTecajPrvi.toLocaleString().replace(/,/g, '.')) / this.jedinicaFirst)) / (Number(srednjiTecajDrugi.toLocaleString().replace(/,/g, '.')) / this.jedinicaSecond)).toFixed(2);
      if (this.rezultat == 'NaN') {
        alert("Iznos za preračun mora biti broj!")
        this.rezultat = 0;
      }
    }
    if (swap != 'true') {
      this.postRequest();
    }
    this.getAllStatistics(7, 7, this.valutaStart);
  }

  startValueChart: any = [];
  parser: any;
  mostCommonIntervalStatistic: any;
  mostCommonOverallStatistic: any;
  currencyIntervalStatistic: any = [];
  currencyIntervalCounter: any = [];
  getAllStatistics(intervalMostCommon: any, intervalCurrency: any, value: any) {
    this.startValueChart.pop();
    this.startValueChart.push(this.valutaStart);
    this.currencyIntervalStatistic.splice(0, this.currencyIntervalStatistic.length);
    this.currencyIntervalCounter.splice(0, this.currencyIntervalCounter.length);
    this.data.getCurrencyStatistic(intervalMostCommon, intervalCurrency, value).subscribe((data: any) => {
      this.parser = JSON.parse(JSON.stringify(data));
      this.parser.map(item => {
        item.mostCommonInterval.map(item => {
          this.mostCommonIntervalStatistic = item.value;
        })
      })
      this.parser.map(item => {
        item.mostCommonOverall.map(item => {
          this.mostCommonOverallStatistic = item.value;
        })
      })
      this.parser.map(item => {
        item.currencyInterval.map(item => {
          this.currencyIntervalStatistic.push(item.valuta);
          this.currencyIntervalCounter.push(item.counter);
        })
      })
    })
  }

  public barChartOptions2: ChartOptions = {
    responsive: true, scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end', align: 'end',
      }
    }
  };
  public barChartLabels2: Label[] = this.currencyIntervalStatistic;
  public barChartType2: ChartType = 'line';
  public barChartLegend2 = true;
  public barChartData2: ChartDataSets[] = [{
    data: this.currencyIntervalCounter,
    label: this.startValueChart
  }];
  public barChartColors2: any[] = [{
    backgroundColor: '#f8fa70',
    borderColor: 'black',
    pointBackgroundColor: 'white',
    pointBorderColor: 'red',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(225,10,24,0.2)'
  }];
  //============================================================================== C O N V E R T E R
  //============================================================================== W E A T H E R
  regionWeather: any;
  isDayWeather: any;
  parseWeather: any;
  temperatureWeather: any;
  observationWeather: any;
  visibilityWeather: any;
  feelslikeWeather: any;
  descriptionWeather: any;
  wind_directionWeather: any;
  pressureWeather: any;
  weatherIconWeather: any;
  cloudcoverWeather: any;
  precipWeather: any;
  uvWeather: any;
  humidityWeather: any;
  wind_speedWeather: any;
  queryWeather: any;

  weatherCity(city: any) {
    this.data.getWeatherResponse(city).subscribe((data: any) => {
      this.parseWeather = JSON.parse(JSON.stringify(data));
      this.parseWeather.map((item: any) => {
        this.regionWeather = item.region;
        this.queryWeather = item.query;
        this.isDayWeather = item.isDay;
        this.temperatureWeather = item.temperature;
        this.wind_speedWeather = item.windSpeed;
        this.wind_directionWeather = item.windDirection;
        this.humidityWeather = item.humidity;
        this.uvWeather = item.uvIndex;
        this.visibilityWeather = item.visibility;
        this.observationWeather = item.observationTime;
        this.feelslikeWeather = item.feelsLike;
        this.descriptionWeather = item.description;
        this.pressureWeather = item.pressure;
        this.precipWeather = item.precipitation;
        this.cloudcoverWeather = item.cloudcover;
        this.weatherIconWeather = item.weatherIcon;
      });
      let imageUrl = this.weatherIconWeather;
      this.getBase64ImageFromURL(imageUrl).subscribe(base64data => {
        this.base64Image = 'data:image/jpg;base64,' + base64data;
      });
    })
  }

  getBase64ImageFromURL(url: string) {
    return Observable.create((observer) => {
      let img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      if (!img.complete) {
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = (err) => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }

  getBase64Image(img: HTMLImageElement) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }
  //============================================================================== W E A T H E R
  //==============================================================================  E A R T H Q U A K E

  myEarthquake(lon: any, lat: any) {
    this.lat = lat;
    this.lng = lon;
    this.map.getView().setCenter(olProj.fromLonLat([this.lng, this.lat]));
    var layer = new VectorLayer({
      source: new VectorSource({
        features: [
          new Feature({
            geometry: new Point(olProj.fromLonLat([this.lng, this.lat]))
          })
        ]
      })
    });
    var styles = new Style({
      image: new CircleStyle({
        radius: 35,
        stroke: new Stroke({ color: 'red', width: 2 })
      })
    })

    layer.setStyle(styles);
    this.map.addLayer(layer);
  }

  lat = 46.164059;
  lng = 15.869980;
  parseQuake: any;
  parsePlace: any = [];
  quakePlace: any = [];
  getEarthquakeData() {
    this.data.getEarthquake().subscribe((data: any) => {
      this.parseQuake = JSON.parse(JSON.stringify(data));
      this.parseQuake.map((place: any) =>
        this.quakePlace.push(place));
    })
  }
  //==============================================================================  E A R T H Q U A K E
  //============================================================================== B O O K S H E L F
  bsApproval: String = 'false';
  bsAdmin: String = 'false';
  authenticationMessage: any;
  authenticationUser: any = '';
  userFirstName: any;
  userLastName: any;
  userMessage: any = '';
  userUsername: any;
  userPassword: any;
  public loading: boolean;
  bookshelfAuth(uname: any, psw: any) {
    this.loading = true;
    this.userNotFound = '';
    this.searchTitle = '';
    this.returnBookButton = 'INACTIVE';
    this.newBookButton = 'INACTIVE';
    this.newUserButton = 'INACTIVE';
    this.deleteUserButton = 'INACTIVE';
    this.debtorButton = 'INACTIVE';
    this.data.authenticateUser(uname, psw).subscribe((data: any) => {
      try {
        this.authenticationMessage = JSON.parse(JSON.stringify(data));
        this.authenticationMessage.map((item: any) => {
          this.authenticationUser = item.uid;
          this.bsAdmin = item.administrator;
          this.userFirstName = item.firstName;
          this.userLastName = item.lastName;
          this.userUsername = item.username;
          this.userPassword = item.passwords;
        })
        if (this.userUsername == uname && this.userPassword == psw) {
          this.bsApproval = 'OK';
          this.getAllBooksFromDatabase();
          if (this.bsAdmin != 'true') {
            this.getLoanBooks(this.authenticationUser)
            this.updateBorrowedTable(this.authenticationUser)
          }
          this.userMessage = '';
        }
        else {
          this.userMessage = '*username or password are incorecct'
          this.loading = false;
        }
      } catch (parseError) {
        this.loading = false;
        alert("User not found!")
      }
    })
    this.updateBookTable();
    this.updateDebtorTable();
  }

  parseUserData: any;
  filterBooks: any = [];
  debtorsList: any = [];
  returnValue: any = [];
  getAllBooksFromDatabase(): BooksData[] { //all books from Bookshelf
    this.filterBooks.splice(0, this.filterBooks.length);
    this.debtorsList.splice(0, this.debtorsList.length);
    this.returnValue.splice(0, this.returnValue.length);
    this.data.getBooks().subscribe((data: any) => {
      this.parseUserData = JSON.parse(JSON.stringify(data));
      this.parseUserData.map((item: any) => {
        if (item.fine != 0) {
          this.returnValue.push(
            {
              uid: item.uid,
              bid: item.bid,
              bookTitle: item.bookTitle,
              authorLastName: item.authorLastName,
              authorFirstName: item.authorFirstName,
              issuedDate: item.issuedDate,
              period: item.period,
              fine: item.fine,
              warning: item.warning
            }
          );
        }
        this.filterBooks.push(item.bookTitle + ",          " + item.authorLastName + " " + item.authorFirstName + "          " + item.bid + ", " + item.issuedDate);
        if (item.fine != '0' && item.fine != null) {
          this.debtorsList.push("UID:" + item.uid + "  BID:" + item.bid + "      " + item.fine + "kn   (" + item.period + " days)");
        }
      })
      this.parseUserData.sort(function(a, b) {
        return a.authorLastName.toLowerCase() > b.authorLastName.toLowerCase();
      })
    })
    this.updateBookTable();
    this.updateDebtorTable();
    return this.returnValue;
  }

  parseLoanBooks: any;
  verifyUserNotification: any;
  userDebit: number = 0;
  pipeList: any = [];
  getLoanBooks(userID: any) { //just books loaned by user
    this.userDebit = 0;
    if (userID == '') {
      this.verifyUserNotification = '*This field if required';
    } else {
      this.verifyUserNotification = '';
      this.data.getLoanBooks(userID).subscribe((data: any) => {
        this.parseLoanBooks = JSON.parse(JSON.stringify(data));
        this.parseLoanBooks.map((item: any) => {
          this.userDebit += item.fine;
          this.pipeList.push(item.book)
        })
      })
    }
    this.updateBookTable();
    this.updateDebtorTable();
  }

  userNotFound: any = '';
  parseUNF: any;
  verifiedName: any = '';
  verifiedSurname: any;
  verifyUser(uid: any) {  //verify that user is in the Autorisation table
    this.loanBookMessage = '';
    if (uid != '') {
      this.data.verifyUser(uid).subscribe((data: any) => {
        this.parseUNF = JSON.parse(JSON.stringify(data));
        this.parseUNF.map((item: any) => {
          this.verifiedName = item.name;
          this.verifiedSurname = item.surname;
        });
        if (this.parseUNF.length != 0) {
          this.userNotFound = 'User with UID ' + uid + ' verified';
        } else {
          this.verifiedName = '';
          this.verifiedSurname = '';
          this.userNotFound = 'User with UID ' + uid + ' does not exist';
        }
      })
      this.updateBookTable();
      this.updateDebtorTable();
    }
  }

  bookshelfResponse: any;
  bookAddedNotification: any = '';// adding new book to Bookshelf table
  bookshelfAddBook(book: any, writerLastName: any, writerFirstName: any, genre: any) {
    this.bookAddedNotification = '';
    if (book == '' || genre == '' || writerLastName == '' || writerFirstName == '') {
      alert('All fields are required!');
    } else {
      this.data.addBook(book, writerLastName, writerFirstName, genre).subscribe((data: any) => {
        try {
          this.bookshelfResponse = JSON.parse(JSON.stringify(data));
          if (this.bookshelfResponse != null) {
            this.bookAddedNotification = '*The book has been added to library';
          }
        } catch (error) {
          this.bookAddedNotification = '*Ooops. something went wrong!';
        }
      });
    }
    this.updateBookTable();
    this.updateDebtorTable();
  }

  addNewUserMessage: any;
  risponz: any;
  bookshelfAddUser(newUserAdmin: any, newUserUsername: any, newUserPassword: any, newUserFirstname: any, newUserLastName: any, newUserTelephone: any, newUserAddress: any) {
    if (newUserAdmin == '' || newUserUsername == '' || newUserPassword == '' || newUserFirstname == '' || newUserLastName == '' || newUserTelephone == '') {
      alert("All fields except address are required!");
    } else {
      this.data.addUser(newUserAdmin, newUserUsername, newUserPassword, newUserFirstname, newUserLastName, newUserTelephone, newUserAddress).subscribe((data: any) => {
        this.risponz = JSON.parse(JSON.stringify(data));
        if (this.risponz == 'OK') {
          this.addNewUserMessage = '*New user has been added';
        } else {
          this.addNewUserMessage = '*Existing user / error';
        }
      })
    }
  }
  deleteUserMessage: any;
  deleteUserFunc(user: any) {
    this.data.deleteUserFromDB(user).subscribe((item: any) => {
      this.deleteUserMessage = '*The user has been removed';
      console.log(item)
    })
  }

  loanBookMessage: any = '';
  bookLoanInput: any = '';
  userLoanInput: any = '';
  postLoanBook(user: any, book: any) {
    this.data.loanBook(user, book).subscribe((data: any) => {
      if (data.return == 'exist') {
        this.loanBookMessage = 'The book is already borowed!';
        this.bookLoanInput = '';
      } else {
        this.loanBookMessage = '*Borowed to user!';
        this.bookLoanInput = '';
      }
      this.getAllBooksFromDatabase();
      this.getLoanBooks(this.userLoanInput);
    })
    this.updateBookTable();
    this.updateDebtorTable();
  }

  returnBookNotification: any = '';
  bookReturnInput: any = '';
  returnBookJson: any;
  returnBook(book: any) {
    this.data.returnBook(book).subscribe((data: any) => {
      this.returnBookJson = JSON.parse(JSON.stringify(data));
      if (this.returnBookJson.result != 0) {
        this.returnBookNotification = '*The book has been returned!';
        this.bookReturnInput = '';
        this.getLoanBooks(this.userLoanInput);
      } else {
        this.returnBookNotification = '*Book not found!';
        this.bookReturnInput = '';
      }
    })
    this.updateBookTable();
    this.updateDebtorTable();
  }

  newUserButton = 'INACTIVE';
  newBookButton = 'INACTIVE';
  debtorButton = 'INACTIVE';
  returnBookButton = 'INACTIVE';
  deleteUserButton = 'INACTIVE';
  openFormAdmin(button: any) {
    this.deleteUserMessage = '';
    this.addNewUserMessage = '';
    this.bookAddedNotification = '';
    if (button == 'newUser') {
      if (this.newUserButton == 'INACTIVE') {
        this.newUserButton = 'ACTIVE';
      } else {
        this.newUserButton = 'INACTIVE';
      }
    }
    if (button == 'addBook') {
      if (this.newBookButton == 'INACTIVE') {
        this.newBookButton = 'ACTIVE';
      } else {
        this.newBookButton = 'INACTIVE';
      }
    }
    if (button == 'debtors') {
      if (this.debtorButton == 'INACTIVE') {
        this.getAllBooksFromDatabase();
        this.debtorButton = 'ACTIVE';
      } else {
        this.debtorButton = 'INACTIVE';
        this.debtorsList.splice(0, this.debtorsList.length)
      }
    }
    if (button == 'returnBook') {
      if (this.returnBookButton == 'INACTIVE') {
        this.returnBookButton = 'ACTIVE';
        this.returnBookNotification = '';
        this.bookReturnInput = '';
      } else {
        this.returnBookButton = 'INACTIVE';
        this.returnBookNotification = '';
        this.bookReturnInput = '';
      }
    }
    if (button == 'deleteUser') {
      if (this.deleteUserButton == 'INACTIVE') {
        this.deleteUserButton = 'ACTIVE';
      } else {
        this.deleteUserButton = 'INACTIVE';
      }
    }
  }

  updateBookTable(){
    this.getLookBooksFromDatabase().subscribe(
      books => {
        this.dataSourceLookBook = new MatTableDataSource(books);
        this.dataSourceLookBook.paginator = this.tableLookBookPaginator;
        this.dataSourceLookBook.sort = this.tableLookBookSort;
      }
    );
  }

  updateDebtorTable(){
    this.getBooksFromDatabase().subscribe(
      books => {
        this.dataSourceBook = new MatTableDataSource(books);
        this.dataSourceBook.paginator = this.tableDebtorsPaginator;
        this.dataSourceBook.sort = this.tableDebtorsSort;
      }
    );
  }

  updateBorrowedTable(userID: any){
    this.getBorrowedBooks(userID).subscribe(
      books => {
        this.dataSourceBorrowed = new MatTableDataSource(books);
        this.dataSourceBorrowed.paginator = this.tableBorrowedPaginator;
        this.dataSourceBorrowed.sort = this.tableBorrowedSort;
      }
    )
  }

  getBorrowedBooks(userID: any): Observable<BooksData[]> {
    return this.data.getLoanBooks(userID).pipe(
      map(data => {
        return data
          .map(item => {
            return {
              bid: item.bid,
              bookTitle: item.book,
              authorLastName: item.author,
              issuedDate: item.issuedDate,
              period: item.period,
              fine: item.fine,
              warning: item.warning
            }
          })
      })
    );
  }

  getBooksFromDatabase(): Observable<BooksData[]> {
    return this.data.getBooks().pipe(
      map(data => {
        return data
          .filter(item => item.fine > 0)
          .map(item => {
            return {
              uid: item.uid,
              bid: item.bid,
              bookTitle: item.bookTitle,
              authorLastName: item.authorLastName,
              authorFirstName: item.authorFirstName,
              issuedDate: item.issuedDate,
              period: item.period,
              fine: item.fine,
              warning: item.warning
            }
          })
      })
    );
  }

  getLookBooksFromDatabase(): Observable<LookBookData[]> {
    return this.data.getBooks().pipe(
      map(data => {
        return data
          .map(item => {
            return {
              bid: item.bid,
              bookTitle: item.bookTitle,
              authorLastName: item.authorLastName,
              authorFirstName: item.authorFirstName,
              issuedDate: item.issuedDate,
              bookGenre: item.bookGenre
            }
          })
      })
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceBook.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceBook.paginator) {
      this.dataSourceBook.paginator.firstPage();
    }
  }
  applyLookBookFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceLookBook.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceLookBook.paginator) {
      this.dataSourceLookBook.paginator.firstPage();
    }
  }
  //============================================================================== B O O K S H E L F
  //============================================================================== C O N T A C T  F O R M

  push(name, surname, contact, message) {
    if (name == '') {
      alert("You must enter your name!");
    }
    else if (surname == '') {
      alert("You must enter your surname!");
    }
    else if (contact == '') {
      alert("You must enter your contact info!");
    }
    else if (message == '') {
      alert("You must enter a message!");
    }
    else {
      this.data.contactPage(name, surname, contact, message);
    }
  }
  //============================================================================== C O N T A C T  F O R M
}
