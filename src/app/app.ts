import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [RouterOutlet]
})
export class App {
  protected title = 'PuntoDeVenta';
}
