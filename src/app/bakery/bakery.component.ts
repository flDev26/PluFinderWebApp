import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppInjectibleService } from '../app-injectible.service';
import { AppComponent } from '../app.component';
import { Product } from '../product';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-bakery',
  standalone: true,
  imports: [CommonModule,
            HttpClientModule,
            NgOptimizedImage],
  providers: [AppInjectibleService],
  templateUrl: './bakery.component.html',
  styleUrl: './bakery.component.css'
})
export class BakeryComponent implements OnInit,OnDestroy{
  //Refrence variables for non-local services.
  constructor(private injectibleService:AppInjectibleService,
              private appCom:AppComponent){}
  
  //Local variables.
  products:Product[]=[];
  selectedProduct:Product|null=null; //Helps open modals. !!FIX THE DATA TYPING HERE FOR MODALS!! 
  dept:string="Bakery";
  private subscriptions:Subscription=new Subscription(); //Helps manage subscriptions.

  //Accordion content.
  cordionItems=[
    {title:'Note: Times and Temperatures',content:'Add note explaing temp/time feature for products.',isOpen:false},
    {title:'Subject 2',content:'Additional content idea can go here.',isOpen:false}
  ];

  ngOnInit():void{
    //Reset the "products$" observable when the component is initialized
    console.log('BKR-Reset1B:',this.appCom.products$);
    this.appCom.resetProducts();
    console.log('BKR-Reset1A:',this.appCom.products$);

    //Subscribe to "products$".
    this.subscriptions.add(
      this.appCom.products$.subscribe((data:Product[])=>{
        this.products=data;
        if(this.products.length===0){
          console.log('BKR-Products array is empty.');
        }else{console.log('BKRProducts loaded(obs):',this.appCom.products$);}
        
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
     console.log('BKR-Reset2B:',this.appCom.products$);
     this.appCom.resetProducts();
     console.log('BKR-Reset2A:',this.appCom.products$);
  }

  //Method to open one accordion element.
  togglePanel(index:number){
    this.cordionItems[index].isOpen=!this.cordionItems[index].isOpen;
  }

  //Method to open one modal element.
  openModal(product:Product){
    this.selectedProduct=product;
    const modal=document.getElementById("someModalId");
    if(modal){
      modal.style.display="block";
    }
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
}

