# DesarrolloWeb Backend

Backend Spring Boot para una tienda de zapatos. Incluye autenticacion con JWT, gestion de productos, clientes, carrito, pedidos y ofertas.

## Tecnologias

- Java 25
- Spring Boot 4.0.5
- Spring Web MVC
- Spring Data JPA
- Spring Security
- OAuth2 Resource Server JWT
- MySQL
- Maven

## Estructura principal

```text
src/main/java/com/Utp/DesarrolloWeb
+-- config/          Configuracion de seguridad JWT
+-- controller/      Controladores REST
+-- dto/             Requests y responses de autenticacion
+-- model/           Entidades JPA
+-- repository/      Repositorios Spring Data JPA
+-- service/         Logica de negocio
```

## Configuracion local

La configuracion esta en:

```text
src/main/resources/application.properties
```

Valores actuales:

```properties
server.port=8090

spring.datasource.url=jdbc:mysql://localhost:3306/desarrolloweb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=1234
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

app.jwt.expiration-minutes=60
```

Antes de iniciar el backend, crea la base de datos en MySQL:

```sql
CREATE DATABASE desarrolloweb;
```

Si tu usuario o contrasena de MySQL es diferente, actualiza:

```properties
spring.datasource.username=root
spring.datasource.password=1234
```

## Como ejecutar el proyecto

Desde un IDE como IntelliJ IDEA, Eclipse o Spring Tool Suite:

1. Abre el proyecto.
2. Espera a que cargue Maven.
3. Ejecuta la clase:

```text
src/main/java/com/Utp/DesarrolloWeb/DesarrolloWebApplication.java
```

Desde terminal, si Maven Wrapper funciona:

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

Si el wrapper falla, instala Maven globalmente y ejecuta:

```bash
mvn spring-boot:run
```

La API debe quedar disponible en:

```text
http://localhost:8090
```

## Seguridad y JWT

Rutas publicas:

- `POST /auth/register`
- `POST /auth/login`
- `GET /api/zapatos`
- `GET /api/zapatos/{id}`

El resto de rutas requiere autenticacion con JWT.

Para endpoints protegidos, en Postman agrega el header:

```text
Authorization: Bearer TU_TOKEN
```

Para requests con JSON agrega:

```text
Content-Type: application/json
```

Roles disponibles:

```text
USER
ADMIN
```

## Flujo recomendado en Postman

1. Registrar un usuario ADMIN.
2. Iniciar sesion con ese usuario.
3. Copiar el token de la respuesta.
4. Probar endpoints protegidos usando `Authorization: Bearer TU_TOKEN`.
5. Crear productos.
6. Probar carrito, compras y ganancias.

## AuthController

Base:

```text
/auth
```

### Registrar usuario ADMIN

```http
POST http://localhost:8090/auth/register
```

Body:

```json
{
  "nombre": "Admin",
  "email": "admin@test.com",
  "password": "123456",
  "rol": "ADMIN"
}
```

Respuesta esperada:

```text
Usuario registrado correctamente
```

### Registrar usuario USER

```http
POST http://localhost:8090/auth/register
```

Body:

```json
{
  "nombre": "Juan",
  "email": "juan@test.com",
  "password": "123456",
  "rol": "USER"
}
```

### Login

```http
POST http://localhost:8090/auth/login
```

Body:

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

Respuesta esperada:

```json
{
  "token": "TOKEN_JWT",
  "tipo": "Bearer",
  "email": "admin@test.com",
  "rol": "ADMIN"
}
```

Usa el valor de `token` en Postman:

```text
Authorization: Bearer TOKEN_JWT
```

## ProductoController

Base:

```text
/api/zapatos
```

### Listar productos

Publico.

```http
GET http://localhost:8090/api/zapatos
```

### Buscar producto por ID

Publico.

```http
GET http://localhost:8090/api/zapatos/1
```

### Crear producto

Requiere token ADMIN.

```http
POST http://localhost:8090/api/zapatos
```

Headers:

```text
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Air Max",
  "marca": "Nike",
  "talla": "42",
  "color": "Negro",
  "categoria": "Deportivo",
  "precio": 250.0,
  "stock": 10,
  "descripcion": "Zapatilla deportiva",
  "imagenUrl": "https://example.com/zapato.jpg"
}
```

### Actualizar producto

Requiere token ADMIN.

```http
PUT http://localhost:8090/api/zapatos/1
```

Body:

