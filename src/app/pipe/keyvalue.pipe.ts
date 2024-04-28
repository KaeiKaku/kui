import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyvalue',
  standalone: true,
})
export class KeyvaluePipe implements PipeTransform {
  transform(value: Object): any[] {
    return Object.entries(value);
  }
}
