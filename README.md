meBlip
=========================

**meBlip** es un componente de UI para aplicaciones web, inspirado en la "Dynamic Island" de iOS. Un sistema autonomo y personalizable que transforma las notificaciones tradicionales en una experiencia fluida, reactiva y elegante con animaciones basadas en spring physics.

- Zero dependencias: un unico fichero JavaScript, sin CSS externo
- Temas: dark, light o auto (segun preferencia del sistema)
- Cola con prioridades y agrupacion inteligente
- Accesibilidad: ARIA live regions, navegacion por teclado, Escape para cerrar
- Animaciones spring physics para transiciones elasticas
- Morphing visual entre tipos de notificacion
- Pause on hover, countdown visual, exit animations
- Patrones avanzados: undo, verify, form, upload, chain, confetti

---

Caracteristicas Principales
-----------------------------

### Smart UI

*   **Sistema de Prioridades:** Los mensajes pueden marcarse como `low`, `normal` o `high`. Las notificaciones criticas (`high` o de tipo `error`) se posicionan automaticamente al frente de la cola de visualizacion.

*   **Agrupacion Inteligente:** Detecta eventos con el mismo `groupId` para colapsarlos automaticamente, evitando el ruido visual cuando ocurren multiples acciones similares.

*   **Calculo de Promedio Dinamico:** Si los elementos de un grupo tienen la propiedad `progress`, la isla calcula y muestra el **promedio en tiempo real** de todas las tareas activas del grupo.

*   **Pause on Hover:** Cuando el usuario pasa el raton sobre la isla, el temporizador de auto-cierre se pausa automaticamente y se reanuda al salir. El countdown visual tambien se detiene.

*   **Escape para Cerrar:** Pulsar la tecla `Escape` cierra la notificacion activa inmediatamente.

### Animaciones y Visual

*   **9 Animaciones de Isla:** Se asignan manualmente via la propiedad `animation` en `add()`. No hay animaciones por defecto; cada notificacion puede elegir la suya:

    | Animacion | Descripcion |
    |-----------|-------------|
    | `shake` | Vibracion lateral agresiva con intensidad decreciente |
    | `pulse` | Escalado suave de confirmacion |
    | `bounce` | Rebote vertical que llama la atencion |
    | `glow` | Resplandor pulsante del borde. Acepta `glowColor` para personalizar el color del shadow |
    | `breathe` | Respiracion lenta infinita (escala + opacidad) |
    | `heartbeat` | Doble pulso rapido tipo latido de corazon |
    | `wobble` | Deformacion elastica tipo gelatina |
    | `ripple` | Onda expansiva desde el borde de la isla |
    | `swing` | Oscilacion tipo pendulo |

*   **4 Animaciones de Salida:** Controla como desaparece la isla con `exitAnimation`:

    | Animacion | Descripcion |
    |-----------|-------------|
    | `fade` | Desvanecimiento suave con escala descendente |
    | `slide-down` | Deslizamiento hacia abajo |
    | `slide-up` | Deslizamiento hacia arriba |
    | `shrink-bounce` | Rebote elastico al encogerse |

*   **Fondo Semantico por Tipo:** Los tipos `success`, `error`, `info` y `warning` colorean automaticamente el fondo de la isla con su color asociado (verde, rojo, azul, ambar). Texto, iconos y botones se adaptan a blanco para maximo contraste. Los tipos sin color (`loading`, `thinking`, `generic`) mantienen el fondo del tema activo.

*   **Morphing entre Tipos:** Al actualizar una actividad con `update()`, el cambio de tipo produce una transicion fluida de colores y un crossfade suave del icono.

*   **Countdown Visual:** Barra de progreso fina en la parte inferior de la isla que muestra visualmente el tiempo restante. Se sincroniza con pause on hover.

*   **Confetti:** Efecto de particulas festivas que se disparan desde la isla. Puede activarse manualmente o automaticamente en notificaciones de exito.

*   **Iconos Animados:** Dos nuevos iconos con animacion CSS integrada:
    *   `typingDots`: Tres puntos que rebotan secuencialmente (estilo "escribiendo").
    *   `progressOrbit`: Puntos orbitando como alternativa al spinner clasico.

*   **Entrada Alternativa (`slide-spring`):** Animacion de entrada deslizante con rebote elastico. La direccion se adapta automaticamente segun la posicion de la isla (izquierda, derecha o arriba).

*   **Capas de Apilamiento (Stack):** Capas con perspectiva 3D detras de la isla que indican visualmente cuantas actividades hay pendientes en cola (hasta 5 capas).

*   **Spring Physics:** Motor de animacion basado en simulacion de muelles que genera transiciones elasticas suaves al expandir y colapsar la isla.

