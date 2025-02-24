import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AppInjectibleService } from './service/app-injectible.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product } from './product';
import { BehaviorSubject, distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule,//Routing links wont work without this import
            FormsModule,
            ReactiveFormsModule,
            CommonModule],//Helps search box work
  providers: [AppInjectibleService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  constructor(public appService:AppInjectibleService,
              private fb:FormBuilder,
              private router:Router,
              private activatedRoute:ActivatedRoute){}

  //Variables.
  appVar_title="PLU Finder";
  searchTerm:string="";

  //Search bar form variable.
  searchForm=this.fb.nonNullable.group({searchTerm:""});

  //Observable variables. Available to all components.
  private productsSubject=new BehaviorSubject<Product[]>([]);
  private deptSubject=new BehaviorSubject<string>("");
  products$=this.productsSubject.asObservable();
  obsrDept$=this.deptSubject.asObservable();

  
  ngOnInit():void{
    //Listen to router events to update the department value.
    this.router.events.pipe(filter(event=>event instanceof NavigationEnd)).subscribe(()=>{
      const currentRoute=this.activatedRoute.root.firstChild; //Grab first "activatedRoute" object
      if(currentRoute){
        const url=currentRoute.snapshot.url.map(segment=>segment.path).join('/'); //Extract url path
        if(url.includes("seafood-page")){this.setDept("Seafood");}
        else if(url.includes("meat-market-page")){this.setDept("Market");}
        else if(url.includes("produce-page")){this.setDept("Produce");}
        else if(url.includes("deli-page")){this.setDept("Deli");}
        else if(url.includes("bakery-page")){this.setDept("Bakery");}
        else{this.setDept('');} //Implied to be the main page
      }
    });
  }

  toggleMenu(event:MouseEvent):void{
    event.stopPropagation();
    console.log("Button clicked.");
    
    const sidebarVar=document.querySelector(".leftSideBar");
    const togglerVar=document.getElementById("mainMobileMenu"); 
    const closeBtnVar=document.getElementById("closeButton");
    if(sidebarVar){ 
      console.log("Sidebar found, toggling open class."); 
      sidebarVar.classList.toggle("open"); 
      console.log("Sidebar classes:",sidebarVar.className); //Output sidebar classes to console 
      if(sidebarVar.classList.contains("open")){
        if(togglerVar){
          console.log("Adding hidden class to toggler.");
          togglerVar.classList.add("hidden");
        }
        if(closeBtnVar){
          console.log("Removing hidden class from close button.");
          closeBtnVar.style.display="block"; 
        }
        //Event listener for closing sidebar on outside click.
        window.onclick=(event)=>{
          if(event.target!==sidebarVar&&!sidebarVar.contains(event.target as Node)&&event.target!==closeBtnVar){
            console.log("Clicked outside, closing sidebar."); 
            sidebarVar.classList.remove("open");
              if(togglerVar)togglerVar.classList.remove("hidden"); 
              if(closeBtnVar)closeBtnVar.style.display="none"; 
            }
          }; 
        }else{ 
          if(togglerVar){
            console.log("Removing hidden class from toggler.");
            togglerVar.classList.remove("hidden");
          }
          if(closeBtnVar){
            console.log("Adding hidden class to close button.");
            closeBtnVar.style.display="none";
          }
        }
      }else{console.log("Sidebar not found");} //Alert if sidebar is not found
    }



  //Method used by any other component to change the "obsrDept$" value.
  setDept(givenString:string):void{this.deptSubject.next(givenString)}

  //Method used by any other component to change the "products$" value.
  setProd(givenArray:Product[]):void{this.productsSubject.next(givenArray);}

  //Method to reset "products$". Works, but does not fulfil intended purpose. NOTE:Gain better
  //understanding of the scope in which components initialize. 
  resetProducts():void{
    this.productsSubject.next([]);
    console.log('ROOT-resetProducts() activated:', this.productsSubject.getValue(),this.products$);
  }

  //Method used to process search box input.
  onSearchSubmit():void{
    this.searchTerm=this.searchForm.value.searchTerm ?? ''; //Capture search box input
    console.log("ROOT-Search term updated:", this.searchTerm);
    this.searchForm.reset(); //Clear search box text after hitting button
    
    this.obsrDept$.pipe(distinctUntilChanged()).subscribe(data=>{ //Subscibe "obsDept$"
      //this.resetProducts();
      console.log("ROOT-Department:", data, this.obsrDept$);
      this.appService.GetFileteredProductsFromDb(this.searchTerm,data).subscribe(data2=>{ //Query
        this.productsSubject.next(data2); //Update "products$" value with queried data
        console.log('ROOT-Query data fetched(obs):', this.products$);
      });
    });
  }

}
