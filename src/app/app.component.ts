import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonServiceService } from './json-service.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MegaProjekt';

  constructor(private data: JsonServiceService,
              private https: HttpClient ) { }

  ngOnInit() {}



}