### Arquitectura Plug & Play

*   **Componente Autonomo:** El codigo JavaScript inyecta dinamicamente sus propios estilos CSS al inicializarse. No requiere dependencias externas, archivos CSS separados ni configuracion de compilacion.

---

Demo
----

El fichero `index.html` incluido contiene una demo interactiva con todos los tipos de notificacion, cambio de posicion y tema en tiempo real.

---

Instalacion y Inicio Rapido
------------------------------

Copia `meBlip.js` en tu proyecto e instancialo:

```html
<script src="meBlip.js"></script>
<script>
  const blip= new meBlip({
    position: 'top-center', // Ubicacion de la isla
    theme: 'system'         // 'light', 'dark' o 'system'
  });
</script>
```

---

Referencia de la API
---------------------------------

### 1. Constructor `new meBlip(options)`

| Propiedad | Tipo | Por defecto | Descripcion |
|-----------|------|-------------|-------------|
| `position` | `string` | `'top-center'` | `'top-left'`, `'top-center'`, `'top-right'`, `'center'`, `'bottom-left'`, `'bottom-center'`, `'bottom-right'` |
| `theme` | `string` | `'dark'` | Tema visual: `'light'`, `'dark'` o `'system'` (auto segun SO) |
| `stackStyle` | `string` | `'3d'` | Estilo de las capas apiladas: `'3d'` (perspectiva clasica), `'fan'` (abanico) o `'counter'` (badge numerico) |
| `islandWidth` | `string` | `'normal'` | Ancho de la isla: `'compact'` (ajustado al contenido), `'normal'` (400px), `'wide'` (100% - 2rem) o cualquier valor CSS (`'600px'`, `'80%'`, `'20rem'`). |
| `autoConfetti` | `boolean` | `false` | Si es `true`, lanza confetti automaticamente en cada notificacion de tipo `success` |
| `typeColors` | `object` | `{}` | Sobreescribe o extiende los colores por tipo. Las claves son nombres de tipo y los valores colores hex. Ej: `{ success: '#00ff88', premium: '#8b5cf6' }`. |
| `icons` | `object` | `{}` | Sobreescribe o extiende los iconos SVG integrados. Las claves son nombres de tipo y los valores HTML SVG. Ej: `{ success: '<svg>...</svg>', custom: '<svg>...</svg>' }`. |

```javascript
// Ejemplo: personalizar colores y añadir tipo custom
const blip= new meBlip({
  typeColors: {
    success: '#00ff88',           // Override del verde por defecto
    premium: '#8b5cf6'            // Nuevo tipo personalizado
  },
  icons: {
    premium: '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  }
});

// Usar el tipo personalizado
blip.add({ type: 'premium', icon: 'premium', title: 'Premium', duration: 3000 });
```

### 2. Metodo `add(config)`

