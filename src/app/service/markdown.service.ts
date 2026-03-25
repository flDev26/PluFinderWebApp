
import { Injectable } from '@angular/core';
import * as marked from 'marked';

@Injectable({
  providedIn: 'root'
})
export class CustomMDService{
  constructor(){}

  parse(markdown:string):string{
    return marked.parse(markdown);  //Use the parse method from marked
  }
}
