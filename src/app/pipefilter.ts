import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'category' })

export class Pipefilter implements PipeTransform {
  transform(categories: any, searchTitle: any): any {
    if(searchTitle == null || searchTitle == '') {
      return categories;
    } else {
      let filteredCategories = [];
      categories.filter(function(category){
            if(category.toString().toLowerCase().indexOf(searchTitle.toLowerCase()) != -1) {
              if(filteredCategories.indexOf(category) == -1) {
                filteredCategories.push(category);
              }
            }
      });
      return filteredCategories;
    }
  }
}