Anade una actividad a la cola. Devuelve una **Promesa** que se resuelve con `{ id, status: 'closed' }` cuando la notificacion se cierra. La promesa expone una propiedad `id` con el identificador asignado (util cuando no se pasa un `id` explicito).

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | `string` | ID unico opcional. Se genera automaticamente si se omite. |
| `type` | `string` | Tipo visual: `'success'`, `'error'`, `'info'`, `'warning'`, `'loading'`, `'thinking'`, `'generic'`. |
| `title` | `string` | Titulo principal. |
| `subtitle` | `string` | Texto descriptivo secundario. Admite **HTML** (enlaces, negritas, codigo inline, etc.). |
| `icon` | `string` | Icono a mostrar. Acepta un nombre registrado (`'success'`, `'error'`, `'info'`, `'loading'`, etc.) que se resuelve al SVG integrado, o un string SVG/HTML directo. Si se omite, no se muestra icono. |
| `iconColor` | `string` | Color del icono SVG. Acepta un nombre de tipo (`'success'`, `'error'`, `'info'`, `'warning'`) que se resuelve a su hex, o un color hex directo (`'#ff00ff'`). Si se omite, usa el color de acento del tipo. |
| `avatarUrl` | `string` | URL de una imagen para mostrar un avatar circular en lugar del icono. |
| `duration` | `number` | Tiempo en ms para el auto-cierre. Si se omite, permanece abierta. |
| `priority` | `string` | Prioridad en la cola: `'low'`, `'normal'` (defecto), `'high'`. |
| `progress` | `number` | Valor de `0` a `1`. Activa automaticamente la barra de progreso. |
| `groupId` | `string` | ID de grupo para agrupar notificaciones del mismo proceso. |
| `groupTitle` | `string` | Plantilla de titulo para el grupo. Usa `{n}` para el conteo (ej: `'Subiendo {n} archivos'`). |
| `actions` | `array` | Botones de accion: `[{ label, type, icon, onClick }]`. `icon` es HTML opcional para mostrar un icono junto al texto. El callback recibe `{ activityId }`. |
| `closeOnClick` | `boolean` | Si es `true`, la isla se cierra al hacer clic sobre ella. |
| `showCloseButton` | `boolean` | Si es `true`, muestra un boton X en la esquina derecha para cerrar la notificacion. |
| `persistent` | `boolean` | Si es `true`, la notificacion no se puede cerrar con Escape, click ni boton X. Solo se cierra programaticamente via `remove()` o `update()` con `duration`. |
| `isBlocking` | `boolean` | Activa un overlay que impide interactuar con el fondo. |
| `waitToDisplay` | `boolean` | Si es `true`, el temporizador de `duration` no arranca hasta que la actividad se muestre. |
| `enableAnimations` | `boolean` | Permite desactivar las animaciones de la isla. Por defecto `true`. |
| `animation` | `string` | Animacion de la isla: `'pulse'`, `'shake'`, `'bounce'`, `'glow'`, `'breathe'`, `'heartbeat'`, `'wobble'`, `'ripple'`, `'swing'` o `'none'`. Si se omite, no se reproduce ninguna animacion. |
| `glowColor` | `string` | Color del shadow en la animacion `glow`. Acepta un nombre de tipo (`'error'`, `'success'`...) o un color hex (`'#ff00ff'`). Si se omite, usa el color de acento. |
| `entryAnimation` | `string` | Animacion de entrada alternativa: `'slide-spring'`. La isla entra deslizandose con rebote elastico en lugar del scale clasico. |
| `exitAnimation` | `string` | Animacion de salida: `'fade'`, `'slide-down'`, `'slide-up'` o `'shrink-bounce'`. Si se omite, se usa el colapso por defecto. |
| `showCountdown` | `boolean` | Si es `true`, muestra una barra visual de countdown en la parte inferior de la isla. Por defecto `false`. |
| `confetti` | `boolean` | Si es `true`, lanza un efecto de confetti al mostrarse la notificacion. |
| `onShow` | `function` | Callback que se ejecuta cuando la actividad se muestra por primera vez. Recibe `{ id, type }`. |
| `onHide` | `function` | Callback que se ejecuta cuando la actividad se cierra. Recibe `{ id, type }`. |
| `position` | `string` | Override de posicion para esta notificacion. Mismos valores que en el constructor. La isla se mueve animadamente y restaura la posicion global al cerrarse. |
| `content` | `string` | HTML personalizado que se renderiza entre el header y las acciones. Permite inyectar contenido libre (estadisticas, widgets, etc.). Coexiste con `actions`, `verify`, `form` y `upload`. |
| `islandWidth` | `string` | Override del ancho para esta notificacion. Mismos valores que en el constructor. |
| `soundUrl` | `string` | URL de un archivo de audio para reproducir al activarse. |

### 3. Metodos de Control

| Metodo | Descripcion |
|--------|-------------|
| `update([id], patch)` | Modifica una actividad. Si se omite el `id`, se actua sobre la notificacion activa. Util para actualizar progreso, subtitulo, tipo, etc. Produce morphing visual si se cambia el `type`. |
| `remove([id])` | Cierra y elimina una actividad inmediatamente. Si se omite el `id`, se elimina la notificacion activa. |
| `addUndo(config)` | Patron undo: muestra una notificacion con boton de deshacer y countdown. Ver seccion dedicada. |
| `addVerify(config)` | Patron verify: muestra una notificacion con codigo de verificacion que el usuario debe introducir. Ver seccion dedicada. |
| `addForm(config)` | Patron form: muestra una notificacion con formulario interactivo cuyos campos se definen en un array. Ver seccion dedicada. |
| `addUpload(config)` | Patron upload: muestra una notificacion con zona de drop para subir ficheros. Ver seccion dedicada. |
| `chain(steps)` | Encadena multiples pasos secuenciales en una sola isla con morphing suave. Ver seccion dedicada. |
| `confetti()` | Lanza el efecto de confetti manualmente sobre la isla. |
| `setTheme(theme)` | Cambia el tema: `'light'`, `'dark'` o `'system'`. |
| `setPosition(pos)` | Mueve la isla a otra posicion de la pantalla. |
| `setStackStyle(style)` | Cambia el estilo de apilamiento: `'3d'`, `'fan'` o `'counter'`. |
| `setIslandWidth(width)` | Cambia el ancho de la isla: `'compact'`, `'normal'`, `'wide'` o valor CSS arbitrario. |

