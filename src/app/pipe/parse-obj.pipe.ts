import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseObj',
})
export class ParseObjPipe implements PipeTransform {
  transform(record: Record<string, any>): { key: string; value: any } {
    const [k, v] = Object.entries(record)[0];
    return { key: k, value: v };
  }
}
