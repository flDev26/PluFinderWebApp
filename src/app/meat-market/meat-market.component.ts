import { Component, OnInit } from '@angular/core';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { AppInjectibleService } from '../app-injectible.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-meat-market',
  standalone: true,  //For small scale projects. "app.module.ts" is not used.
  imports: [CommonModule,
            HttpClientModule],
  providers:[AppInjectibleService], //Important. Else circular dependency complaint occurs.
  templateUrl: './meat-market.component.html',
  styleUrl: './meat-market.component.css'
})
export class MeatMarketComponent implements OnInit{

  //Variable refering to injectible service definitions.
  constructor(private injectibleService:AppInjectibleService){}

  //Variable storing a blank "Product" class instance.
  products: Product[]=[];

  ngOnInit(): void {
    /*this.productInstance=[
      {id:2, 
       productName:'Steak',
       mainImageUrl:'steak.png',
       plu:12345, 
       department:'MeatMarket', 
       priceInCents:1000, 
       unit:"/lb", 
       category:"Beef", 
       description:"The most well known meat slice."
      },
      {id:3, 
       productName:'Trout', 
       mainImageUrl:'trout.png', 
       plu:67890, 
       department:'Seafood',
       priceInCents:700, 
       unit:"/lb", 
       category:"Fish", 
       description:"Freshwater. Simlar to salmon, but has a milder taste."
      }
    ];*/

    this.getAllProducts();
    
  }

  private getAllProducts(){
    this.injectibleService.GetAllProductsFromDb().subscribe(data=>{this.products=data;});
  }
}