### 4. Propiedad `icons`

La instancia incluye un mapa de iconos SVG integrados. Basta con pasar el nombre del icono como string en la propiedad `icon` y se resuelve automaticamente al SVG correspondiente. Tambien se puede acceder directamente al SVG via `blip.icons.nombre`.

Iconos disponibles: `success`, `error`, `info`, `warning`, `upload`, `download`, `loading`, `thinking`, `speaking`, `listening`, `typingDots`, `progressOrbit`.

```javascript
blip.add({
  type: 'generic',
  icon: 'upload',
  title: 'Subiendo archivo',
  subtitle: 'documento.pdf'
});
```

Con `iconColor` se puede asignar un color independiente del tipo:

```javascript
// Icono de success en purpura
blip.add({
  type: 'success',
  icon: 'success',
  iconColor: '#a855f7',
  title: 'Logro especial',
  subtitle: 'Color personalizado',
  duration: 3000
});

// Icono generico con color de tipo 'error'
blip.add({
  type: 'generic',
  icon: 'warning',
  iconColor: 'error',
  title: 'Atencion',
  subtitle: 'Icono warning en rojo',
  duration: 3000
});
```

---

Ejemplos de Uso
---------------------------

### A. Alerta Critica con Acciones y Animacion

```javascript
blip.add({
  type: 'error',
  icon: 'error',
  priority: 'high',
  title: 'Error de Sincronizacion',
  subtitle: 'No se han podido guardar los cambios',
  animation: 'shake',
  actions: [
    {
      label: 'Reintentar',
      type: 'primary',
      icon: 'upload', // Icono opcional en el boton
      onClick: () => ejecutarSincronizacion()
    },
    {
      label: 'Cerrar',
      onClick: (ctx) => blip.remove(ctx.activityId)
    }
  ]
});
```

### B. Gestion de Cargas Masivas (Promedio de Progreso)

```javascript
// Si lanzas estas tres llamadas, la isla mostrara el promedio (50%)
var uploadData = { groupId: 'up-1', groupTitle: 'Subiendo {n} fotos...', type: 'loading', icon: 'loading' };

blip.add({ ...uploadData, progress: 0.2 });
blip.add({ ...uploadData, progress: 0.5 });
blip.add({ ...uploadData, progress: 0.8 });
```

### C. Notificacion con Avatar

```javascript
blip.add({
  type: 'generic',
  title: 'Elena Garcia',
  subtitle: 'Te ha enviado una imagen',
  avatarUrl: 'https://i.pravatar.cc/100?u=elena',
  duration: 5000,
  closeOnClick: true
});
```

### D. Progreso con Actualizacion Manual

```javascript
// Ya no es necesario inventar un ID manualmente
var task = blip.add({ type: 'loading', icon: 'loading', title: 'Subiendo Video', subtitle: '0%', progress: 0 });

// La promesa expone el ID generado en .id
blip.update(task.id, { progress: 0.5, subtitle: '50%' });

// Completar
blip.update(task.id, { progress: 1, subtitle: 'Completado', type: 'success', icon: 'success', duration: 2000 });
```

### E. Override de Animacion

```javascript
// Usar heartbeat en una notificacion generica
blip.add({
  type: 'generic',
  animation: 'heartbeat',
  title: 'Conexion inestable',
  subtitle: 'Comprobando estado del servidor...',
  duration: 4000
});

// Desactivar la animacion por defecto de un tipo
blip.add({
  type: 'error',
  icon: 'error',
  animation: 'none',
  title: 'Error silencioso',
  subtitle: 'Sin vibracion',
  duration: 3000
});
```

### F. Entrada con Slide Spring

```javascript
blip.add({
  type: 'info',
  icon: 'info',
  entryAnimation: 'slide-spring',
  title: 'Nueva notificacion',
  subtitle: 'Entrada deslizante con rebote',
  duration: 3000
});
```

### G. Iconos Animados

```javascript
// Indicador de "escribiendo" con tres puntos animados
blip.add({
  type: 'generic',
  icon: 'typingDots',
  title: 'Asistente',
  subtitle: 'Escribiendo...',
  duration: 4000
});

// Spinner alternativo con puntos orbitando
blip.add({
  type: 'loading',
  icon: 'progressOrbit',
  title: 'Procesando',
  subtitle: 'Analizando datos...',
  duration: 4000
});
```

### H. Esperar al cierre con Promesa

```javascript
var result = await blip.add({
  type: 'success',
  icon: 'success',
  title: 'Tarea Completada',
  duration: 3000
});
console.log(result); // { id: '...', status: 'closed' }
```

