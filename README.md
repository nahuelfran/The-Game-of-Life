# 🧬 Juego de la Vida de Conway

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-22c55e.svg)](LICENSE)
[![Dependencias: ninguna](https://img.shields.io/badge/dependencias-ninguna-06b6d4.svg)](#-cómo-ejecutarlo)
[![Canvas HTML5](https://img.shields.io/badge/render-HTML5%20Canvas-a855f7.svg)](#️-detalles-técnicos)

> *"Cuatro reglas. Ninguna excepción. Y sin embargo, de ahí brota un universo."*

Una implementación interactiva y minimalista del **Juego de la Vida de John Horton Conway** (1970), construida con **HTML5 Canvas**, **Tailwind CSS** y **JavaScript moderno**.

No es un juego que se juega. Es un juego que te observa jugar.

---

## 📖 Índice

1. [¿Qué es el Juego de la Vida?](#-qué-es-el-juego-de-la-vida)
2. [Las Reglas](#-las-reglas)
3. [Cómo se ve la vida en números](#-cómo-se-ve-la-vida-en-números)
4. [Patrones Famosos](#-patrones-famosos)
5. [Controles](#-controles)
6. [Atajos de Teclado](#-atajos-de-teclado)
7. [Cómo ejecutarlo](#-cómo-ejecutarlo)
8. [Detalles técnicos](#-detalles-técnicos)
9. [Nota filosófica: el jardín de cuatro reglas](#-nota-filosófica-el-jardín-de-cuatro-reglas)
10. [Licencia](#-licencia)

---

## 🌱 ¿Qué es el Juego de la Vida?

Es un **autómata celular**: una cuadrícula infinita (en esta implementación, un toroide que se envuelve sobre sí mismo) donde cada casilla —cada *célula*— está **viva** o **muerta**.

En cada **generación**, todas las células evalúan simultáneamente a sus **ocho vecinas** y deciden su destino. No hay jugadores. No hay ganadores. No hay puntuación.

Y aun así, de esa nada absoluta emergen planeadores que viajan eternamente, cañones que disparan naves, osciladores que respiran y colonias que se estabilizan como si hubieran firmado un tratado de paz.

Conway y sus colegas buscaban un autómata capaz de **computar**. Encontraron algo más incómodo: un sistema donde la complejidad no se programa, **se cultiva**.

---

## 📜 Las Reglas

Cada célula mira a sus 8 vecinas (arriba, abajo, lados y diagonales). Luego, una de estas tres cosas ocurre:

| # | Nombre | Condición | Resultado |
|---|--------|-----------|-----------|
| 1 | **Supervivencia** | Célula viva con **2 o 3** vecinas vivas | 🟢 Sigue viva |
| 2 | **Muerte** | Célula viva con **menos de 2** vecinas *(despoblación)* o **más de 3** vecinas *(sobrepoblación)* | ⚫ Muere |
| 3 | **Nacimiento** | Célula muerta con **exactamente 3** vecinas vivas | 🟢 Nace |

En notación canónica de autómatas celulares, esto se escribe:

```
B3/S23
```

**B**orn con 3 · **S**urvive con 2 o 3. Toda la biología de este universo, en cinco caracteres.

### Las reglas en forma de haiku

```
Aislada, muere.
Ahogada, también muere.
Tres la hacen nacer.
```

### Tres detalles que importan

- **Simultaneidad:** todas las células se evalúan contra la *misma* generación anterior. Ninguna ve el futuro; ninguna influye en sus vecinas durante el mismo turno. Esto es lo que hace que el sistema sea *puro*.
- **Mundo toroidal:** los bordes de la cuadrícula se conectan entre sí. Lo que sale por la izquierda entra por la derecha. No hay frontera, no hay exilio, solo un universo que se muerde la cola.
- **Determinismo total:** dado el mismo estado inicial, la evolución es idéntica hasta el infinito. El azar existe solo en el momento de sembrar.

---

## 🔢 Cómo se ve la vida en números

| Observación en pantalla | Lo que significa |
|--------------------------|------------------|
| **Generación** | Cuántos latidos ha dado este universo desde que lo creaste |
| **Células vivas** | Cuánta vida hay ahora mismo; súbela y bájala y observa cómo respira |
| **FPS** | A qué velocidad estás dejando correr el tiempo |

Hay un momento, alrededor de la generación 200 de una siembra aleatoria, en que la curva de población se derrumba y se aplana. Es hermoso y es un poco triste: el universo encontró su equilibrio, y ya no va a pasar gran cosa más.

---

## 🛸 Patrones Famosos

La aplicación incluye una biblioteca de estructuras clásicas, listas para cargar con un clic:

| Patrón | Tipo | Qué hace |
|--------|------|----------|
| **Planador (Glider)** | Nave | La forma más pequeña capaz de viajar. Se mueve en diagonal, eternamente, sin gastar nada |
| **Cañón de Gosper** | Cañón | Un arma de fuego perfecta: emite un planeador cada 30 generaciones, para siempre |
| **Púlsar (Pulsar)** | Oscilador | Un corazón de período 3. Late, se expande, se contrae, repite |
| **Pentadecatlón** | Oscilador | Período 15. Doce células cooperando en un ritmo imposible de adivinar |
| **Nave Ligera (LWSS)** | Nave | Viaja horizontalmente dejando un rastro de nada |
| **Bellota (Acorn)** | Methuselah | Solo 7 células. Tarda **5206 generaciones** en estabilizarse y produce 633 células |

> **El Glider** es la razón por la que este juego tiene fans. Una estructura de cinco células que se mueve sin motor, sin combustible y sin memoria. La primera prueba de que la información puede viajar dentro de una ley puramente local.

---

## 🎮 Controles

| Botón | Función |
|-------|---------|
| ▶ **Play / Pausa** | Deja correr el tiempo, o congélalo |
| ⏭ **Paso** | Avanza exactamente **una** generación. Ideal para entender las reglas |
| 🎲 **Aleatorio** | Siembra vida al ~20% de densidad y reinicia el contador |
| 🗑 **Limpiar** | Regresa el universo al vacío absoluto |
| ⊞ **Patrones** | Abre la biblioteca de estructuras famosas |
| 🎚 **Velocidad** | De 1 a 60 generaciones por segundo |
| 🔍 **Tamaño de célula** | Zoom de 4 a 24 px |
| ▦ **Grilla** | Muestra u oculta las líneas de la cuadrícula |
| ✨ **Resplandor** | Activa el brillo y las estelas de las células al morir |
| 🎨 **Tema** | Cinco paletas: Esmeralda Neón, Ciber Cian, Violeta, Ámbar Solar y Monocromo |

### Dibujar

Haz **clic o arrastra** sobre la cuadrícula para dibujar vida. Si empiezas el trazo sobre una célula viva, el arrastre **borra** en lugar de dibujar. El trazado interpola líneas (algoritmo de Bresenham), así que puedes arrastrar tan rápido como quieras: no quedarán huecos.

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| <kbd>Espacio</kbd> | Iniciar / Pausar |
| <kbd>→</kbd> o <kbd>N</kbd> | Avanzar una generación |
| <kbd>R</kbd> | Generar vida aleatoria |
| <kbd>C</kbd> | Limpiar la cuadrícula |
| <kbd>Esc</kbd> | Cerrar paneles y modales |

---

## 🚀 Cómo ejecutarlo

No hay dependencias, ni build, ni `npm install`. Solo abre el archivo:

```
index.html
```

Doble clic, o clic derecho → *Abrir con* → tu navegador. Funciona igual desde `file://` que desde un servidor.

Tailwind, las fuentes y los iconos se cargan por CDN, así que la primera vez necesitarás conexión a internet. Después, el navegador lo tendrá en caché.

### Estructura

```
juego/
├── index.html   # Estructura, controles y paneles (Tailwind + Lucide)
├── style.css    # Tema oscuro, glassmorphism, sliders personalizados
├── script.js    # Clase GameOfLife: simulación, render y eventos
├── README.md    # Este documento
└── LICENSE      # Licencia MIT — úsalo como quieras
```

---

## ⚙️ Detalles técnicos

- **HTML5 Canvas** en lugar de DOM, para poder simular miles de células sin sudar.
- **`Uint8Array`** para el estado de la grilla y **`Float32Array`** para las estelas: memoria contigua, sin objetos por célula, sin *garbage collector* respirando en tu nuca.
- **Doble buffer** (`grid` / `nextGrid`): se calcula la siguiente generación completa antes de mostrarla, garantizando la simultaneidad de las reglas.
- **`requestAnimationFrame`** con acumulador de tiempo: la simulación corre a los FPS que elijas, independientemente de la tasa de refresco del monitor.
- **Soporte de pantallas High-DPI** (`devicePixelRatio`) para que las células queden nítidas y no borrosas.
- **Eventos táctiles** además de ratón, con `passive: false` para poder dibujar bien en móvil.
- Las vecinas se calculan **sin condicionales de borde**, usando aritmética modular — el toroide sale gratis.

---

## 🌌 Nota filosófica: el jardín de cuatro reglas

Hay una pregunta vieja que la gente llevaba siglos haciendo, y que Conway respondió sin querer con un rectángulo de casillas:

**¿De dónde sale la complejidad?**

La respuesta que este juego susurra es incómoda y liberadora: **no hace falta de dónde**. No hay un plan escondido en la cuadrícula. No hay un arquitecto, ni un propósito, ni un mensaje cifrado en las generaciones. Solo hay células que miran a sus vecinas —nada más que a sus vecinas, nada más lejos que un paso— y obedecen una ley que cabe en un tuit.

Y aun así, aparecen planeadores que cruzan el vacío. Aparecen cañones que no se cansan nunca. Aparecen colonias que se ordenan solas y se quedan quietas, como si hubieran entendido algo.

> *La vida, aquí, no se diseña. Se deja pasar.*

Es tentador mirar una simulación corriendo y ver un milagro. Pero no hay milagro: hay **determinismo**. Cada generación estaba ya contenida en la primera, del mismo modo en que el último verso de un poema está contenido en la primera palabra — no escrito, pero inevitable.

Lo que sí hay es algo más raro que un milagro: **emergencia**. Propiedades que ninguna célula tiene por su cuenta y que el conjunto sí. Ninguna célula sabe que forma parte de un planeador. Ninguna célula "quiere" moverse hacia la esquina. El movimiento no está en ellas; está **entre** ellas.

Ahí está la lección que se puede llevar puesta.

### Lo que este juego dice sobre nosotros

Vivimos rodeados de sistemas así. No tenemos el plano completo de nuestra propia cuadrícula; solo vemos nuestras ocho vecinas y las reglas que alcanzamos a entender. Y sin embargo, de esa mirada corta y local salen cosas que ninguna de nosotros podría producir sola: un idioma, una ciudad, una canción, una amistad que dura treinta años.

El Juego de la Vida no es una metáfora de la vida. Es, más bien, un recordatorio humilde de que **las grandes estructuras casi nunca se construyen: se cultivan.** Tú siembras, te apartas, y observas qué decide hacer el mundo con tus reglas.

Y cuando la población se estabiliza y todo se queda quieto, no es un fracaso. Es el universo diciendo: *encontré mi forma.* Después puedes hacer lo único que un dios pequeño puede hacer en este juego:

**Limpiar la cuadrícula y volver a empezar.**

---

## 📄 Licencia

Este proyecto se distribuye bajo la **Licencia MIT** — ver el archivo [LICENSE](LICENSE).

En cristiano: **haz lo que quieras con este código.**

- ✅ Usarlo, copiarlo, modificarlo, romperlo
- ✅ Publicarlo, venderlo, empaquetarlo dentro de algo más grande
- ✅ Usarlo en proyectos personales, comerciales, académicos o absurdos
- ✅ No pedir permiso a nadie, nunca

La única condición es una línea: **conserva el aviso de copyright y la licencia** en las copias sustanciales del código. Nada más.

Y seamos honestos con la letra pequeña: **el software se entrega "tal cual"**, sin garantías de ningún tipo. Si tu colonia se extingue en la generación 40, es tu problema — y también es la única forma en que este juego sabe terminar.

---

<div align="center">

*No hay ganar. No hay perder. Solo el siguiente latido.*

`B3/S23`

</div>
