import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppInjectibleService } from '../app-injectible.service';
import { AppComponent } from '../app.component';
import { Product } from '../product';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-deli',
  standalone: true,  //For small scale projects. "app.module.ts" is not used.
  imports: [CommonModule,
            HttpClientModule,
            NgOptimizedImage],
  providers: [AppInjectibleService],
  templateUrl: './deli.component.html',
  styleUrl: './deli.component.css'
})
export class DeliComponent implements OnInit,OnDestroy{
  //Refrence variables for non-local services.
  constructor(private injectibleService:AppInjectibleService,
              private appCom:AppComponent){}
  
  //Local variables.
  products:Product[]=[];
  selectedProduct:Product|null=null; //Helps open modals. !!FIX THE DATA TYPING HERE FOR MODALS!! 
  dept:string="Deli";
  private subscriptions:Subscription=new Subscription(); //Helps manage subscriptions.

  //Accordion content.
  cordionItems=[
    {title:'Note: Recommend Substitutiuon',content:'Add note on how app is used to recommend subs.',isOpen:false},
    {title:'Subject 2',content:'Additional content idea can go here.',isOpen:false}
  ];

  ngOnInit():void{
    //Reset the "products$" observable when the component is initialized
    console.log('DLI-Reset1B:',this.appCom.products$);
    this.appCom.resetProducts();
    console.log('DLI-Reset1A:',this.appCom.products$);

    //Subscribe to "products$".
    this.subscriptions.add(
      this.appCom.products$.subscribe((data:Product[])=>{
        this.products=data;
        if(this.products.length===0){
          console.log('DLI-Products array is empty.');
        }else{console.log('DLI-Products loaded(obs):',this.appCom.products$);}
        
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
     console.log('DLI-Reset2B:',this.appCom.products$);
     this.appCom.resetProducts();
     console.log('DLI-Reset2A:',this.appCom.products$);
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