### I. Obtener el ID generado

```javascript
// Obtener el ID auto-generado para control posterior
var task = blip.add({ type: 'loading', icon: 'loading', title: 'Procesando...' });
console.log(task.id); // "meblip-17402201..."

// Actualizar mas adelante
blip.update(task.id, { subtitle: 'Casi listo', progress: 0.8 });

// Cerrar manualmente
blip.remove(task.id);
```

### J. HTML en Subtitulo

```javascript
blip.add({
  type: 'info',
  icon: 'info',
  title: 'Actualizacion disponible',
  subtitle: 'Incluye <strong>mejoras de rendimiento</strong>. <a href="#">Ver changelog</a>',
  duration: 5000
});
```

### K. Morphing entre Tipos

```javascript
// La isla transiciona suavemente de loading a success
var task = blip.add({ type: 'loading', icon: 'loading', title: 'Procesando', subtitle: 'Analizando datos...' });

setTimeout(() => {
  blip.update(task.id, {
    type: 'success',
    icon: 'success',
    title: 'Completado',
    subtitle: 'Datos procesados correctamente',
    duration: 2000
  });
}, 3000);
```

### L. Animaciones de Salida

```javascript
// Desvanecimiento suave
blip.add({
  type: 'info',
  icon: 'info',
  title: 'Nota temporal',
  subtitle: 'Desaparece con fade',
  exitAnimation: 'fade',
  duration: 3000
});

// Rebote elastico al desaparecer
blip.add({
  type: 'success',
  icon: 'success',
  title: 'Guardado',
  subtitle: 'Se encoge con rebote',
  exitAnimation: 'shrink-bounce',
  duration: 3000
});
```

### M. Countdown Visual

```javascript
// Activar la barra inferior que muestra el tiempo restante
blip.add({
  type: 'warning',
  icon: 'warning',
  title: 'Sesion expirando',
  subtitle: 'Tu sesion cerrara pronto',
  duration: 5000,
  showCountdown: true
});
```

### N. Patron Undo

```javascript
var result = await blip.addUndo({
  type: 'info',
  icon: 'info',
  title: 'Elemento eliminado',
  subtitle: '1 archivo movido a la papelera',
  undoLabel: 'Deshacer',     // Texto del boton (por defecto 'Deshacer')
  undoDuration: 5000,         // Tiempo para deshacer (por defecto 5000ms)
  onUndo: () => {
    console.log('Accion deshecha');
  },
  onConfirm: () => {
    console.log('Accion confirmada, eliminar definitivamente');
  }
});

console.log(result.status); // 'undone' o 'confirmed'
```

### O. Patron Verify (Codigo de Verificacion)

```javascript
var result = await blip.addVerify({
  type: 'warning',
  icon: 'warning',
  title: 'Confirmar accion',
  subtitle: 'Introduce el codigo para continuar',
  codeLength: 4,              // Longitud del codigo (por defecto 4)
  codeType: 'alphanumeric',   // 'numeric' o 'alphanumeric'
  cancelLabel: 'Cancelar',
  onVerify: () => console.log('Codigo correcto!'),
  onFail: () => console.log('Codigo incorrecto'),
  onCancel: () => console.log('Cancelado por el usuario')
});

console.log(result.status); // 'verified' o 'cancelled'
console.log(result.code);   // El codigo que se mostro
```

### P. Patron Verify — Modo Input (Codigo Ciego)

```javascript
// El usuario introduce un codigo externo (SMS, email...) y pulsa Confirmar.
// El desarrollador lo valida a posteriori.
var result = await blip.addVerify({
  type: 'info',
  icon: 'info',
  title: 'Verificacion SMS',
  subtitle: 'Introduce el codigo que te hemos enviado',
  mode: 'input',             // Modo ciego: no muestra codigo
  codeLength: 6,
  codeType: 'numeric',
  confirmLabel: 'Confirmar',  // Texto del boton (por defecto 'Confirmar')
  onSubmit: (code) => console.log('Codigo introducido:', code)
});

if (result.status === 'submitted') {
  // Validar el codigo en el backend
  const valid = await api.validateCode(result.code);
}
```

### Q. Cola Encadenable (Chain)

```javascript
var result = await blip.chain([
  {
    type: 'loading',
    icon: 'loading',
    title: 'Paso 1',
    subtitle: 'Conectando al servidor...',
    duration: 2000  // Esperar 2s antes de pasar al siguiente
  },
  {
    type: 'loading',
    icon: 'loading',
    title: 'Paso 2',
    subtitle: 'Descargando datos...',
    duration: 2000
  },
  {
    type: 'success',
    icon: 'success',
    title: 'Completado',
    subtitle: 'Todos los datos sincronizados',
    duration: 3000  // El ultimo paso conserva su duration para auto-cierre
  }
]);

console.log(result.status); // 'chain-complete'
```

