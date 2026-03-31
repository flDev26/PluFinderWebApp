import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppInjectibleService } from '../service/app-injectible.service';
import { AppComponent } from '../app.component';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CustomMDService } from '../service/markdown.service';

@Component({
  selector: 'app-bakery',
  standalone: true,
  imports: [CommonModule,
            HttpClientModule,
            MarkdownModule],
  providers: [AppInjectibleService],
  templateUrl: './bakery.component.html',
  styleUrl: './bakery.component.css'
})
export class BakeryComponent implements OnInit,OnDestroy{
  //***Refrence variables for non-local variables.***
  constructor(private injectibleService:AppInjectibleService,
              private appCom:AppComponent,
              private sanitizer: DomSanitizer,
              private markdownService: CustomMDService){}
  
  //***Local variables.***
   private subscriptions:Subscription=new Subscription(); //Helps manage subscriptions

  //Variables to manipulate incoming "Product" arrays.
  products:Product[]=[]; //Captures changes from "products$"
  selectedProduct:Product|null=null; //Helps open modals. !!FIX THE DATA TYPING HERE FOR MODALS!! 
  private dept:string="Bakery";
  parsedDescription: SafeHtml = ""; //Stores resulting transfomred html. 
  public s3ImagePath: string = this.injectibleService.s3ImagesPath; //Images URL path.

    
  //***Accordion content definition.***
  cordionItems=[
    {title:'Subject 1',content:'[ADDITIONAL CONTENT IDEA.]',isOpen:false}
  ];

  
  ngOnInit(): void{
    //***"Product" tiles***.
    //Reset the "products$" observable when the component is initialized
    console.log('BKRY-Reset1B:',this.appCom.products$);
    this.appCom.resetProducts();
    console.log('BKRY-Reset1A:',this.appCom.products$);

    //Subscribe to "products$".
    this.subscriptions.add(
      this.appCom.products$.subscribe((data:Product[])=>{
        this.products=data;
        if(this.products.length===0){
          console.log('BKRY-Products array is empty.');
        }else{console.log('BKRY-Products loaded(obs):',this.appCom.products$);}
        
        //Old way to fetch image...
        //this.getProductImage();
        //New way is done by using the direct connection to the S3 bucket.
      })
    );

    //***Modals***. 
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

  //***Lifecycle Hook: Component closing operations.***
  ngOnDestroy():void{
     this.subscriptions.unsubscribe(); //Unsubscribe from all subscriptions to avoid memory leaks.
     console.log('BKRY-Reset2B:',this.appCom.products$);
     this.appCom.resetProducts();
     console.log('BKRY-Reset2A:',this.appCom.products$);
  }

  //***Methods used by "Product" tiles.***
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

  //Method to help express price(NOT USED CURRRENTLY).
  convertCentsToDollars(cents:number):string{return (cents/100).toFixed(2);}

  //Method to grab all database entries. Not ideal(NOT USED CURRENTLY). 
  private getAllProducts(){
   this.injectibleService.GetAllProductsFromDb().subscribe(data=>{
     this.products=[...data]; //Collect all database entries first.
     console.log('Products fetched:', this.products);
     this.getProductImage(); //Then, grab image names from collected entries.
   });
  }

  //***Methods used by modals.***
  //Renders desired modal content.
  async openModal(product:Product):Promise<void>{
   this.selectedProduct=product;
   const modalId=document.getElementById("someModalId");
  
   if(modalId){
     modalId.style.display="block";
     if(this.selectedProduct?.description){
       const rawHtml=this.markdownService.parse(this.selectedProduct.description);
       this.parsedDescription=this.sanitizer.bypassSecurityTrustHtml(rawHtml);
     }  
   }
  }

  //***Methods used by accordion elements.***
  //Method to open one accordion element.
  togglePanel(index:number){
    this.cordionItems[index].isOpen=!this.cordionItems[index].isOpen;
  }

  
}