import { Component, OnInit } from '@angular/core';
import { JsonServiceService } from './../json-service.service';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { FormControl } from '@angular/forms';



@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  base64Image: any;
  constructor(private data: JsonServiceService,
    private https: HttpClient,
  ) {
    this.jstoday = formatDate(this.today, 'dd.MM.yyyy.', 'en-US');
  }

  ngOnInit() {
    this.sendDateToService(this.dt);
    this.getConverterData();
    //this.weatherCity("Zagreb");
    this.getEarthquakeData();
    this.getAllStatistics(7, 30, 'HRK');
  }

  dt = new Date().toISOString().slice(0, 10);
  today = new Date();
  jstoday = '';

  //sending date from UI to JsonService
  sendDateToService(value: string) {
    this.data.sendDate(value);
  }

  //==============================================================================  E A R T H Q U A K E

  myEarthquake(lon: any, lat: any) {
    this.lat = lat;
    this.lng = lon;
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
      this.parseWeather.map((regions: any) =>
        this.regionWeather = regions.region);
      this.parseWeather.map((querys: any) =>
        this.queryWeather = querys.query);
      this.parseWeather.map((isDays: any) =>
        this.isDayWeather = isDays.isDay);
      this.parseWeather.map((temperatures: any) =>
        this.temperatureWeather = temperatures.temperature);
      this.parseWeather.map((windSpeeds: any) =>
        this.wind_speedWeather = windSpeeds.wind_speed);
      this.parseWeather.map((windDirs: any) =>
        this.wind_directionWeather = windDirs.wind_direction);
      this.parseWeather.map((humiditis: any) =>
        this.humidityWeather = humiditis.humidity);
      this.parseWeather.map((uvs: any) =>
        this.uvWeather = uvs.uv_index);
      this.parseWeather.map((visibilitis: any) =>
        this.visibilityWeather = visibilitis.visibility);
      this.parseWeather.map((obsTime: any) =>
        this.observationWeather = obsTime.observation_time);
      this.parseWeather.map((feels: any) =>
        this.feelslikeWeather = feels.feelslike);
      this.parseWeather.map((descs: any) =>
        this.descriptionWeather = descs.description);
      this.parseWeather.map((pressures: any) =>
        this.pressureWeather = pressures.pressure);
      this.parseWeather.map((precipss: any) =>
        this.precipWeather = precipss.precipitation);
      this.parseWeather.map((clouds: any) =>
        this.cloudcoverWeather = clouds.cloudcover);
      this.parseWeather.map((icons: any) =>
        this.weatherIconWeather = icons.weather_icon);
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
  //============================================================================== C O N V E R T E R

  parsedJson: any;
  getConverterData() {
    this.data.getJsonResponse().subscribe((dataByDate: any) => {
      this.parsedJson = JSON.parse(JSON.stringify(dataByDate)
        .replace(/Država/g, "Drzava").replace(/Srednji za devize/g, "Srednji"));
    })
  }

  postRequest() {
    this.data.postStartValue(this.valutaStart);
  }

  startSwap: any;
  endSwap: any;
  swapOptions(firstOption: any, secondOption: any) {
    this.startSwap = this.parsedJson[0].SelectOption;
    this.endSwap = this.parsedJson[0].SelectOption;
    for (let i = 0; i < this.parsedJson.length; i++) {
      if (firstOption == this.parsedJson[i].Srednji) {
        this.endSwap = this.parsedJson[i].SelectOption;
      }
      else if (secondOption == this.parsedJson[i].Srednji) {
        this.startSwap = this.parsedJson[i].SelectOption;
      }
    }
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
  valutaEndView = '';
  calculation(srednjiTecajPrvi: number, srednjiTecajDrugi: number, vrijednost: number) {
    this.rezultat = ((vrijednost * (Number(srednjiTecajPrvi.toLocaleString().replace(/,/g, '.')) / this.jedinicaFirst)) / (Number(srednjiTecajDrugi.toLocaleString().replace(/,/g, '.')) / this.jedinicaSecond)).toFixed(2);
    if (this.rezultat == 'NaN') {
      alert("Iznos za preračun mora biti broj!")
      this.rezultat = 0;
    }
    this.valutaEndView = this.valutaEnd;
    this.getAllStatistics(7, 30, this.startValueChart);
    this.postRequest();
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
  //============================================================================== N A V B A R

  isNavbarCollapsed = false;
  toggleNavbarCollapsing() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  collapseAll() {
    this.isNavbarCollapsed = false;
  }
  //============================================================================== N A V B A R
}