### R. Confetti

```javascript
// Confetti manual en una notificacion
blip.add({
  type: 'success',
  icon: 'success',
  title: 'Logro desbloqueado!',
  subtitle: 'Has completado todos los desafios',
  confetti: true,
  duration: 4000
});

// Confetti automatico: configurar en el constructor
const blip= new meBlip({ autoConfetti: true });
// Ahora toda notificacion de tipo 'success' lanzara confetti automaticamente
```

### S. Callbacks onShow / onHide

```javascript
blip.add({
  type: 'info',
  icon: 'info',
  title: 'Evento rastreado',
  subtitle: 'Con callbacks de ciclo de vida',
  duration: 3000,
  onShow: ({ id, type }) => {
    console.log(`Notificacion ${id} visible (tipo: ${type})`);
  },
  onHide: ({ id, type }) => {
    console.log(`Notificacion ${id} cerrada`);
  }
});
```

### T. Ancho de Isla

```javascript
// Ancho ampliado para esta notificacion concreta
blip.add({
  type: 'info',
  icon: 'info',
  islandWidth: 'wide',
  title: 'Notificacion ampliada',
  subtitle: 'Ocupa casi todo el ancho de la ventana',
  duration: 3000
});

// Valor CSS arbitrario
blip.add({
  type: 'success',
  icon: 'success',
  islandWidth: '600px',
  title: 'Ancho personalizado',
  subtitle: '600 pixeles exactos',
  duration: 3000
});

// Cambiar el ancho global en runtime
blip.setIslandWidth('compact');
```

### U. Patron Form (Formulario Interactivo)

```javascript
// Formulario con multiples campos: el usuario rellena y confirma
var result = await blip.addForm({
  type: 'info',
  icon: 'info',
  title: 'Contacto',
  subtitle: 'Dejanos tus datos',
  fields: [
    { type: 'text', label: 'Nombre', required: true, placeholder: 'Tu nombre' },
    { type: 'email', label: 'Email', required: true, placeholder: 'tu@email.com' },
    { type: 'tel', label: 'Telefono', placeholder: 'Opcional' },
    { type: 'select', label: 'Pais', options: ['Espana', 'Mexico', 'Argentina'], required: true, placeholder: 'Selecciona...' },
    { type: 'textarea', label: 'Comentario', placeholder: 'Algo que quieras decirnos...' }
  ],
  confirmLabel: 'Enviar',
  cancelLabel: 'Cancelar'
});

if (result.status === 'submitted') {
  console.log(result.data);
  // { nombre: 'Juan', email: 'juan@mail.com', telefono: '...', pais: 'Espana', comentario: '...' }
}
```

### V. Patron Upload (Subida de Ficheros)

```javascript
// Zona de drop para subir uno o varios ficheros con validacion
var result = await blip.addUpload({
  type: 'info',
  icon: 'upload',
  title: 'Subir documentos',
  subtitle: 'Arrastra tus archivos aqui',
  multiple: true,
  accept: '.pdf,.docx',
  maxSize: 5 * 1024 * 1024,
  confirmLabel: 'Subir',
  cancelLabel: 'Cancelar'
});

if (result.status === 'submitted') {
  console.log(result.files); // [File, File, ...]
}
```

### W. Contenido HTML Personalizado

```javascript
// Inyectar HTML libre entre el header y las acciones
blip.add({
  type: 'info',
  icon: 'info',
  title: 'Estadisticas',
  subtitle: 'Resumen del dia',
  content: `
    <div style="display:flex;gap:16px;justify-content:center;padding:4px 0">
      <div style="text-align:center">
        <div style="font-size:20px;font-weight:700;color:#22c55e">142</div>
        <div style="font-size:10px;opacity:0.6">Visitas</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:20px;font-weight:700;color:#3b82f6">28</div>
        <div style="font-size:10px;opacity:0.6">Registros</div>
      </div>
    </div>
  `,
  duration: 5000
});

// Content coexiste con actions
blip.add({
  type: 'warning',
  icon: 'warning',
  title: 'Nueva version',
  subtitle: 'v6.1.0 disponible',
  content: '<div style="font-size:11px;opacity:0.7">Incluye mejoras de rendimiento y correccion de errores criticos.</div>',
  actions: [
    { label: 'Actualizar', type: 'primary', onClick: (ctx) => blip.remove(ctx.activityId) },
    { label: 'Mas tarde', onClick: (ctx) => blip.remove(ctx.activityId) }
  ]
});
```

