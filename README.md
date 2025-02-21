# Conexa Challenge

## Decisiones que se tomaron

- Arquitectura modular: Se implementó una arquitectura modular en la que cada módulo cumple con una responsabilidad específica, lo que permite reducir las dependencias entre ellos y facilita el mantenimiento y escalabilidad del sistema.
- Seguridad: Para los endpoints donde se hacia algun tipo de modificacion en la base de datos se agrego autenticacion utilizando jwt.

## Mejoras a futuro

- Patrón Repository: Para manejar la conexión con la base de datos, se podria utilizar el patrón Repository. Este enfoque desacopla la lógica de acceso a datos del resto de la aplicación, lo que hace posible cambiar el ORM o incluso la base de datos en el futuro sin realizar modificaciones significativas en el código.

## Requisitos para la utilizacion del proyecto

- Tener docker instalado

## Pasos para ejecutar el proyecto

1. Clonar el repositorio
2. Instalar las dependencias

```bash
    npm install
```

3. Crear el archivo .env con las variables que se han definido en el .env.template
4. Levantar la base de datos utilizando docker-compose

```bash
    docker-compose up -d
```

5. Ejecutar las migraciones de prisma

```bash
    npx prisma migrate deploy
```

6. Ejecutar el proyecto

```bash
    npm run start:dev
```

7. Ejecutar los tests

```bash
    npm run test
```

o

```bash
    npm run test:cov
```

## Despliegue de Proyecto

El proyecto se encuentra desplegado en esta [URL](https://pagos360-challenge-back.onrender.com/).
Ten en cuenta que esta desplegado en Render y puede que la primera vez demore en cargar o falle ya que hay una limitacion de plan gratuito

## Instrucciones para ver la documentacion de swagger

1. Debes acceder al /docs para ver la documentacion de la API
