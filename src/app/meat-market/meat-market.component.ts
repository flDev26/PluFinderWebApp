import { AfterViewInit, ElementRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../product';
import { CommonModule} from '@angular/common';
import { AppInjectibleService } from '../service/app-injectible.service';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AppComponent } from '../app.component'
import panzoom from 'panzoom';
import { MarkdownModule } from 'ngx-markdown';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CustomMDService } from '../service/markdown.service';



@Component({
  selector: 'app-meat-market',
  standalone: true,  //For small scale projects. "app.module.ts" is not used.
  imports: [CommonModule,
            HttpClientModule,
            MarkdownModule],
  providers: [AppInjectibleService],
  templateUrl: './meat-market.component.html',
  styleUrl: './meat-market.component.css'
})
export class MeatMarketComponent implements OnInit,OnDestroy,AfterViewInit{
  //***Refrence variables for non-local variables.***
  constructor(private injectibleService:AppInjectibleService,
              private appCom:AppComponent,
              private eleRef:ElementRef,
              private sanitizer: DomSanitizer,
              private markdownService: CustomMDService){}
  
  //***Local variables.***
   private subscriptions:Subscription=new Subscription(); //Helps manage subscriptions

  //Variables to manipulate incoming "Product" arrays.
  products:Product[]=[]; //Captures changes from "products$"
  selectedProduct:Product|null=null; //Helps open modals. !!FIX THE DATA TYPING HERE FOR MODALS!! 
  private dept:string="Market";
  parsedDescription:SafeHtml=""; //Stores resulting transfomred html. 
 
  //Variables for accordion buttons within "i==0".
  selectedButton: string | null = null; //Stores button names
  isDragging:boolean=false; //For accordion buttons in "i==0"
  initialXcoord:number=0; //Helps with button slider
  scrollLeft:number=0; //Helps with button slider

  //Variables for accordion image maps within "i==1,2".
  private startX:number|null=null; //Helps track touch coordinates
  private startY:number|null=null; //Helps track touch coordinates
  private containers:NodeListOf<HTMLElement>|null=null; //Refrences an html container array(image maps)
  private areas:NodeListOf<SVGPolygonElement>|null=null; //Refrences an html polygon element

  //***Accordion content definition.***
  cordionItems=[ //Accordion content
    {title:'Beef/Pork Categories',content:'',isOpen:false},
    {title:'Filter by Beef Cut',content:'',isOpen:false},
    {title:'Filter by Pork Cut',content:'',isOpen:false}
    
  ];

