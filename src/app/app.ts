import { Component, signal } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Footer } from "./footer/footer";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, CommonModule, Footer, ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FacturacionAngularPantallas');

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

}