---

Referencia: `addUndo(config)`
-------------------------------

Muestra una notificacion con boton de deshacer y countdown. Si el usuario pulsa el boton, la accion se revierte. Si el timer expira, se confirma.

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `undoLabel` | `string` | Texto del boton de deshacer. Por defecto `'Deshacer'`. |
| `undoIcon` | `string` | Icono HTML/SVG opcional para el boton de deshacer. Si se omite, solo muestra el texto. |
| `undoDuration` | `number` | Tiempo en ms para deshacer. Por defecto `5000`. |
| `onUndo` | `function` | Callback ejecutado si el usuario pulsa deshacer. |
| `onConfirm` | `function` | Callback ejecutado si el timer expira sin deshacer. |
| *...resto* | | Acepta todas las propiedades de `add(config)`. Las propiedades `actions` y `duration` se gestionan internamente. |

Retorna `Promise<{ id, status }>` donde `status` es `'undone'` o `'confirmed'`.

---

Referencia: `addVerify(config)`
---------------------------------

Muestra una notificacion con campos de verificacion. Soporta dos modos:

- **`mode: 'verify'`** (defecto): muestra un codigo que el usuario debe copiar en los inputs. Se valida automaticamente al completar. Promesa resuelve con `'verified'` o `'cancelled'`.
- **`mode: 'input'`**: no muestra codigo. El usuario introduce un codigo externo (SMS, email...) y pulsa Confirmar. Promesa resuelve con `'submitted'` y el codigo introducido para validacion posterior.

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `mode` | `string` | Modo de verificacion: `'verify'` (con codigo visible) o `'input'` (codigo ciego). Por defecto `'verify'`. |
| `code` | `string` | Codigo a verificar (solo modo verify). Si se omite, se genera automaticamente. |
| `codeLength` | `number` | Longitud del codigo / numero de campos de entrada. Por defecto `4`. |
| `codeType` | `string` | Tipo de codigo: `'numeric'` (solo digitos) o `'alphanumeric'` (digitos + letras). Por defecto `'alphanumeric'`. |
| `caseSensitive` | `boolean` | Si `true`, distingue mayusculas/minusculas (solo modo verify). Por defecto `false`. |
| `confirmLabel` | `string` | Texto del boton confirmar (solo modo input). Por defecto `'Confirmar'`. |
| `cancelLabel` | `string` | Texto del boton cancelar. Por defecto `'Cancelar'`. |
| `onVerify` | `function` | Callback ejecutado si el codigo es correcto (solo modo verify). |
| `onSubmit` | `function` | Callback con el codigo introducido (solo modo input). Recibe el codigo como argumento. |
| `onFail` | `function` | Callback ejecutado cada vez que el usuario introduce un codigo incorrecto (solo modo verify). |
| `onCancel` | `function` | Callback ejecutado si el usuario pulsa cancelar. |
| *...resto* | | Acepta todas las propiedades de `add(config)`. Las propiedades `actions` y `duration` se gestionan internamente. |

Retorna `Promise<{ id, status, code }>` donde `status` es `'verified'`, `'submitted'` o `'cancelled'`, y `code` es el codigo mostrado/introducido.

---

Referencia: `addForm(config)`
---------------------------------

Muestra una notificacion con un formulario interactivo. Los campos se definen en un array y el usuario los rellena antes de confirmar o cancelar.

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `fields` | `array` | Array de objetos que definen los campos del formulario. |
| `fields[].type` | `string` | Tipo HTML del campo: `'text'`, `'email'`, `'tel'`, `'number'`, `'password'`, `'url'`, `'date'`, `'select'`, `'textarea'`. |
| `fields[].label` | `string` | Etiqueta visible del campo. Tambien se usa como clave en el objeto de datos devuelto (convertida a snake_case). |
| `fields[].required` | `boolean` | Si `true`, el campo es obligatorio. Muestra `*` y valida antes de enviar. Por defecto `false`. |
| `fields[].placeholder` | `string` | Texto de placeholder. En selects, se muestra como opcion deshabilitada inicial. |
| `fields[].value` | `string` | Valor inicial del campo. |
| `fields[].options` | `array` | Opciones del select. Cada elemento puede ser un string (`'España'`) o un array `['ES', 'España']` donde el primer valor es el value y el segundo la etiqueta visible. |
| `fields[].rows` | `number` | Numero de filas visibles (solo para `type: 'textarea'`). Por defecto `2`. |
| `confirmLabel` | `string` | Texto del boton confirmar. Por defecto `'Confirmar'`. |
| `cancelLabel` | `string` | Texto del boton cancelar. Por defecto `'Cancelar'`. |
| `onSubmit` | `function` | Callback con los datos del formulario como argumento. |
| `onCancel` | `function` | Callback ejecutado si el usuario pulsa cancelar. |
| *...resto* | | Acepta todas las propiedades de `add(config)`. Las propiedades `actions` y `duration` se gestionan internamente. |