```json
{
  "nombre": "Air Max Actualizado",
  "marca": "Nike",
  "talla": "42",
  "color": "Blanco",
  "categoria": "Deportivo",
  "precio": 280.0,
  "stock": 15,
  "descripcion": "Zapatilla deportiva actualizada",
  "imagenUrl": "https://example.com/zapato-actualizado.jpg"
}
```

### Eliminar producto

Requiere token ADMIN.

```http
DELETE http://localhost:8090/api/zapatos/1
```

## ClienteController

Base:

```text
/clientes
```

Requiere token.

### Listar clientes

```http
GET http://localhost:8090/clientes
```

### Buscar cliente por ID

```http
GET http://localhost:8090/clientes/1
```

### Crear cliente

```http
POST http://localhost:8090/clientes
```

Body:

```json
{
  "nombre": "Carlos",
  "apellido": "Perez",
  "email": "carlos@test.com",
  "telefono": "999888777"
}
```

### Eliminar cliente

```http
DELETE http://localhost:8090/clientes/1
```

## CarritoController

Base:

```text
/carrito
```

Requiere token.

### Agregar producto al carrito

Usa query params, no body JSON.

```http
POST http://localhost:8090/carrito/agregar?idProducto=1&cantidad=2
```

### Listar carrito

```http
GET http://localhost:8090/carrito
```

### Obtener total del carrito

```http
GET http://localhost:8090/carrito/total
```

### Eliminar producto del carrito

El parametro `{id}` corresponde al ID del producto.

```http
DELETE http://localhost:8090/carrito/1
```

### Vaciar carrito

```http
DELETE http://localhost:8090/carrito/vaciar
```

## PedidoController

Base:

```text
/api/pedidos
```

### Registrar compra

Requiere token.

```http
POST http://localhost:8090/api/pedidos/comprar
```

Body:

```json
{
  "detalles": [
    {
      "producto": {
        "id": 1
      },
      "cantidad": 2
    }
  ]
}
```

El backend calcula automaticamente:

- `subtotal`
- `total`
- descuento de stock

### Ver ganancias totales

Requiere token ADMIN.

```http
GET http://localhost:8090/api/pedidos/admin/ganancias
```

## OfertaController

Base:

```text
/ofertas
```

Requiere token.

### Aplicar descuento

Usa query params.

```http
PUT http://localhost:8090/ofertas/descuento/1?porcentaje=20
```

El parametro `{id}` es el ID del producto.

## Codigos comunes en Postman

### 200 OK

La consulta o actualizacion fue correcta.

### 201 Created

El recurso fue creado correctamente.

### 204 No Content

El recurso fue eliminado correctamente.

### 401 Unauthorized

Falta el token JWT, el token esta vencido o el header `Authorization` esta mal formado.

Formato correcto:

```text
Authorization: Bearer TOKEN_JWT
```

### 403 Forbidden

El token existe, pero el usuario no tiene permisos suficientes.

Ejemplo: intentar crear productos con un usuario `USER` en vez de `ADMIN`.

### 500 Internal Server Error

Puede ocurrir si:

- El producto no existe.
- No hay stock suficiente.
- MySQL no esta levantado.
- La base de datos no existe.
- Se envia un body con campos incorrectos.

## Orden completo de prueba

1. Crear la base de datos `desarrolloweb`.
2. Levantar el backend.
3. Registrar usuario ADMIN con `POST /auth/register`.
4. Hacer login con `POST /auth/login`.
5. Copiar el token.
6. Crear producto con `POST /api/zapatos`.
7. Listar productos con `GET /api/zapatos`.
8. Agregar producto al carrito con `POST /carrito/agregar?idProducto=1&cantidad=2`.
9. Ver carrito con `GET /carrito`.
10. Ver total con `GET /carrito/total`.
11. Registrar compra con `POST /api/pedidos/comprar`.
12. Ver ganancias con `GET /api/pedidos/admin/ganancias`.

## Notas importantes

- Si cambias codigo de seguridad o controladores, reinicia Spring Boot.
- Si cambias datos de usuario o roles, vuelve a hacer login para obtener un token nuevo.
- `spring.jpa.hibernate.ddl-auto=update` crea o actualiza tablas automaticamente segun las entidades.
- No compartas `app.jwt.secret` en un entorno real de produccion.
- El endpoint de descuento devuelve el producto con precio modificado, pero conviene validar si el cambio queda persistido en base de datos.
