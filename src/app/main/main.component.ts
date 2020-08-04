import { Component, OnInit } from '@angular/core';
import { JsonServiceService } from './../json-service.service';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import {FormControl} from '@angular/forms';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

 myControl = new FormControl();
 base64Image: any;

  constructor(private data: JsonServiceService,
              private https: HttpClient
    ) {
      this.jstoday = formatDate(this.today, 'dd.MM.yyyy.', 'en-US');
    }

    ngOnInit() {
      this.sendDateToService(this.dt);
      this.getJsonResponse();
      this.getDailyStatsDB();
      this.sendIntervalValueToService(7);
      this.getJsonForChart();
      this.fetchCityList();
      this.intervalCurrencyStats();
      this.weatherCity("Zagreb");
    }

  dt = new Date().toISOString().slice(0, 10);
  today = new Date();
  jstoday = '';


  weatherResponse: any;
  stringifiedWeather: any;
  regionWeather: any;
  isDayWeather: any;
  parseRegion: any;
  temperatureWeather: any;
  observationWeather: any;
  visibilityWeather: any;
  feelslikeWeather: any;
  descriptionWeather:any;
  wind_directionWeather:any;
  pressureWeather:any;
  weatherIconWeather:any;
  cloudcoverWeather:any;
  precipWeather:any;
  uvWeather:any;
  humidityWeather:any;
  wind_speedWeather:any;
  queryWeather: any;

  weatherCity(city: any) {
  this.data.getWeatherResponse(city).subscribe((data: any) =>{
  this.weatherResponse = data;
  this.stringifiedWeather = JSON.stringify(this.weatherResponse).toString()
  this.parseRegion = JSON.parse(this.stringifiedWeather);

  this.parseRegion.map((regions: any) =>
  this.regionWeather = regions.region );

  this.parseRegion.map((querys: any) =>
  this.queryWeather = querys.query );

  this.parseRegion.map((isDays: any) =>
  this.isDayWeather = isDays.isDay );

  this.parseRegion.map((temperatures: any) =>
  this.temperatureWeather = temperatures.temperature );
  this.parseRegion.map((windSpeeds: any) =>
  this.wind_speedWeather = windSpeeds.wind_speed );
  this.parseRegion.map((windDirs: any) =>
  this.wind_directionWeather = windDirs.wind_direction );
  this.parseRegion.map((humiditis: any) =>
  this.humidityWeather = humiditis.humidity );
  this.parseRegion.map((uvs: any) =>
  this.uvWeather = uvs.uv_index );
  this.parseRegion.map((visibilitis: any) =>
  this.visibilityWeather = visibilitis.visibility );
  this.parseRegion.map((obsTime: any) =>
  this.observationWeather = obsTime.observation_time );
  this.parseRegion.map((feels: any) =>
  this.feelslikeWeather = feels.feelslike );
  this.parseRegion.map((descs: any) =>
  this.descriptionWeather = descs.description );
  this.parseRegion.map((pressures: any) =>
  this.pressureWeather = pressures.pressure );
  this.parseRegion.map((precipss: any) =>
  this.precipWeather = precipss.precipitation );
  this.parseRegion.map((clouds: any) =>
  this.cloudcoverWeather = clouds.cloudcover );
  this.parseRegion.map((icons: any) =>
  this.weatherIconWeather = icons.weather_icon );
  let imageUrl = this.weatherIconWeather;

  this.getBase64ImageFromURL(imageUrl).subscribe(base64data => {
    this.base64Image = 'data:image/jpg;base64,' + base64data;
  });
  console.log(this.regionWeather)
  })
  }


    //sending date from UI to JsonService
      sendDateToService(value: string) {
        this.data.sendDate(value);
      }

      responseSt: any;
      resp: any;
      parsJson: any;
      middItem: any = [];
      currArray: any =[];
      onesItem: any = [];
      tMidd: any = [];
      tCurr: any = [];
      tOnes: any = [];

      getJsonForChart() {
        this.data.getJsonForChart().subscribe((dataDate: any) => {
          this.tMidd.splice(0, this.tMidd.length);
          this.tCurr.splice(0, this.tCurr.length);
          this.tOnes.splice(0, this.tOnes.length);
          this.resp = dataDate;
          this.responseSt = JSON.stringify(this.resp);
          this.parsJson = JSON.parse(this.responseSt.toString());
          this.middItem = this.parsJson.map(it => {
            this.tMidd.push(Number(it.Srednji.toLocaleString().replace(/,/g, '.')));
            return it.Srednji;
          })
          this.currArray = this.parsJson.map(it =>{
            this.tCurr.push(it.Valuta);
            return it.Valuta;
          })
          this.onesItem = this.parsJson.map(it => {
            this.tOnes.push('1');
          })
        })
      }

      changeDropdowns(){
        console.log("TODO")
      }
      //getting JSON from backend -> populate select/option dynamicly
      responseString: any
      jsonByDate = '';
      response: Object;
      stringifiedData: any;
      parsedJson: any;
      currencyItem: any = [];
      middleItem: any = [];
      unitItem: any = [];
      tempCurr: any = [];
      tempMidd: any = [];
      tempUnit: any = [];

      getJsonResponse() {   // dohvaca valutu, jedinicu i srednji tecaj -> array
        this.data.getJsonResponse().subscribe((dataByDate: any) => {
          this.jsonByDate = dataByDate;
          this.response = dataByDate;
          this.responseString = JSON.stringify(this.response);
          this.parsedJson = JSON.parse(this.responseString.toString().replace(/Država/g, "Drzava").replace(/Srednji za devize/g, "Srednji"));
          this.currencyItem = this.parsedJson.map(item => {
            this.tempCurr.push(item.Valuta);
            return item.Valuta;
          })
          this.middleItem = this.parsedJson.map(itemSrednji => {
            this.tempMidd.push(Number(itemSrednji.Srednji.toLocaleString().replace(/,/g, '.')))
            return itemSrednji.Srednji;
          })
          this.unitItem = this.parsedJson.map(itemJedinica => {
            this.tempUnit.push(itemJedinica.Jedinica);
            return itemJedinica.Jedinica;
          })
        })
        this.tempCurr = this.currencyItem;
        this.tempMidd = this.middleItem;
        this.tempUnit = this.unitItem;
        this.getJsonForChart();
      }

      //=============================================================C A L C U L A T I O N=================================
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

      srednjiPrvi = '1';
      srednjiDrugi = '1';
      prvi = 0;
      drugi = 0;
      rezultat: any = 0;
      vrijednostInput = 0;
      valutaEndView = '';
      calculation(srednji1: number, srednji2: number, vrijednost: number) {
        this.vrijednostInput = vrijednost;
        this.srednjiPrvi = srednji1.toLocaleString().replace(/,/g, '.');
        this.prvi = Number(this.srednjiPrvi);
        this.srednjiDrugi = srednji2.toLocaleString().replace(/,/g, '.');
        this.drugi = Number(this.srednjiDrugi);
        this.rezultat = ((this.vrijednostInput * (Number(this.srednjiPrvi) / this.jedinicaFirst)) / (Number(this.srednjiDrugi) / this.jedinicaSecond)).toFixed(2);
        if(this.rezultat == 'NaN'){
          alert("Iznos za preračun mora biti broj!")
          this.rezultat = 0;
        }
        this.valutaEndView = this.valutaEnd;
        this.getDailyStatsDB();
        this.sendIntervalValueToService(7);
        this.intervalCurrencyStats();
      }

      startValue = '';
      postRequest() {
        this.startValue = this.valutaStart;
        this.data.postStartValue(this.startValue);
      }
      parsedJsonInterval: any;

      //====================================================S T A T I S T I C S====================================

      //fetch statistics for most common start value overall from database
      mostCommonStartValue: any;
      stringifiedDataStats: any;
      parsedJsonStats: any;
      dailyStats: any;
      dailystatsValue: any;

      getDailyStatsDB() {
        return this.data.getMostCommonStartValue().subscribe((data: any) => {
          this.mostCommonStartValue = data;
          this.stringifiedDataStats = JSON.stringify(this.mostCommonStartValue);
          this.parsedJsonStats = JSON.parse(this.stringifiedDataStats.toString());
          this.dailystatsValue = this.parsedJsonStats.map(item => {
            this.dailyStats = item.value;
          })
        })
      }

      //fetch statistics for most common start value from DB by interval
      mostCommonValueInterval: any;
      mostCommonFromInterval: any;
      intervalValue: any;
      stringifiedDataInterval: any;

      sendIntervalValueToService(value: any) {
        this.data.getMostCommonStartValueInterval(value).subscribe((data: any) => {
          this.mostCommonValueInterval = data;
          this.stringifiedDataInterval = JSON.stringify(this.mostCommonValueInterval);
          this.parsedJsonInterval = JSON.parse(this.stringifiedDataInterval.toString());
          this.mostCommonFromInterval = this.parsedJsonInterval.map(item => {
            this.intervalValue = item.value;
          })
        });
      }

      //===================================================C H A R T   DAILYSTATS=============================================

      valueInterval: any;
      fromInterval: any;
      fromIntervalCounter: any;
      intervalVal: any;
      stringiDataInterval: any;
      statsArr: any = [];
      statsArrCounter: any = [];
      valutaStartArray: any = ['HRK'];

      intervalCurrencyStats() {
          this.valutaStartArray.pop();
          this.statsArr.splice(0, this.statsArr.length);
          this.statsArrCounter.splice(0, this.statsArrCounter.length);
          this.data.getCurrencyStats(5000, this.valutaStart).subscribe((data: any) => {
          this.valutaStartArray.push(this.valutaStart);
          this.valueInterval = data;
          this.stringiDataInterval = JSON.stringify(this.valueInterval);
          this.parsedJsonInterval = JSON.parse(this.stringiDataInterval.toString());
          this.fromInterval = this.parsedJsonInterval.map(item => {
            this.statsArr.push(item.valuta);
            return item.valuta;
          })
          this.fromIntervalCounter = this.parsedJsonInterval.map(item =>{
            this.statsArrCounter.push(item.counter);
            return item.counter;
          })
        });
      }

      public barChartOptions2: ChartOptions = {
        responsive: true,
        // We use these empty structures as placeholders for dynamic theming.
        scales: { xAxes: [{}], yAxes: [{}] },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'end',
          }
        }
      };
      public barChartLabels2: Label[] = this.statsArr;
      public barChartType2: ChartType = 'line';
      public barChartLegend2 = true;

      public barChartData2: ChartDataSets[] = [
        { data: this.statsArrCounter,
          label: this.valutaStartArray }
      ];
      public barChartColors2: any[] = [
        {
          backgroundColor: '#f8fa70',
          borderColor: 'black',
      pointBackgroundColor: 'white',
      pointBorderColor: 'red',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(225,10,24,0.2)'
        }
      ];
      //===================================================C H A R T   T E C A J===============================================

      public barChartOptions: ChartOptions = {
        responsive: true,
        // We use these empty structures as placeholders for dynamic theming.
        scales: { xAxes: [{}], yAxes: [{}] },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'end',
          }
        }
      };
      public barChartLabels: Label[] = this.tCurr;
      public barChartType: ChartType = 'bar';
      public barChartLegend = true;

      public barChartData: ChartDataSets[] = [
        { data: this.tMidd, label: 'Currency Value' }, //middItem
        { data: this.tOnes, label: 'HRK' }
      ];
      // events
      public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
        console.log(event, active);
      }
      public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
        console.log(event, active);
      }
      public barChartColors: any[] = [
        {
          backgroundColor: '#48494a'  },
        {
          backgroundColor: '#ad0505'
        }
      ];

      weather = '';
      string = '';
      array: any;
      cityItem = '';
      currentCity: any = [];
      fetchCityList(){
        this.data.getWeather().subscribe((data:any) => {
        this.weather = data;
        this.string = JSON.stringify(this.weather);
        this.array = JSON.parse(this.string.toString());
        this.cityItem = this.array.map(item => {
          this.currentCity.push(item.Grad);
          return item.Grad;
        })
          });
        }

    getBase64ImageFromURL(url: string) {
      return Observable.create((observer) => {
        let img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;  img.src = url;
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


        responses: any = '';
        responsesString = '';
        approve = 'FALSE';
        checkboxTick: any;

        rememberMe(value:any){
          this.checkboxTick = value;
          if(this.checkboxTick == 'true'){
            console.log("TODO")
          }
        }

      loginAttempt(uname: any, psw: any){
        return this.data.login(uname, psw).subscribe((data:any) => {
        this.responses = data;
        this.responsesString = JSON.parse(JSON.stringify(this.responses).toString()).map((data:any) =>
        this.approve = data.value);
        if(this.approve == "FALSE"){
          alert("Pogrešna lozinka i/ili username!")
        }
        });
      }

      messages = '';
      string2 = '';
      arrayForMessages: any;
      fetchMessages(){
        this.data.getMessages().subscribe((data:any) => {
        this.messages = data;
        this.string2 = JSON.stringify(this.messages);
        this.arrayForMessages = JSON.parse(this.string2.toString());
          });
        }

        aprovall = "false";
        isNavbarCollapsed = false;

        toggleNavbarCollapsing() {
            this.isNavbarCollapsed = !this.isNavbarCollapsed;
        }
        collapseAll(){
            this.isNavbarCollapsed = false;
        }

          approvalPsw: any;
          approval(approvalPsw){
            this.approvalPsw = approvalPsw;
            if(this.approvalPsw == 'opensesame'){
              this.aprovall = "OK";
            }
            else{
              alert("Wrong password!");
            }
          }

          name: any;
          surname: any;
          contact: any;
          message: any;
          push(name, surname, contact, message){
            this.name = name;
            this.surname = surname;
            this.contact = contact;
            this.message = message;
            if(this.name == ''){
              alert("You must enter your name!");
            }
            else if(this.surname == ''){
              alert("You must enter your surname!");
            }
            else if(this.contact == ''){
              alert("You must enter your contact info!");
            }
            else if(this.message == ''){
              alert("You must enter a message!");
            }
            else{
            this.data.contactPage(this.name, this.surname, this.contact, this.message);
            }
          }


}
