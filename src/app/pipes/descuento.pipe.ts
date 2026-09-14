import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'descuentoPrice',
  standalone: true
})
export class DescuentoPricePipe implements PipeTransform {
  transform(precioOriginal: number, porcentajeDescuento: number = 10): number {
    if (!precioOriginal) return 0;
    const descuento = precioOriginal * (porcentajeDescuento / 100);
    return precioOriginal - descuento;
  }
}
