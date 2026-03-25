import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppInjectibleService } from '../service/app-injectible.service';
import { AppComponent } from '../app.component';
import { Product } from '../product';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CustomMDService } from '../service/markdown.service';

@Component({
  selector: 'app-produce',
  standalone: true,
  imports: [CommonModule,
            HttpClientModule,
            MarkdownModule],
  providers: [AppInjectibleService],
  templateUrl: './produce.component.html',
  styleUrl: './produce.component.css'
})
export class ProduceComponent implements OnInit,OnDestroy{
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
  private dept:string="Produce";
  parsedDescription:SafeHtml=""; //Stores resulting transfomred html

   //Variables for accordion buttons within "i==0".
   selectedButton: string | null = null; //Stores button names
   isDragging:boolean=false; //For accordion buttons in "i==0"
   initialXcoord:number=0; //Helps with button slider
   scrollLeft:number=0; //Helps with button slider
  
  //***Accordion content definition.***
  cordionItems=[
    {title:'Produce Categories',content:'',isOpen:false},
    {title:'Cashier Tips',content:'[DRAFT. FURTHER REVISION NEEDED.]',isOpen:false}
  ];

  ngOnInit(): void{
    //***"Product" tiles***.
    //Reset the "products$" observable when the component is initialized
    console.log('PRDU-Reset1B:',this.appCom.products$);
    this.appCom.resetProducts();
    console.log('PRDU-Reset1A:',this.appCom.products$);

    //Subscribe to "products$".
    this.subscriptions.add(
      this.appCom.products$.subscribe((data:Product[])=>{
        this.products=data;
        if(this.products.length===0){
          console.log('PRDU-Products array is empty.');
        }else{console.log('PRDU-Products loaded(obs):',this.appCom.products$);}
        
        this.getProductImage();
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
     console.log('PRDU-Reset2B:',this.appCom.products$);
     this.appCom.resetProducts();
     console.log('PRDU-Reset2A:',this.appCom.products$);
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

  //Handle click of button within accordion selection of "i==0".
  selectButton(buttonName:string):void{
    this.selectedButton=buttonName;
    console.log(`selectButton called: `, buttonName);
    this.injectibleService.GetFirstCategoryFromDb(buttonName,this.dept).subscribe(fetchedData=>{ 
      this.appCom.setProd(fetchedData);
      console.log('(MeatMrkt)Query data fetched:',this.products);
    });
  }
  
  //In "i==0", initiaton of a drag(mouse).
  onMouseDown(event:MouseEvent):void{
    const container=(event.target as HTMLElement).closest('.fruitButtons, .porkButtons') as HTMLElement;
    this.isDragging=true;
    this.initialXcoord=event.pageX-container.offsetLeft;
    this.scrollLeft=container.scrollLeft;
  }

  //In "i==0", actual motion of the drag(mouse).
  onMouseMove(event:MouseEvent):void{
    if(!this.isDragging) return;
    event.preventDefault();
    const container=(event.target as HTMLElement).closest('.fruitButtons, .porkButtons') as HTMLElement;
    const x=event.pageX-container.offsetLeft; //New "x" coordinate relative to container
    const walk=(x-this.initialXcoord)*2; //Scroll speed
    container.scrollLeft=Math.max(0,Math.min(this.scrollLeft-walk,container.scrollWidth-container.clientWidth)); //Scroll position
  }

  //In "i==0", finalization of a drag(mouse).
  onMouseUp():void{this.isDragging=false;}

  //In "i==0", initiaton of a touch drag.
  onTouchStart(event:TouchEvent):void{
    const container=(event.target as HTMLElement).closest('.fruitButtons, .porkButtons') as HTMLElement;
    this.isDragging=true;
    this.initialXcoord=event.touches[0].pageX-container.offsetLeft;
    this.scrollLeft=container.scrollLeft;
  }

  //In "i==0", actual motion of touch drag.
  onTouchMove(event:TouchEvent):void{
    if(!this.isDragging)return;
    const container=(event.target as HTMLElement).closest('.fruitButtons, .porkButtons') as HTMLElement;
    const x=event.touches[0].pageX-container.offsetLeft; //New "x" coordinate relative to container
    const walk=(x-this.initialXcoord)*2; //Scroll speed
    container.scrollLeft=Math.max(0,Math.min(this.scrollLeft-walk,container.scrollWidth-container.clientWidth)); //Scroll position
  }
  
  //In "i==0", finalization of a touch drag.
  onTouchEnd():void{this.isDragging=false;}
  
}
