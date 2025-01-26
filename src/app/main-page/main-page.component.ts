import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AppInjectibleService } from '../app-injectible.service';
import { Product } from '../product';
import { AppComponent } from '../app.component';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-main-page',
  standalone: true,  //For small scale projects. "app.module.ts" is not used.
  imports: [CommonModule,
            HttpClientModule,
            NgOptimizedImage],
  providers: [AppInjectibleService],  //Important. Else circular dependency complaint occurs.      
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})
export class MainPageComponent implements OnInit,OnDestroy{
  //Refrence variables for non-local services.
  constructor(private injectibleService:AppInjectibleService,
              private appCom:AppComponent){}
  
  //Local variables.
  products:Product[]=[];
  selectedProduct:Product|null=null; //Helps open modals. !!FIX THE DATA TYPING HERE FOR MODALS!! 
  dept:string="";
  private subscriptions:Subscription=new Subscription(); //Helps manage subscriptions.

  ngOnInit():void{
    //Quickly capture px value of window's width
    //this.setVwAsPx();

    //Reset the "products$" observable when the component is initialized
    console.log('MAIN-Reset1B:',this.appCom.products$);
    this.appCom.resetProducts();
    console.log('MAIN-Reset1A:',this.appCom.products$);

    //Subscribe to "products$".
    this.subscriptions.add(
      this.appCom.products$.subscribe((data:Product[])=>{
        this.products=data;
        if(this.products.length===0){
          console.log('MAIN-Products array is empty.');
        }else{console.log('MAIN-Products loaded(obs):',this.appCom.products$);}
        
        this.getProductImage();
      })
    );

    //Get modal element.
    var modalId=document.getElementById("someModalId");

    //Get close button within modal.
    var modalButton=document.getElementsByClassName("close")[0];

    //Close modal on close button click.
    if(modalButton){
      modalButton.addEventListener('click',()=>{
        if(modalId){
          modalId.style.display="none";
        }
      });
    }

    //Close modal on outside click.
    window.addEventListener('click',(event)=>{
      if(event.target==modalId){
        if(modalId){modalId.style.display="none";}
      }
    });
  }

  ngOnDestroy():void{
     this.subscriptions.unsubscribe(); //Unsubscribe from all subscriptions to avoid memory leaks.
     console.log('MAIN-Reset2B:',this.appCom.products$);
     this.appCom.resetProducts();
     console.log('MAIN-Reset2A:',this.appCom.products$);
  }

  //Method to open one modal element.
  openModal(product:Product){
    this.selectedProduct=product;
    const modal=document.getElementById("someModalId");
    if(modal){
      modal.style.display="block";
    }
  }
   
  //Method to grab all database entries.Not ideal. NOT USED CURRENTLY. 
  private getAllProducts(){
    this.injectibleService.GetAllProductsFromDb().subscribe(data=>{
      this.products=[...data]; //Collect all database entries first.
      console.log('Products fetched:', this.products);
      this.getProductImage(); //Then, grab image names from collected entries.
    });
  }

  //Method to grab image corresponding to given product name.
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

  //Method to help express price.
  convertCentsToDollars(cents:number):string{return (cents/100).toFixed(2);}

  // JavaScript to set the pixel value of 98vw as a CSS variable function 
  setVwAsPx(){ 
    const vw=window.innerWidth;
    const varVwPx=vw*0.98; // Calculate 98vw in pixels
    const containerElement=document.querySelector('.container') as HTMLElement;

    if(containerElement){containerElement.style.setProperty('--var_vw', `${varVwPx}px`);}
    console.log("Captured vw in pixels:",varVwPx);
  }

  /*@HostListener('window:resize',['$event'])
   onResize(event:any):void{this.setVwAsPx();}*/
}
