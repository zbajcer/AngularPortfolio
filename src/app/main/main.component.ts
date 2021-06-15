import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { JsonServiceService } from './../json-service.service';
import { Observable, of } from 'rxjs';
import { toArray, take } from 'rxjs/operators';
import { map, debounceTime, delay } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { interval } from 'rxjs';
import { timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { FormControl, FormGroup, FormsModule, FormBuilder, Validators, FormGroupDirective, NgForm } from '@angular/forms';
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
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';


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
  extend: string;
}

export interface XOplayerScores {
  player: string;
  score: string;
}

export interface WeatherHistory {
  query: string;
  observationTime: string;
  temperature: string;
  windSpeed: string;
  windDirection: string;
  pressure: string;
  precipitation: string;
  humidity: string;
  cloudcover: string;
  feelsLike: string;
  uvIndex: string;
  visibility: string;
  isDay: string;
  date: string;
  description: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}

const numbersInterval = interval(1000);
const countToFour = numbersInterval.pipe(take(4));

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

  displayedBorrowedColumns: string[] = ['bid', 'bookTitle', 'authorLastName', 'issuedDate', 'period', 'fine', 'warning', 'extend'];
  dataSourceBorrowed: MatTableDataSource<BorrowedBooksData>;

  displayedXOplayerStats: string[] = ['player', 'score'];
  xodataSource: MatTableDataSource<XOplayerScores>;

  displayedWeatherHistoryColumns: string[] =[  'query', 'observationTime', 'temperature','windSpeed','windDirection','pressure','precipitation','humidity','cloudcover',
    'feelsLike','uvIndex', 'visibility','isDay','date','description'];
  dataSourceWeatherHistory: MatTableDataSource<WeatherHistory>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('TableBorrowedPaginator', { static: true }) tableBorrowedPaginator: MatPaginator;
  @ViewChild('TableBorrowedSort', { static: true }) tableBorrowedSort: MatSort;

  @ViewChild('TableLookBookPaginator', { static: true }) tableLookBookPaginator: MatPaginator;
  @ViewChild('TableLookBookSort', { static: true }) tableLookBookSort: MatSort;

  @ViewChild('TableDebtorsPaginator', { static: true }) tableDebtorsPaginator: MatPaginator;
  @ViewChild('TableDebtorsSort', { static: true }) tableDebtorsSort: MatSort;

  @ViewChild('TableXOpaginator', { static: true }) tableXOpaginator: MatPaginator;

  @ViewChild('TableWeatherHistoryPaginator', { static: true }) tableWeatherHistoryPaginator: MatPaginator;
  @ViewChild('TableWeatherHistorySort', { static: true }) tableWeatherHistorySort: MatSort;

  canvasInterval: number = 7;
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
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private datePipe: DatePipe
  ) {
    this.jstoday = formatDate(this.today, 'dd.MM.yyyy.', 'en-US');
    this.myForm = this.formBuilder.group({
      password: ['', [Validators.required]],
      confirmPassword: [''],
      username: [''],
      firstName: [''],
      nameOfOurLovelyUser: [''],
      surname: [''],
      telephone: [''],
      message: [''],
      address: [''],
      email: [''],
      contactName: [''],
      contactSurname: [''],
      contactEmail: [''],
      contactMessage: [''],
      materialDatePicker: this.dt
    }, { validator: this.checkPasswords });
    this.TicTacToeForm = this.formBuilder.group({
      xoPlayerOne: [''],
      xoPlayerTwo: ['']
    });
  }

  ngOnInit() { 
    this.sendDateToService(this.dt, true);
    this.getConverterData();
    this.weatherCity("Zagreb");
    this.getEarthquakeData();
    this.getAllStatistics(7, this.canvasInterval, 'HRK');
    this.createOpenLayersMap();
    this.updateXOTable('iks','oks','looser');
    //this.bookshelfAuth('terminator', 'terminator');
    this.bookshelfAuth('zbajcer','opensesame');
  }

  //sending date from UI to JsonService
  substrDate: string;
  sendDateToService(value: string, flag: boolean) {
    if(flag == true){
      this.data.sendDate(value);
    }else {
      this.data.sendDate(value.substring(6,10)+"-"+value.substring(3,5)+"-"+value.substring(0,2));
    }
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
  //============================================================================== TVZ RSS FEED
  public tvz: boolean = false;
  tvzJSON: any;
  fetchTVZrssFeed(){
    this.tvz = true;
    this.data.getTVZrssFeed().subscribe( (news:any) => {
        this.tvzJSON = JSON.parse(JSON.stringify(news));
    })
  }
  //============================================================================== TVZ RSS FEED
  //============================================================================== B I O G R A P H Y

  approval: boolean = false;
  password: any;
  bioSubmitMessage: any = '';
  PasswordAutorisation(approvalPsw: any) {
    this.password = approvalPsw;
    this.bioSubmitMessage = '';
    if (this.password == 'opensesame') {
      this.approval = true;
    } else {
      this.bioSubmitMessage = '*wrong password';
      countToFour.subscribe(x => {
        if (x == 3) {
          this.bioSubmitMessage = '';
        }
      });
    }
  }
  //============================================================================== B I O G R A P H Y
  //============================================================================== C O N V E R T E R

  prviSelekt: any = 1;
  drugiSelekt: any = 1;
  iznosZaPreracun: any = '';
  startSwaps: any;
  endSwaps: any;
  swapOption(firstOption: any, secondOption: any, amount: any) {
    for (let i = 0; i < this.parsedJson.length; i++) {
      if (firstOption == this.parsedJson[i].Srednji) {
        this.endSwaps = this.parsedJson[i].Srednji;
        this.valutaEndView = this.parsedJson[i].Valuta;
        this.jedinicaSecond = this.parsedJson[i].Jedinica;
      }
      if (secondOption == this.parsedJson[i].Srednji) {
        this.startSwaps = this.parsedJson[i].Srednji;
        this.valutaStart = this.parsedJson[i].Valuta;
        this.jedinicaFirst = this.parsedJson[i].Jedinica;
      }
    }
    this.prviSelekt = this.startSwaps;
    this.drugiSelekt = this.endSwaps;
    this.calculation(secondOption, firstOption, amount);
    this.firstSelectValues(this.jedinicaFirst, this.valutaStart);
    this.secondSelectValues(this.jedinicaSecond, this.valutaEnd);
  }

  currListNames: any = [];
  currListValues: any = [];
  parsedJson: any;
  getConverterData() {
    this.currListNames.splice(0, this.currListNames.length);
    this.currListValues.splice(0, this.currListValues.length);
    this.data.getJsonResponse().subscribe((dataByDate: any) => {
      this.parsedJson = JSON.parse(JSON.stringify(dataByDate)
        .replace(/Država/g, "Drzava").replace(/Srednji za devize/g, "Srednji"));
      this.parsedJson.map(item => {
        this.currListNames.push(item.Valuta);
        this.currListValues.push(item.Srednji/item.Jedinica);
      })
    })
    this.firstSelectValues(1, "HRK");
    this.secondSelectValues(1, "HRK");
  }

  postRequest() {
    this.data.postStartValue(this.valutaStart);
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

  valutaEndView: string = 'HRK';
  rezultat: any = '0';
  converterAmountMessage: any = '';
  calculation(srednjiTecajPrvi: number, srednjiTecajDrugi: number, vrijednost: number) {
    this.rezultat = '';
    for (let i = 0; i < this.parsedJson.length; i++) {
      if (srednjiTecajDrugi == this.parsedJson[i].Srednji) {
        this.valutaEndView = this.parsedJson[i].Valuta;
      }
    }
    if (vrijednost == 0) {
      this.rezultat = 0.00;
    }
    else {
      this.rezultat = ((vrijednost * (Number(srednjiTecajPrvi.toLocaleString().replace(/,/g, '.')) / this.jedinicaFirst)) / (Number(srednjiTecajDrugi.toLocaleString().replace(/,/g, '.')) / this.jedinicaSecond)).toFixed(2);
      if (this.rezultat == 'NaN') {
        this.converterAmountMessage = 'The amount has to be a number!'
        countToFour.subscribe(x => {
          if (x == 2) {
            this.converterAmountMessage = '';
            this.rezultat = 0.00;
          }
        });
      }
    }
    this.postRequest();
    this.getAllStatistics(7, this.canvasInterval, this.valutaStart);
  }


  selectedCode: any;
  onChangeCode(code: any) {
    this.selectedCode = code;
  }

  startValueChart: any = [];
  parser: any;
  mostCommonIntervalStatistic: any = "Casper";
  mostCommonOverallStatistic: any = "Casper";
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
          if(item.value != ""){
            this.mostCommonIntervalStatistic = item.value;
          }
        })
        item.mostCommonOverall.map(item => {
          if(item.value != ""){
            this.mostCommonOverallStatistic = item.value;
          }
        })
        item.currencyInterval.map(item => {
          this.currencyIntervalStatistic.push(item.valuta);
          this.currencyIntervalCounter.push(item.counter);
        })
      })
    })
  }

  reloadCanvas(value: any){
    this.canvasInterval = value;
    this.getAllStatistics(value, this.canvasInterval, this.valutaStart);
  }

  canvasValues: any = [3,5,7,10,15,20,30,50,100];
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

  currList: boolean = false;

  currListBoolean(){
    if(this.currList == false){
      this.currList = true;
    }
    else{
      this.currList = false;
    }
  }

  public barChartOptions: ChartOptions = {
    responsive: true, scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end', align: 'end',
      }
    }
  };
  public barChartLabels: Label[] = this.currListNames;
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: ChartDataSets[] = [{
    data: this.currListValues,
    label: "Value"
  }];
  public barChartColors: any[] = [{
    backgroundColor: 'grey',
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
  weatherFailMessage: string = '';
  weatherCity(city: any) {
    this.data.getWeatherResponse(city).subscribe((data: any) => {
      if (data != null) {
        this.updateWeatherHistoryTable();
        this.weatherFailMessage = '';
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
      }
      else {
        this.weatherFailMessage = '*City not found or bad spelling';
        countToFour.subscribe(x => {
          if (x == 3) {
            this.weatherFailMessage = '';
          }
        });
      }
    })
  }
  weatherHistory: boolean = false;
  weatherHistoryFlag(){
    if(this.weatherHistory == true){
      this.weatherHistory = false;
    }
    else{
      this.updateWeatherHistoryTable();
      this.weatherHistory = true;
    }
  }
  getWeatherHistory(): Observable<WeatherHistory[]> {
    return this.data.getWeatherSearchHistory().pipe(
      map( data => {
        return data.map(item => {
          return {
            query: item.query,
            observationTime: item.observationTime,
            temperature: item.temperature,
            windSpeed: item.windSpeed,
            windDirection: item.windDirection,
            pressure: item.pressure,
            precipitation: item.precipitation,
            humidity: item.humidity,
            cloudcover: item.cloudcover,
            feelsLike: item.feelsLike,
            uvIndex: item.uvIndex,
            visibility: item.visibility,
            isDay: item.isDay,
            date: item.date,
            description: item.description
          }
        })
      })
    )
  }

  updateWeatherHistoryTable() {
    this.getWeatherHistory().subscribe(
      history => {
        this.dataSourceWeatherHistory = new MatTableDataSource(history);
        this.dataSourceWeatherHistory.paginator = this.tableWeatherHistoryPaginator;
        this.dataSourceWeatherHistory.sort = this.tableWeatherHistorySort;
      }
    )
  }

  applyWeatherHistoryFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceWeatherHistory.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceWeatherHistory.paginator) {
      this.dataSourceWeatherHistory.paginator.firstPage();
    }
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
  //open layers map wrong position on loading -> solution: resize browser

  lat = 45.815010;
  lng = 15.951919;
  parseQuake: any;
  parsePlace: any = [];
  quakePlace: any = [];
  alertLevel: any = [{alert:"any"},{alert:"blue"},{alert:"green"},{alert:"orange"},{alert:"red"}];
  ngAlertLevel: any = 'any';
  getEarthquakeData() {
    this.data.getEarthquake().subscribe((data: any) => {
      this.parseQuake = JSON.parse(JSON.stringify(data));
      this.parseQuake.map((place: any) =>
        this.quakePlace.push(place));
      })
  }


  changeAlertLevel(value: any){
    if(value != 'any'){
    this.ngAlertLevel = value;
    this.quakePlace.splice(0, this.quakePlace.length)
    this.parseQuake.map((place:any) => {
      if(place.alert == this.ngAlertLevel){
        this.quakePlace.push(place)
      }
    })
    } else {
      this.quakePlace.splice(0, this.quakePlace.length)
      this.getEarthquakeData()
    }
  }

  setRadiusValue(zoom: any){
    if(zoom <= 3){
      return 1;
    }
    else if(zoom > 3 && zoom <= 5){
      return 4;
    }
    else if (zoom > 5 && zoom <= 6){
      return 14;
    }
    else if(zoom > 6 && zoom <= 7){
      return 35;
    }
    else if(zoom > 7 && zoom <= 8){
      return 90;
    }
    else if(zoom > 8 && zoom <= 9){
      return 170;
    }
    else if(zoom > 9 && zoom <= 10){
      return 250;
    }
    else if(zoom > 10){
      return 300;
    }
    else {
      return 7;
    }
  }

  zoomLevel: any = 7;
  createOpenLayersMap() {
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
  }

  showEarthquake(lon: any, lat: any) {
    this.lat = lat;
    this.lng = lon;
    //*********************************************
    var layerArray, len, layer;
    layerArray = this.map.getLayers().getArray(),
      len = layerArray.length;
    while (len > 0) {
      layer = layerArray[len - 1];        //remove layers
      this.map.removeLayer(layer);
      len = layerArray.length;
    }
    //*********************************************
    this.map.getView().setCenter(olProj.fromLonLat([this.lng, this.lat]));
    var firstLayer = new TileLayer({
      source: new OSM()
    });
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
        radius: 15,
        fill: new Fill({
          color: 'rgba(200, 50, 50, 0.5)'
        }),
      })
    })
    var stylesSecond = new Style({
      image: new CircleStyle({
        radius: 40,
        fill: new Fill({
          color: 'rgba(20, 100, 240, 0.3)'
        }),
      })
    })
    this.map.getView().on('change:resolution', () => {
    this.zoomLevel = this.map.getView().getZoom();
    var second = new Style({
      image: new CircleStyle({
        radius: this.setRadiusValue(this.zoomLevel),
        fill: new Fill({
          color: 'rgba(20, 100, 240, 0.3)'
        }),
      })
    })
    var first = new Style({
      image: new CircleStyle({
        radius: this.zoomLevel,
        fill: new Fill({
          color: 'rgba(200, 50, 50, 0.5)'
        }),
      })
    })
    const style = [first, second];
    layer.setStyle(style);
  })
    const style = [styles, stylesSecond];
    layer.setStyle(style);
    this.map.addLayer(firstLayer);
    this.map.addLayer(layer);
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
    this.loanBookMessage = '';
    this.returnBookButton = 'INACTIVE';
    this.newBookButton = 'INACTIVE';
    this.newUserButton = 'INACTIVE';
    this.deleteUserButton = 'INACTIVE';
    this.debtorButton = 'INACTIVE';
    this.userMessage = '';
    if (uname == '') {
      this.loading = false;
      this.userMessage = '*Please enter your username'
    }
    else if (psw == '') {
      this.loading = false;
      this.userMessage = '*Please enter your password'
    }
    else {
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
            if (this.bsAdmin != 'true') {
              this.getLoanBooks(this.authenticationUser)
              this.updateBorrowedTable(this.authenticationUser)
            }
            this.userMessage = '';
            this.updateDebtorTable();
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
    }
  }

  parseLoanBooks: any;
  verifyUserNotification: any;
  userDebit: number = 0;
  pipeList: any = [];
  getLoanBooks(userID: any) { //just books loaned by user
    this.userDebit = 0;
    if (userID == '') {
      this.verifyUserNotification = '*This field is required';
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
    this.updateBorrowedTable(userID);
    this.updateDebtorTable();
  }

  userNotFound: any = '';
  parseUNF: any;
  verifiedName: any = '';
  verifiedSurname: any = '';
  verifiedTelephone: any = '';
  verifiedAddress: any = '';
  verifiedEmail: any = '';
  verifyUser(uid: any) {  //verify that user is in the Autorisation table
    this.loanBookMessage = '';
    if (uid != '') {
      this.data.verifyUser(uid).subscribe((data: any) => {
        this.parseUNF = JSON.parse(JSON.stringify(data));
        this.parseUNF.map((item: any) => {
          this.verifiedName = item.name;
          this.verifiedSurname = item.surname;
          this.verifiedTelephone = item.Telephone;
          this.verifiedAddress = item.Address;
          this.verifiedEmail = item.email;
        });
        if (this.parseUNF.length != 0) {
          this.userNotFound = 'User with UID ' + uid + ' verified';
        } else {
          this.verifiedName = '';
          this.verifiedSurname = '';
          this.verifiedTelephone = '';
          this.verifiedAddress = '';
          this.verifiedEmail = '';
          this.userNotFound = 'User with UID ' + uid + ' does not exist';
        }
      })
      this.updateBookTable();
      this.updateDebtorTable();
    }
  }

  bookshelfResponse: any;
  bookAddedNotification: any = '';// adding new book to Bookshelf table
  newBookID: any;
  bookshelfAddBook(book: any, writerLastName: any, writerFirstName: any, genre: any) {
    this.bookAddedNotification = '';
    if (book == '' || genre == '' || writerLastName == '' || writerFirstName == '') {
      this.bookAddedNotification = 'All fields are required!';
      countToFour.subscribe(x => {
        if (x == 1) {
          this.bookAddedNotification = '';
        }
      });
    } else {
      this.data.addBook(book, writerLastName, writerFirstName, genre).subscribe((data: any) => {
        try {
          this.bookshelfResponse = JSON.parse(JSON.stringify(data));
          this.newBookID = this.bookshelfResponse.id;
          if (this.newBookID != null) {
            if (this.newBookID == '0') {
              this.bookAddedNotification = 'Something went wrong!';
              countToFour.subscribe(x => {
                if (x == 3) {
                  this.bookAddedNotification = '';
                }
              });
            } else {
              this.bookAddedNotification = 'Added by BID: ' + this.newBookID;
            }
          }
        } catch (error) {
          this.bookAddedNotification = '*Ooops. something went wrong!';
          countToFour.subscribe(x => {
            if (x == 3) {
              this.bookAddedNotification = '';
            }
          });
        }
      });
    }
    this.updateBookTable();
  }

  addNewUserMessage: any;
  risponz: any;
  bookshelfAddUser(newUserAdmin: any, newUserUsername: any, newUserPassword: any, newUserFirstname: any, newUserLastName: any, newUserTelephone: any, newUserAddress: any, newUserEmail: any) {
    if (newUserAdmin == '' || newUserUsername == '' || newUserPassword == '' || newUserFirstname == '' || newUserLastName == '' || newUserTelephone == '' || newUserEmail == '') {
      alert("All fields except address are required!");
    } else {
      this.data.addUser(newUserAdmin, newUserUsername, newUserPassword, newUserFirstname, newUserLastName, newUserTelephone, newUserAddress, newUserEmail).subscribe((data: any) => {
        this.risponz = JSON.parse(JSON.stringify(data));
        if (this.risponz == 'OK') {
          this.addNewUserMessage = '*New user has been added';
          countToFour.subscribe(x => {
            if (x == 3) {
              this.addNewUserMessage = '';
            }
          });
        } else {
          this.addNewUserMessage = '*Existing user / error';
          countToFour.subscribe(x => {
            if (x == 3) {
              this.addNewUserMessage = '';
            }
          });
        }
      })
    }
  }

  deleteUserMessage: any;
  deleteUserInputField: any = '';
  deleteUserFunc(user: any) {
    this.data.deleteUserFromDB(user).subscribe((item: any) => {
      if (item.result != 0) {
        this.deleteUserMessage = '*The user has been removed';
        countToFour.subscribe(x => {
          if (x == 3) {
            this.deleteUserMessage = '';
            this.deleteUserInputField = '';
          }
        });
      } else {
        this.deleteUserMessage = '*User not found';
        countToFour.subscribe(x => {
          if (x == 3) {
            this.deleteUserMessage = '';
            this.deleteUserInputField = '';
          }
        });
      }
    })
  }

  loanBookMessage: any = '';
  bookLoanInput: any = '';
  userLoanInput: any = '';
  postLoanBook(user: any, book: any) {
    if (book == '') {
      this.loanBookMessage = 'Please enter book ID'
      countToFour.subscribe(x => {
        if (x == 3) {
          this.loanBookMessage = '';
        }
      });
    } else if (user == '') {
      this.loanBookMessage = 'Please enter user ID'
      countToFour.subscribe(x => {
        if (x == 3) {
          this.loanBookMessage = '';
        }
      });
    } else {
      this.data.loanBook(user, book).subscribe((data: any) => {
        if (data.return == 'maximumThreeBorrowedBooks') {
          this.loanBookMessage = 'Maximum of three books are borrowed'
          this.bookLoanInput = '';
          countToFour.subscribe(x => {
            if (x == 3) {
              this.loanBookMessage = '';
            }
          });
        }
        else if (data.return == 'exist') {
          this.loanBookMessage = 'The book is already borowed!';
          this.bookLoanInput = '';
          countToFour.subscribe(x => {
            if (x == 3) {
              this.loanBookMessage = '';
            }
          });
        } else {
          this.loanBookMessage = '*Borowed to user!';
          this.bookLoanInput = '';
          countToFour.subscribe(x => {
            if (x == 3) {
              this.loanBookMessage = '';
            }
          });
        }
        this.getLoanBooks(this.userLoanInput);
      })
      this.updateBookTable();
    }
  }

  extendLoan(user: any, book: any) {
    this.data.extendBookLoan(user, book, 'true').subscribe((data: any) => {
      this.getLoanBooks(user);
    })
  }

  extendLoanUserRequest(user: any, book: any) {
    this.data.extendBookLoan(user, book, 'false').subscribe((data: any) => {
      if (data.response == 'sent') {
        this.getLoanBooks(user);
      }
    })
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
        countToFour.subscribe(x => {
          if (x == 3) {
            this.returnBookNotification = '';
          }
        });
        this.getLoanBooks(this.userLoanInput);
      } else {
        this.returnBookNotification = '*Book not found!';
        this.bookReturnInput = '';
        countToFour.subscribe(x => {
          if (x == 3) {
            this.returnBookNotification = '';
          }
        });
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
        this.debtorButton = 'ACTIVE';
      } else {
        this.debtorButton = 'INACTIVE';
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

  updateBookTable() {
    this.getLookBooksFromDatabase().subscribe(
      books => {
        this.dataSourceLookBook = new MatTableDataSource(books);
        this.dataSourceLookBook.paginator = this.tableLookBookPaginator;
        this.dataSourceLookBook.sort = this.tableLookBookSort;
      }
    );
  }

  numberOfDebtors: number = 0;
  updateDebtorTable() {
    this.getBooksFromDatabase().subscribe(
      books => {
        this.numberOfDebtors = books.length;
        this.dataSourceBook = new MatTableDataSource(books);
        this.dataSourceBook.paginator = this.tableDebtorsPaginator;
        this.dataSourceBook.sort = this.tableDebtorsSort;
      }
    );
  }

  updateBorrowedTable(userID: any) {
    this.getBorrowedBooks(userID).subscribe(
      books => {
        this.dataSourceBorrowed = new MatTableDataSource(books);
        this.dataSourceBorrowed.paginator = this.tableBorrowedPaginator;
        this.dataSourceBorrowed.sort = this.tableBorrowedSort;
      }
    )
  }

  getBorrowedBooks(userID: any): Observable<BorrowedBooksData[]> {
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
              warning: item.warning,
              extend: item.extend
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


  newFirstName: any;
  newLastName: any;
  newEmail: any;
  newAddress: any;
  newTelephone: any;
  newUsername: any;
  newPassword: any;
  newVerifyPassword: any;
  registrationMessage: any = '';
  registrationUID: any = '';
  public registrationLoading: boolean;
  newUserRegistration(newFirstName: any, newLastName: any, newEmail: any, newTelephone: any, newAddress: any, newUsername: any, newPassword: any, newVerifyPassword: any) {
    this.registrationLoading = true;
    this.registrationUID = '';
    let notSejm = this.checkPasswords(this.myForm);
    if (notSejm != null) {
      this.registrationMessage = 'Passwords do not match!';
    } else {
      if (newFirstName == '' || newLastName == '' || newEmail == '' || newTelephone == '' || newAddress == '' || newUsername == '' || newPassword == '' || newVerifyPassword == '') {
        this.registrationMessage = 'All fields required!';
      } else {
        this.data.registerUser(newFirstName, newLastName, newEmail, newTelephone, newAddress, newUsername, newPassword).subscribe((item: any) => {
          if (item.response == 'exist') {
            this.registrationMessage = 'Username already exists';
          } else {
            this.registrationMessage = 'Success!';
            this.registrationUID = item.response;
          }
        })
      }
    }
    countToFour.subscribe(x => {
      if (x == 0) {
        this.registrationLoading = false;
      }
    });
    countToFour.subscribe(x => {
      if (x == 1 && this.registrationUID != '') {
        this.registrationMessage = '';
      } else {
        countToFour.subscribe(x => {
          if (x == 2) {
            this.registrationMessage = '';
          }
        });
      }
    });
  }

  closeResult = '';
  open(content) {
    this.modalService.open(content,
      { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult =
          `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  clearModalFields() {
    this.myForm.reset();
  }
  

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  myForm: FormGroup;
  matcher = new MyErrorStateMatcher();
  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { notSame: true }
  }
  //============================================================================== B O O K S H E L F
  //============================================================================== C O N T A C T  F O R M
  clearContactFields() {
    countToFour.subscribe(x => {
      if (x == 2) {
        this.myForm.reset();
        this.contactFormMessage = '';
      }
    });
  }

  public contactSendLoading: boolean;
  contactFormMessage: any = '';
  push(name, surname, contact, message) {
    this.contactSendLoading = true;
    if (name == '') {
      this.contactFormMessage = "You must enter your name!";
      this.contactSendLoading = false;
    }
    else if (surname == '') {
      this.contactFormMessage = "You must enter your surname!";
      this.contactSendLoading = false;
    }
    else if (contact == '') {
      this.contactFormMessage = "You must enter your contact info!";
      this.contactSendLoading = false;
    }
    else if (message == '') {
      this.contactFormMessage = "You must enter a message!";
      this.contactSendLoading = false;
    }
    else {
      this.data.contactPage(name, surname, contact, message);
      this.contactFormMessage = 'Sending message...';
      countToFour.subscribe(x => {
        if (x == 2) {
          this.contactFormMessage = '';
          this.contactSendLoading = false;
        }
      });
      countToFour.subscribe(x => {
        if (x == 3) {
          this.contactFormMessage = 'Message sent!';
          this.clearContactFields();
        }
      });
    }
    countToFour.subscribe(x => {
      if (x == 2) {
        this.contactFormMessage = '';
      }
    });
  }
  //============================================================================== C O N T A C T  F O R M
  //==============================================================================   X   O
  TicTacToeForm: FormGroup;
  xoFirstButton: any = '';
  xoSecondButton: any = '';
  xoThirdButton: any = '';
  xoFourthButton: any = '';
  xoFifthButton: any = '';
  xoSixthButton: any = '';
  xoSeventhButton: any = '';
  xoEightButton: any = '';
  xoNinethButton: any = '';
  b1Color: any;
  b2Color: any;
  b3Color: any;
  b4Color: any;
  b5Color: any;
  b6Color: any;
  b7Color: any;
  b8Color: any;
  b9Color: any;
  xoPlayerOne: any = 'iks';
  xoPlayerTwo: any = 'oks';
  xoScoreOne: number = 0;
  xoScoreTwo: number = 0;
  xowinner: any = '';

  public firstplay: boolean = true;
  xoPlayerOnePrevious: any = 'iks';
  xoPlayerTwoPrevious: any = 'oks';
  xoScoreOnePrevious: number = 0;
  xoScoreTwoPrevious: number = 0;

  public isWinner: boolean = false;
  private isFirstPlayer: boolean = true;
  xoClickedButton(value: any){
      this.setXO(value, this.isFirstPlayer);
      if(this.checkXOwinningCombo()){
        this.isWinner = true;
        if(this.xowinner == this.xoPlayerOne){
          this.xoScoreOne += 1;
        }
        else {
          this.xoScoreTwo += 1;
        }
        this.updateXOTable(this.xoPlayerOne, this.xoPlayerTwo, this.xowinner);
      }
    }

    getXOData(iks: any, oks: any, winner: any): Observable<XOplayerScores[]> {
      return this.data.xoScore(iks,oks,winner).pipe(
        map(data => {
          return data
          .map(item => {
            return {
              player: item.player,
              score: item.score
            }
          })
        })
      )
    }

    updateXOTable(iks: any, oks: any, winner: any) {
      this.getXOData(iks, oks, winner).subscribe(
        players => {
          this.xodataSource = new MatTableDataSource(players);
          this.xodataSource.paginator = this.tableXOpaginator;
        }
      )

    }

  xosubmitPlayers(iks: any, oks: any){
      this.firstplay = false;
      this.xoPlayerOnePrevious = this.xoPlayerOne;
      this.xoPlayerTwoPrevious = this.xoPlayerTwo;
      this.xoScoreOnePrevious = this.xoScoreOne;
      this.xoScoreTwoPrevious = this.xoScoreTwo;
    if(iks == '' || oks == ''){
      this.xoPlayerOne = 'iks';
      this.xoPlayerTwo = 'oks';
    } else {
      this.xoPlayerOne = iks;
      this.xoPlayerTwo = oks;
    }
    this.xoScoreOne = 0;
    this.xoScoreTwo = 0;
    this.isFirstPlayer = true;
    this.xoReset();
  }

  xoReset(){
    this.isWinner = false;
    this.isFirstPlayer = true;
    this.b1Color = 'transparent';
    this.b2Color = 'transparent';
    this.b3Color = 'transparent';
    this.b4Color = 'transparent';
    this.b5Color = 'transparent';
    this.b6Color = 'transparent';
    this.b7Color = 'transparent';
    this.b8Color = 'transparent';
    this.b9Color = 'transparent';
    this.xoFirstButton = '';
    this.xoSecondButton = '';
    this.xoThirdButton = '';
    this.xoFourthButton = '';
    this.xoFifthButton = '';
    this.xoSixthButton = '';
    this.xoSeventhButton = '';
    this.xoEightButton = '';
    this.xoNinethButton = '';
  }

  setXO(button: any, firstPlayer: boolean){
    if(button == "first"){
      if(this.xoFirstButton != 'X' && this.xoFirstButton != 'O'){
        this.xoFirstButton = firstPlayer ? 'X' : 'O';
        this.isFirstPlayer = this.isFirstPlayer ? false : true;
    }
    }
    else if(button == "second"){
      if(this.xoSecondButton != 'X' && this.xoSecondButton != 'O'){
      this.xoSecondButton = firstPlayer ? 'X' : 'O';
      this.isFirstPlayer = this.isFirstPlayer ? false : true;
    }}
    else if(button == "third"){
      if(this.xoThirdButton != 'X' && this.xoThirdButton != 'O'){
      this.xoThirdButton = firstPlayer ? 'X' : 'O';
      this.isFirstPlayer = this.isFirstPlayer ? false : true;
    }}
    else if(button == "fourth"){
      if(this.xoFourthButton != 'X' && this.xoFourthButton != 'O'){
      this.xoFourthButton = firstPlayer ? 'X' : 'O';
      this.isFirstPlayer = this.isFirstPlayer ? false : true;
    }}
    else if(button == "fifth"){
      if(this.xoFifthButton != 'X' && this.xoFifthButton != 'O'){
      this.xoFifthButton = firstPlayer ? 'X' : 'O';
      this.isFirstPlayer = this.isFirstPlayer ? false : true;
    }}
    else if(button == "sixth"){
      if(this.xoSixthButton != 'X' && this.xoSixthButton != 'O'){
      this.xoSixthButton = firstPlayer ? 'X' : 'O';
      this.isFirstPlayer = this.isFirstPlayer ? false : true;
    }}
    else if(button == "seventh"){
      if(this.xoSeventhButton != 'X' && this.xoSeventhButton != 'O'){
      this.xoSeventhButton = firstPlayer ? 'X' : 'O';
      this.isFirstPlayer = this.isFirstPlayer ? false : true;
    }}
    else if(button == "eight"){
      if(this.xoEightButton != 'X' && this.xoEightButton != 'O'){
      this.xoEightButton = firstPlayer ? 'X' : 'O';
      this.isFirstPlayer = this.isFirstPlayer ? false : true;
    }}
    else if(button == "nineth"){
      if(this.xoNinethButton != 'X' && this.xoNinethButton != 'O'){
      this.xoNinethButton = firstPlayer ? 'X' : 'O';
      this.isFirstPlayer = this.isFirstPlayer ? false : true;
    }}
  }

  checkXOwinningCombo(){
    if(this.xoSecondButton === this.xoThirdButton && this.xoThirdButton === this.xoFirstButton && this.xoFirstButton != ''){
      this.b1Color = '#5df585';
      this.b2Color = '#5df585';
      this.b3Color = '#5df585';
      this.xowinner = this.xoSecondButton == 'X' ? this.xoPlayerOne : this.xoPlayerTwo;
      return true;
    }
    else if(this.xoFourthButton === this.xoFifthButton && this.xoFifthButton === this.xoSixthButton && this.xoFourthButton != ''){
      this.b4Color = '#5df585';
      this.b5Color = '#5df585';
      this.b6Color = '#5df585';
      this.xowinner = this.xoFourthButton == 'X' ? this.xoPlayerOne : this.xoPlayerTwo;
      return true;
    }
    else if(this.xoSeventhButton === this.xoEightButton && this.xoEightButton === this.xoNinethButton && this.xoNinethButton != ''){
      this.b7Color = '#5df585';
      this.b8Color = '#5df585';
      this.b9Color = '#5df585';
      this.xowinner = this.xoSeventhButton == 'X' ? this.xoPlayerOne : this.xoPlayerTwo;
      return true;
    }
    else if(this.xoFirstButton === this.xoFourthButton && this.xoFourthButton === this.xoSeventhButton && this.xoFirstButton != ''){
      this.b1Color = '#5df585';
      this.b4Color = '#5df585';
      this.b7Color = '#5df585';
      this.xowinner = this.xoFirstButton == 'X' ? this.xoPlayerOne : this.xoPlayerTwo;
      return true;
    }
    else if(this.xoSecondButton === this.xoFifthButton && this.xoFifthButton === this.xoEightButton && this.xoSecondButton != ''){
      this.b2Color = '#5df585';
      this.b5Color = '#5df585';
      this.b8Color = '#5df585';
      this.xowinner = this.xoSecondButton == 'X' ? this.xoPlayerOne : this.xoPlayerTwo;
      return true;
    }
    else if(this.xoThirdButton === this.xoSixthButton && this.xoSixthButton === this.xoNinethButton && this.xoSixthButton != ''){
      this.b3Color = '#5df585';
      this.b6Color = '#5df585';
      this.b9Color = '#5df585';
      this.xowinner = this.xoThirdButton == 'X' ? this.xoPlayerOne : this.xoPlayerTwo;
      return true;
    }
    else if(this.xoFirstButton === this.xoFifthButton && this.xoFifthButton === this.xoNinethButton && this.xoNinethButton != ''){
      this.b1Color = '#5df585';
      this.b5Color = '#5df585';
      this.b9Color = '#5df585';
      this.xowinner = this.xoFirstButton == 'X' ? this.xoPlayerOne : this.xoPlayerTwo;
      return true;
    }
    else if(this.xoSeventhButton === this.xoFifthButton && this.xoFifthButton === this.xoThirdButton && this.xoThirdButton != ''){
      this.b3Color = '#5df585';
      this.b5Color = '#5df585';
      this.b7Color = '#5df585';
      this.xowinner = this.xoSeventhButton == 'X' ? this.xoPlayerOne : this.xoPlayerTwo;
      return true;
    }
    else return false;
  }
  //==============================================================================   X   O

}
