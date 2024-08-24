import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AppInjectibleService } from './app-injectible.service';
import { FormsModule } from '@angular/forms';
import { Product } from './product';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule,//Routing links wont work without this import.
            FormsModule],//Helps search box work. 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  appVar_title = 'PLU Finder';
  searchTerm="";

  constructor(public appService: AppInjectibleService) {}

  ngOnInit(): void {
   //this.appService.loadProducts();

  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.appService.updateSearchTerm(this.searchTerm);
  }

  onSearch(): void {
    this.appService.obsrGivenInput$.subscribe(term => {
      this.appService.updateSearchTerm(this.searchTerm);
    });
  }
}