Retorna `Promise<{ id, status, data }>` donde `status` es `'submitted'` o `'cancelled'`, y `data` es un objeto con los valores del formulario (claves derivadas de los labels) o `null` si se cancelo.

---

Referencia: `addUpload(config)`
---------------------------------

Muestra una notificacion con una zona de drop donde el usuario puede arrastrar o seleccionar ficheros. Incluye previsualizacion de ficheros, validacion de extension/MIME y tamano, y botones de confirmar/cancelar.

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `multiple` | `boolean` | Si `true`, permite seleccionar multiples ficheros. Por defecto `false` (un solo fichero). |
| `accept` | `string` | Filtro de ficheros. Acepta extensiones (`.pdf`, `.docx`), MIME types (`application/pdf`), o wildcards (`image/*`). Separar multiples con comas. Por defecto acepta cualquier fichero. |
| `maxSize` | `number` | Tamano maximo por fichero en bytes. Los ficheros que excedan el limite se rechazan con animacion shake. Por defecto `0` (sin limite). |
| `confirmLabel` | `string` | Texto del boton confirmar. Por defecto `'Subir'`. |
| `cancelLabel` | `string` | Texto del boton cancelar. Por defecto `'Cancelar'`. |
| `onSubmit` | `function` | Callback con el array de ficheros como argumento. |
| `onCancel` | `function` | Callback ejecutado si el usuario pulsa cancelar. |
| *...resto* | | Acepta todas las propiedades de `add(config)`. Las propiedades `actions` y `duration` se gestionan internamente. |

Retorna `Promise<{ id, status, files }>` donde `status` es `'submitted'` o `'cancelled'`, y `files` es un array de objetos `File` o `null` si se cancelo.

---

Referencia: `chain(steps)`
-----------------------------

Encadena multiples pasos secuenciales en una sola isla. Cada paso produce un morphing suave al siguiente.

Cada paso del array acepta todas las propiedades de `add(config)` mas:

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `duration` | `number` | Tiempo en ms antes de avanzar al siguiente paso. En el ultimo paso, funciona como auto-cierre. |
| `until` | `Promise` | Promesa que debe resolverse antes de avanzar. Alternativa a `duration`. |

Retorna `Promise<{ id, status }>` donde `status` es `'chain-complete'` o `'chain-interrupted'` (si se cierra manualmente).

---

Personalizacion Visual (CSS Variables)
-----------------------------------------

Puedes ajustar los colores y el estilo inyectando variables en tu CSS global:

```css
#meblip-island-root {
  /* Colores de estados */
  --meblip-color-success: #00ff88;
  --meblip-color-error: #ff3333;
  --meblip-color-info: #00d4ff;
  --meblip-color-warning: #ffaa00;

  /* Color de acento generico */
  --meblip-color-generic-dark: #ffffff;
  --meblip-color-generic-light: #1d1d1f;

  /* Apariencia fisica */
  --meblip-island-radius: 20px;
  --meblip-island-blur: 24px;
}
```

---

Accesibilidad (A11y)
----------------------

Cumple con los estandares para lectores de pantalla y navegacion asistida:

*   **ARIA Live:** Gestion dinamica de regiones (`assertive` para errores y alta prioridad, `polite` para el resto).
*   **Control por Teclado:** Soporte nativo para `Tab`, `Enter`, `Espacio` y `Escape` (cierra la notificacion activa).
*   **Pause on Hover:** El temporizador de auto-cierre se pausa al pasar el raton sobre la isla, dando mas tiempo para leer el contenido.
*   **Semantica:** Implementacion automatica de `role="alert"`, `role="status"` y `role="progressbar"`.

---

Compatibilidad
----------------

El componente utiliza ECMAScript 2020+ (clases, `const`/`let`, arrow functions, template literals, `Map`, optional chaining `?.`, spread `...`). Compatible con:

*   Chrome 80+
*   Firefox 72+
*   Safari 13.1+
*   Edge 80+

---

Autor
------

**Marcos Esperon** - [github.com/marcosesperon](https://github.com/marcosesperon)

Si este proyecto te resulta util, puedes apoyar su desarrollo:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/marcosesperon)

---

Licencia
-----------

Este proyecto esta bajo la licencia **MIT**. Consulta el fichero [LICENSE.md](LICENSE.md) para mas detalles.
