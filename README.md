# 👟 UTPShop - Frontend (Angular)

Este es el frontend de la tienda de zapatos UTPShop, desarrollado en Angular (versión 17+ con componentes Standalone y Signals). Su diseño está inspirado en una estética premium tipo Nike/Adidas.

## 👥 Roles del Sistema y Accesos
El sistema cuenta con 4 roles bien diferenciados que modifican la experiencia de usuario:
1. **Cliente:** Puede registrarse, iniciar sesión (con toggle de visibilidad de contraseña), explorar categorías, filtrar por "Destacado" (Los Más Vendidos), agregar al carrito, completar su checkout detallando su dirección (con Ubigeo reactivo) y ver su historial de compras con boletas interactivas.
2. **Administrador:** Accede al Panel de Control completo para gestionar el inventario de calzados (tallas, stock, colores, marcas), modificar el estado de los pedidos, dar de alta/baja a usuarios y visualizar métricas de ventas.
3. **Vendedor:** Rol enfocado en la atención directa y despacho de pedidos. Puede actualizar estados de órdenes y gestionar las entregas.
4. **Repartidor:** Cuenta con una interfaz optimizada para ver las entregas asignadas y su estado en tiempo real (gracias al uso de WebSockets).

## 🚀 Cómo correr el proyecto en Local

Para probar la aplicación en tu computadora, sigue estos pasos:

### Requisitos previos:
* Tener **Node.js** instalado (versión 18 o superior recomendada).

### Pasos de ejecución:
1. Abre tu terminal en la carpeta del frontend:
   ```bash
   cd tienda-zapatos-frontend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Levanta el servidor de desarrollo de Angular:
   ```bash
   ng serve
   ```
4. Abre tu navegador en [http://localhost:4200](http://localhost:4200).

*Nota: Por defecto, el frontend se conectará al backend configurado en `src/environments/environment.ts`.*
