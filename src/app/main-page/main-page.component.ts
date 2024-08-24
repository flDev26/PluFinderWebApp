import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppInjectibleService } from '../app-injectible.service';
import { Product } from '../product';


@Component({
  selector: 'app-main-page',
  standalone: true,  //For small scale projects. "app.module.ts" is not used.
  imports: [CommonModule,
            HttpClientModule,
            NgOptimizedImage],
  providers: [AppInjectibleService],  //Important. Else circular dependency complaint occurs.      
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit{

  //Variable refering to injectible service definitions.
  constructor(private injectibleService:AppInjectibleService){}
  
  //Variables storing collected "Product" class instances.
  products: Product[]=[];
  filteredProducts:Product[]=[];

  ngOnInit(): void {

     // Ensure products are loaded if not already
    if (this.injectibleService.products.length == 0) {
      this.injectibleService.loadProducts();
      console.log("MAIN-Loaded.")
    }

    this.injectibleService.dataReady$.subscribe(
      (isReady: boolean) => {
        if (isReady==true) {
          this.products = this.injectibleService.products;
          console.log("MAIN-Products fetched:",this.products);
          this.getProductImage();
        }
        else if(isReady==false){console.log("MAIN-Not ready.");}
        else{console.log("MAIN-Error with bool observable.");};
      },
      error => {
        console.error('MAIN-Error checking data readiness:', error);
      }
    );

    this.injectibleService.obsrSearchResults$.subscribe(
      (results: Product[]) => {
        this.filteredProducts = results;
        console.log("MAIN-Filtered products fetched:",this.filteredProducts);
        console.log("MAIN-ObsrInput:",this.injectibleService.obsrGivenInput$);
        console.log("MAIN-ObsrResults:",this.injectibleService.obsrSearchResults$);
      }
    );
  }
  

  private getAllProducts(){
    /*this.injectibleService.GetAllProductsFromDb().subscribe(data=>{
      this.products=data; //Collect all database entries first.
      console.log('Products fetched:', this.products);*/
      //grab products fom products[] 
      this.getProductImage(); //Then, grab image names from collected entries.
    //});
    
  }

  private getProductImage(){
    if(this.products.length==0){console.error("Zero products were retrieved.")}
    else{
      this.products.forEach(product=>{
          this.injectibleService.GetOneMainImage(product.imageFileName).subscribe(imageBlob=>{
            product.imageUrl=URL.createObjectURL(imageBlob);
            console.log(`Image URL for ${product.productName}:${product.imageUrl}`);
          },error=>{
            console.error(`Error fetching image for ${product.productName}:`,error);
          });
      });
    }
  }
}
