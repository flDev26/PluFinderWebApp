import { Routes } from '@angular/router';
import { MeatMarketComponent } from './meat-market/meat-market.component';
import { MainPageComponent } from './main-page/main-page.component';
import { ProduceComponent } from './produce/produce.component';
import { SeafoodComponent } from './seafood/seafood.component';
import { DeliComponent } from './deli/deli.component';
import { BakeryComponent } from './bakery/bakery.component';

export const routes:Routes=[
    {path:"mainPage",component:MainPageComponent},
    {path:"",redirectTo:"mainPage",pathMatch:"full"},
    {path:"meat-market-page",component:MeatMarketComponent},
    {path:"produce-page",component:ProduceComponent},
    {path:"seafood-page",component:SeafoodComponent},
    {path:"deli-page",component:DeliComponent},
    {path:"bakery-page",component:BakeryComponent}
];