  //***Lifecycle Hook: Component set up***.
  ngOnInit(): void{
    //***"Product" tiles***.
    //Reset the "products$" observable when the component is initialized
    console.log('MTMKT-Reset1B:',this.appCom.products$);
    this.appCom.resetProducts();
    console.log('MTMKT-Reset1A:',this.appCom.products$);

    //Subscribe to "products$".
    this.subscriptions.add(
      this.appCom.products$.subscribe((data:Product[])=>{
        this.products=data;
        if(this.products.length===0){
          console.log('MTMKT-Products array is empty.');
        }else{console.log('MTMKT-Products loaded(obs):',this.appCom.products$);}
        
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
  
  //***Lifecycle Hook: Interaction with component in view***.
  ngAfterViewInit():void{
    //***Image Maps***.
    //Ensure code runs only in the browser environment. Not rendered in a server or etc.
    if(typeof window!=='undefined'){
      //Store in array both instances of ".zoomable" container.
      this.containers=document.querySelectorAll<HTMLElement>(".zoomable");

      //Apply below code to every unique instance of "containers".
      this.containers.forEach((container:HTMLElement)=>{
        if(container){ //If "container" is not NULL, work
          const pz=panzoom(container,{ //Zoom ability defined here
            maxZoom:4,
            minZoom:1,
            bounds:true,
            boundsPadding:0.2
          });
        
          this.areas=this.eleRef.nativeElement.querySelectorAll('polygon'); //Reference variable for "polygon" elements
          if(this.areas){ //If "areas" is not NULL, work
            console.log('Number of polygons:',this.areas.length);
          
            //Event handler: Start of a touchscreen press(polygon).
            const handleTouchStart=(e:TouchEvent)=>{
              console.log('Touch start detected');
              const touch=e.touches[0];
              this.startX=touch.clientX; //Store touch coordinate
              this.startY=touch.clientY; //Store touch coordinate
              const area=e.target as SVGPolygonElement;
              area.classList.add('touch-active'); //Tag polygon with class. Class refrenced in "meat-market.compoenent.css" 
            };
          
            //Event handler: Dragging(polygon).
            const handleTouchMove=(e:TouchEvent)=>{
              //Handler variables.
              const touch=e.touches[0];
              const endX=touch.clientX; //Store touch coordinate
              const endY=touch.clientY; //Store touch coordinate
              const deltaX=Math.abs(endX-this.startX!); //Calculate the distance moved
              const deltaY=Math.abs(endY-this.startY!); //Calculate the distance moved

              //Tag polygon with class if significant drag. Class refrenced in "meat-market.compoenent.css".
              if(deltaX>10||deltaY>10){ 
                const area=e.target as SVGPolygonElement;
                area.classList.add('dragging');
                area.classList.remove('touch-active');
              }
            };
          
            //Event handler: End of touchscreen press(polygon).
            const handleTouchEnd=(e:TouchEvent)=>{
              if(this.startX!==null&&this.startY!==null){
                //Handler variables.
                const touch=e.changedTouches[0];
                const endX=touch.clientX; //Store touch coordinate
                const endY=touch.clientY; //Store touch coordinate
                const deltaX=Math.abs(endX-this.startX); //Calculate the distance moved
                const deltaY=Math.abs(endY-this.startY); //Calculate the distance moved
                const area=e.target as SVGPolygonElement; //Refrence variable for polygon touched
                const imgMapArea=area.getAttribute('data-area'); //Polygon's attribute
              
                //If no significant drag, handle the click.
                if(deltaX<=10&&deltaY<=10){
                  e.preventDefault();
                  area.classList.remove('touch-active'); //Remove "touch-active" class tag from polygon
                  if(imgMapArea){
                    console.log(`Touch end detected on area:${imgMapArea}`);
                    this.onAreaClick(imgMapArea);
                  }
                }
                //If a significant drag was detected, remove the dragging class.
                else{area.classList.remove('dragging');}
              
                //Reset touch coordinates.
                this.startX=null;
                this.startY=null;
              }
            };
          
            //Event handler: Mouse click(polygon).
            const handleClick=(e:MouseEvent)=>{
              //Handler variables.
              const area=e.target as SVGPolygonElement; //Reference variable for polygon touched
              const imgMapArea=area.getAttribute('data-area'); //Polygon's attribute

              e.preventDefault();
              if(imgMapArea){
                console.log(`Click detected on area:${imgMapArea}`);
                this.onAreaClick(imgMapArea);
              }
            };
          
            //Event listeners to invoke event handlers.
            this.areas.forEach((area: SVGPolygonElement)=>{
              area.addEventListener('touchstart',handleTouchStart);
              area.addEventListener('touchmove',handleTouchMove);
              area.addEventListener('touchend',handleTouchEnd);
              area.addEventListener('click',handleClick);
            });
          }
        }
      });
    }
  }

  //***Lifecycle Hook: Component closing operations.***
  ngOnDestroy():void{
     this.subscriptions.unsubscribe(); //Unsubscribe from all subscriptions to avoid memory leaks.
     console.log('MTMKT-Reset2B:',this.appCom.products$);
     this.appCom.resetProducts();
     console.log('MTMKT-Reset2A:',this.appCom.products$);
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
  //Handle opening of accordion element.
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
    const container=(event.target as HTMLElement).closest('.beefButtons, .porkButtons') as HTMLElement;
    this.isDragging=true;
    this.initialXcoord=event.pageX-container.offsetLeft;
    this.scrollLeft=container.scrollLeft;
  }

  //In "i==0", actual motion of the drag(mouse).
  onMouseMove(event:MouseEvent):void{
    if(!this.isDragging) return;
    event.preventDefault();
    const container=(event.target as HTMLElement).closest('.beefButtons, .porkButtons') as HTMLElement;
    const x=event.pageX-container.offsetLeft; //New "x" coordinate relative to container
    const walk=(x-this.initialXcoord)*2; //Scroll speed
    container.scrollLeft=Math.max(0,Math.min(this.scrollLeft-walk,container.scrollWidth-container.clientWidth)); //Scroll position
  }

  //In "i==0", finalization of a drag(mouse).
  onMouseUp():void{this.isDragging=false;}

  //In "i==0", initiaton of a touch drag.
  onTouchStart(event:TouchEvent):void{
    const container=(event.target as HTMLElement).closest('.beefButtons, .porkButtons') as HTMLElement;
    this.isDragging=true;
    this.initialXcoord=event.touches[0].pageX-container.offsetLeft;
    this.scrollLeft=container.scrollLeft;
  }

  //In "i==0", actual motion of touch drag.
  onTouchMove(event:TouchEvent):void{
    if(!this.isDragging)return;
    const container=(event.target as HTMLElement).closest('.beefButtons, .porkButtons') as HTMLElement;
    const x=event.touches[0].pageX-container.offsetLeft; //New "x" coordinate relative to container
    const walk=(x-this.initialXcoord)*2; //Scroll speed
    container.scrollLeft=Math.max(0,Math.min(this.scrollLeft-walk,container.scrollWidth-container.clientWidth)); //Scroll position
  }
  
  //In "i==0", finalization of a touch drag.
  onTouchEnd():void{this.isDragging=false;}

  //In "i==1,2", handle polygon area click.
  onAreaClick(imgMapArea:string){
    console.log(`onAreaClick called with imgMapArea:${imgMapArea}, dept:${this.dept}`);
    this.injectibleService.GetMarketSecondCategoryFromDb(imgMapArea).subscribe(fetchedData=>{ 
      this.appCom.setProd(fetchedData);
      console.log('(MeatMrkt)Query data fetched:',this.products);
    });
  }
}
