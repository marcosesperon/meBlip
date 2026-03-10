/**
 * meBlip
 *
 * Componente de notificaciones tipo "Dynamic Island" para la web.
 * Muestra indicadores de actividad animados con soporte para colas con prioridad,
 * agrupacion inteligente, temas (dark/light/system), barras de progreso,
 * botones de accion y animaciones basadas en simulacion de muelles (spring physics).
 *
 * @author  Marcos Esperon
 * @url     https://github.com/marcosesperon
 * @donate  https://buymeacoffee.com/marcosesperon
 * @license MIT
 * @version 1.0.0
 */

class meBlip {

  // ──────────────────────────────────────────────
  //  CONFIGURACION Y CONSTRUCTOR
  // ──────────────────────────────────────────────

  /**
   * Crea una nueva instancia del indicador de actividad.
   * Inicializa las propiedades, inyecta los estilos CSS, construye el DOM
   * y arranca el bucle de animacion.
   *
   * @param {Object} [options={}] - Opciones de configuracion.
   * @param {string} [options.position='top-center'] - Posicion en pantalla
   *   ('top-left'|'top-center'|'top-right'|'center'|'bottom-left'|'bottom-center'|'bottom-right').
   * @param {string} [options.theme='dark'] - Tema visual ('dark'|'light'|'system').
   * @param {boolean} [options.closeAnimation=true] - Animación de cierre (false usa fade rápido).
   */
  constructor(options = {}) {
    // Dimensiones minimas y maximas de la isla
    this.minWidth = 46; this.minHeight = 46; this.maxWidth = 420;

    // Configuracion del muelle (spring) para las animaciones elasticas
    this.springCfg = { stiffness: 0.15, damping: 0.82, mass: 1, dt: 1 };

    // Posicion y tema
    this.position = options.position || 'top-center';
    this._currentPosition = this.position;
    this.theme = options.theme || 'dark';
    this.activeThemeName = 'dark';
    this.stackStyle = options.stackStyle || '3d'; // '3d', 'fan', 'counter'
    this.islandWidth = options.islandWidth || 'normal'; // 'compact', 'normal', 'wide' o valor CSS
    this.autoConfetti = options.autoConfetti || false;
    this.closeAnimation = options.closeAnimation !== undefined ? options.closeAnimation : true;
    this.reducedMotion = options.reducedMotion || false;
    this._reducedMotionActive = false;

    // Mapa de prioridades: las actividades de mayor valor se muestran primero
    this.priorityMap = { 'low': 0, 'normal': 1, 'high': 2 };

    // Animaciones: sin defaults, se deben indicar explicitamente via 'animation' en add()
    this.defaultAnimations = {};

    // Colores resueltos por tipo (para morphing suave con transiciones CSS)
    this.typeColors = {
      success: '#43A047', error: '#E53935', info: '#3b82f6', warning: '#f59e0b',
      ...options.typeColors
    };

    // Lista de todas las clases de animacion (para limpieza en batch)
    this.allAnimClasses = [
      'anim-shake', 'anim-pulse', 'anim-bounce', 'anim-glow', 'anim-breathe',
      'anim-heartbeat', 'anim-wobble', 'anim-ripple', 'anim-swing'
    ];
    this.allExitClasses = ['exit-fade', 'exit-slide-down', 'exit-slide-up', 'exit-shrink-bounce'];

    // Iconos SVG integrados para los distintos tipos de actividad
    this.icons = {
      success: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      error: `<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      info: `<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="12" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      warning: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      upload: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
      download: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
      loading: `<svg aria-hidden="true" class="is-spinning" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.21-8.56"></path></svg>`,
      thinking: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4.16Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4.16Z"></path></svg>`,
      speaking: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
      listening: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,
      typingDots: `<svg aria-hidden="true" viewBox="0 0 24 24"><circle class="meblip-dot" cx="6" cy="12" r="2.5" fill="currentColor" stroke="none"></circle><circle class="meblip-dot" cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"></circle><circle class="meblip-dot" cx="18" cy="12" r="2.5" fill="currentColor" stroke="none"></circle></svg>`,
      progressOrbit: `<svg aria-hidden="true" viewBox="0 0 24 24"><g class="meblip-orbit-group"><circle cx="12" cy="3" r="2" fill="currentColor" stroke="none" opacity="1"></circle><circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" opacity="0.6" transform="rotate(120 12 12)"></circle><circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" opacity="0.3" transform="rotate(240 12 12)"></circle></g></svg>`,
      location: `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
      map: `<svg aria-hidden="true" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>`,
      ...options.icons
    };

    // Cola de actividades y estado
    this.activities = [];
    this.activeId = null;
    this.timers = new Map();
    this.timerMeta = new Map();
    this.resolvers = new Map();
    this.promises = new Map();
    this.isPaused = false;

    // Estado de animacion: dimensiones actuales, objetivo y velocidades
    this.width = this.minWidth; this.height = this.minHeight;
    this.targetWidth = this.minWidth; this.targetHeight = this.minHeight;
    this.vw = 0; this.vh = 0;

    // Flags de visibilidad
    this.isVisible = false;
    this.isClosing = false;
    this._contentTimer = null;
    this._iconPreviewTimer = null;
    this.stackCount = 0;

    // Inicializacion
    this._injectStyles();
    this._createDOM();
    this._initThemeListener();
    this._initReducedMotionListener();
    this.setPosition(this.position);
    this.setTheme(this.theme);
    this._startLoop();
  }

  // ──────────────────────────────────────────────
  //  INYECCION DE ESTILOS CSS
  // ──────────────────────────────────────────────

  /**
   * Inyecta el bloque de estilos CSS del componente en el <head> del documento.
   * Solo se ejecuta una vez: si el <style> ya existe, no lo duplica.
   * Incluye variables CSS para temas, layout de la isla, capas de stack,
   * contenido, barra de progreso, botones de accion y animaciones.
   *
   * @private
   */
  _injectStyles() {
    if (document.getElementById('meblip-styles')) return;
    const style = document.createElement('style');
    style.id = 'meblip-styles';
    style.textContent = `
      /* OVERLAY BLOQUEANTE - Capa semitransparente que impide interaccion con el fondo */
      #meblip-blocking-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.05);
        z-index: 9998;
        display: none;
        pointer-events: auto;
      }
      #meblip-blocking-overlay.is-active {
        display: block;
      }
      #meblip-blocking-overlay.meblip-highlighted {
        background-color: rgba(42, 46, 52, .56);
      }

      /* Variables para Tema Oscuro */
      .meblip-theme-dark {
        --meblip-island-bg: rgba(0, 0, 0, 0.9);
        --meblip-island-border: rgba(255, 255, 255, 0.15);
        --meblip-text-main: #ffffff;
        --meblip-text-sub: rgba(255, 255, 255, 0.7);
        --meblip-btn-bg: rgba(255, 255, 255, 0.1);
        --meblip-btn-hover: rgba(255, 255, 255, 0.2);
        --meblip-color-generic: var(--meblip-color-generic-dark);
        --meblip-accent: var(--meblip-color-generic);
        --meblip-accent-contrast: #000000;
      }

      /* Variables para Tema Claro */
      .meblip-theme-light {
        --meblip-island-bg: rgba(255, 255, 255, 0.8);
        --meblip-island-border: rgba(0, 0, 0, 0.1);
        --meblip-text-main: #1d1d1f;
        --meblip-text-sub: rgba(0, 0, 0, 0.6);
        --meblip-btn-bg: rgba(0, 0, 0, 0.05);
        --meblip-btn-hover: rgba(0, 0, 0, 0.1);
        --meblip-color-generic: var(--meblip-color-generic-light);
        --meblip-accent: #3b82f6;
        --meblip-accent-contrast: #ffffff;
      }

      /* ROOT CONTAINER - Contenedor principal fijo en pantalla */
      #meblip-island-root {
        --meblip-island-blur: 18px;
        --meblip-island-radius: 18px;
        --meblip-box-shadow-highlighted: 0 0 0 1px #151515, 0 0 0 8px rgba(0, 0, 0, 0.05), 0 25.6px 57.6px 0 rgba(0, 0, 0, 0.22),0 4.8px 14.4px 0 rgba(0,0,0,.18);

        /* Colores semanticos de estado */
        --meblip-color-generic-dark: #ffffff;
        --meblip-color-generic-light: #1d1d1f;
        --meblip-color-success: #22c55e;
        --meblip-color-error: #ef4444;
        --meblip-color-info: #3b82f6;
        --meblip-color-warning: #f59e0b;

        position: fixed;
        z-index: 9999;
        perspective: 1000px;
        display: flex;
        pointer-events: none;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Posiciones predefinidas */
      #meblip-island-root.top-left { top: 24px; left: 24px; justify-content: flex-start; }
      #meblip-island-root.top-center { top: 24px; left: 50%; transform: translateX(-50%); justify-content: center; }
      #meblip-island-root.top-right { top: 24px; right: 24px; justify-content: flex-end; }
      #meblip-island-root.center { top: 50%; left: 50%; transform: translate(-50%, -50%); justify-content: center; }
      #meblip-island-root.bottom-left { bottom: 24px; left: 24px; justify-content: flex-start; }
      #meblip-island-root.bottom-center { bottom: 24px; left: 50%; transform: translateX(-50%); justify-content: center; }
      #meblip-island-root.bottom-right { bottom: 24px; right: 24px; justify-content: flex-end; }

      /* STACK LAYERS - Capas apiladas detras de la isla que indican elementos en cola */
      .meblip-stack-container { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100%; height: 100%; pointer-events: none; }
      .meblip-stack-layer {
        position: absolute; top: 0; left: 50%; background: var(--meblip-island-bg);
        backdrop-filter: blur(var(--meblip-island-blur)); transform: translateX(-50%);
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; z-index: -1; border: 1px solid var(--meblip-island-border);
      }

      .meblip-stack-badge {
        position: absolute; top: -8px; right: -8px; background: var(--meblip-accent);
        color: var(--meblip-accent-contrast); padding: 2px 6px; border-radius: 10px;
        font-size: 10px; font-weight: 800; opacity: 0; transform: scale(0.5);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 20;
      }
      .meblip-stack-badge.is-visible { opacity: 1; transform: scale(1); }

      /* MAIN ISLAND BUBBLE - Burbuja principal de la isla */
      .meblip-island {
        position: relative;
        overflow: hidden;
        pointer-events: none;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
        transform: scale(0);
        opacity: 0;
        z-index: 10;
        outline: none;
      }

      .meblip-island.is-visible {
        transform: scale(1);
        opacity: 1;
        pointer-events: auto;
      }

      .meblip-island.is-visible.is-closing-fade {
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
      }

      #meblip-island-root.meblip-highlighted .meblip-island.is-visible{
        box-shadow: var(--meblip-box-shadow-highlighted);
      }

      .meblip-island.is-clickable { cursor: pointer; }
      .meblip-island.is-clickable:active { transform: scale(0.95); }

      /* ANIMACIONES DE ISLA ─────────────────────────── */

      /* Shake: vibracion lateral agresiva (error) */
      @keyframes meblip-shake {
        0%, 100% { transform: scale(1) translateX(0); }
        10% { transform: scale(1.04) translateX(-8px); }
        30% { transform: scale(1.04) translateX(8px); }
        50% { transform: scale(1.02) translateX(-6px); }
        70% { transform: scale(1.02) translateX(6px); }
        90% { transform: scale(1.01) translateX(-2px); }
      }
      .anim-shake { animation: meblip-shake 0.2s ease-in-out 3; }

      /* Pulse: escala suave (exito) */
      @keyframes meblip-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .anim-pulse { animation: meblip-pulse 0.4s ease-in-out; }

      /* Bounce: rebote vertical (warning) */
      @keyframes meblip-bounce {
        0%, 100% { transform: scale(1) translateY(0); }
        30% { transform: scale(1) translateY(-8px); }
        50% { transform: scale(1) translateY(0); }
        70% { transform: scale(1) translateY(-3px); }
      }
      .anim-bounce { animation: meblip-bounce 0.5s ease-in-out; }

      /* Glow: resplandor pulsante del borde (info) */
      @keyframes meblip-glow {
        0%, 100% { box-shadow: 0 0 0 0 var(--meblip-glow-color, var(--meblip-accent)); }
        50% { box-shadow: 0 0 16px 4px var(--meblip-glow-color, var(--meblip-accent)); }
      }
      .anim-glow { animation: meblip-glow 0.8s ease-in-out 2; }

      /* Breathe: respiracion lenta con opacidad (thinking) */
      @keyframes meblip-breathe {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.03); opacity: 0.85; }
      }
      .anim-breathe { animation: meblip-breathe 2s ease-in-out infinite; }

      /* Heartbeat: doble pulso agresivo (urgente) */
      @keyframes meblip-heartbeat {
        0%, 100% { transform: scale(1); }
        12% { transform: scale(1.18); }
        24% { transform: scale(0.95); }
        36% { transform: scale(1.14); }
        48% { transform: scale(1); }
      }
      .anim-heartbeat { animation: meblip-heartbeat 0.6s ease-in-out 2; }

      /* Wobble: deformacion elastica pronunciada tipo gelatina */
      @keyframes meblip-wobble {
        0%, 100% { transform: scaleX(1) scaleY(1); }
        15% { transform: scaleX(1.12) scaleY(0.88); }
        30% { transform: scaleX(0.88) scaleY(1.12); }
        50% { transform: scaleX(1.08) scaleY(0.92); }
        70% { transform: scaleX(0.95) scaleY(1.05); }
        85% { transform: scaleX(1.02) scaleY(0.98); }
      }
      .anim-wobble { animation: meblip-wobble 0.6s ease-in-out; }

      /* Ripple: onda expansiva desde el borde */
      @keyframes meblip-ripple {
        0% { box-shadow: 0 0 0 0 var(--meblip-accent); opacity: 0.6; }
        100% { box-shadow: 0 0 0 16px var(--meblip-accent); opacity: 0; }
      }
      .anim-ripple { animation: meblip-ripple 0.8s ease-out 2; }

      /* Swing: oscilacion tipo pendulo */
      @keyframes meblip-swing {
        0%, 100% { transform: rotate(0deg); }
        20% { transform: rotate(6deg); }
        40% { transform: rotate(-5deg); }
        60% { transform: rotate(3deg); }
        80% { transform: rotate(-2deg); }
      }
      .anim-swing { animation: meblip-swing 0.6s ease-in-out; transform-origin: top center; }

      /* ICONOS ANIMADOS ──────────────────────────────── */

      /* Typing dots: tres puntos rebotando secuencialmente */
      @keyframes meblip-dot-bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-5px); opacity: 1; }
      }
      .meblip-icon .meblip-dot { animation: meblip-dot-bounce 1.2s ease-in-out infinite; }
      .meblip-icon .meblip-dot:nth-child(2) { animation-delay: 0.15s; }
      .meblip-icon .meblip-dot:nth-child(3) { animation-delay: 0.3s; }

      /* Progress orbit: puntos orbitando */
      @keyframes meblip-orbit {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .meblip-icon .meblip-orbit-group { animation: meblip-orbit 1.5s linear infinite; transform-origin: 12px 12px; }

      /* ENTRADA ALTERNATIVA ───────────────────────────── */

      /* Slide-spring: entrada deslizante con rebote elastico */
      @keyframes meblip-slide-spring-left {
        0% { transform: translateX(-120%) scale(0.8); opacity: 0; }
        60% { transform: translateX(8%) scale(1.02); opacity: 1; }
        80% { transform: translateX(-3%) scale(1); }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes meblip-slide-spring-right {
        0% { transform: translateX(120%) scale(0.8); opacity: 0; }
        60% { transform: translateX(-8%) scale(1.02); opacity: 1; }
        80% { transform: translateX(3%) scale(1); }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes meblip-slide-spring-down {
        0% { transform: translateY(-120%) scale(0.8); opacity: 0; }
        60% { transform: translateY(8%) scale(1.02); opacity: 1; }
        80% { transform: translateY(-3%) scale(1); }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      .meblip-island.entry-slide-spring-left { animation: meblip-slide-spring-left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      .meblip-island.entry-slide-spring-right { animation: meblip-slide-spring-right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      .meblip-island.entry-slide-spring-down { animation: meblip-slide-spring-down 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

      /* ANIMACIONES DE SALIDA ───────────────────────── */
      @keyframes meblip-exit-fade { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }
      @keyframes meblip-exit-slide-down { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
      @keyframes meblip-exit-slide-up { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
      @keyframes meblip-exit-shrink-bounce { 0% { transform: scale(1); opacity: 1; } 30% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(0); opacity: 0; } }
      .exit-fade { animation: meblip-exit-fade 0.3s ease-out forwards; }
      .exit-slide-down { animation: meblip-exit-slide-down 0.3s ease-out forwards; }
      .exit-slide-up { animation: meblip-exit-slide-up 0.3s ease-out forwards; }
      .exit-shrink-bounce { animation: meblip-exit-shrink-bounce 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

      /* SVG DE FORMA - Fondo con bordes redondeados dinamicos */
      .meblip-island-shape-svg {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }

      .meblip-island-shape-svg path {
        fill: var(--meblip-island-bg);
        stroke: var(--meblip-island-border);
        stroke-width: 1.5px;
        backdrop-filter: blur(var(--meblip-island-blur));
        transition: fill 0.3s ease, stroke 0.3s ease;
      }

      /* CONTENT CONTAINER - Contenido interior de la isla */
      .meblip-content {
        position: relative;
        padding: 12px 16px;
        max-width: none;
        opacity: 0;
        color: var(--meblip-text-main);
        transform: translateY(8px);
        transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        pointer-events: none;
        box-sizing: border-box;
        z-index: 11;
      }

      .meblip-content.is-active {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .meblip-header {
        display: flex;
        gap: 12px;
      }

      .meblip-close-btn {
        display: flex; align-items: center; justify-content: center;
        width: 20px; height: 20px; flex-shrink: 0; margin-left: auto;
        background: none; border: none; color: var(--meblip-text-sub);
        cursor: pointer; border-radius: 50%; transition: background 0.2s ease, color 0.2s ease;
        padding: 0; opacity: 0.6;
      }
      .meblip-close-btn:hover { background: var(--meblip-btn-bg); color: var(--meblip-text-main); opacity: 1; }
      .meblip-close-btn:active { transform: scale(0.85); }
      .meblip-close-btn svg { width: 12px; height: 12px; }

      .meblip-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        font-size: 20px;
        color: var(--meblip-accent);
        flex-shrink: 0;
        transition: color 0.3s ease;
      }

      .meblip-icon svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* Multimedia: Avatar */
      .meblip-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        border: 1px solid var(--meblip-island-border);
      }

      /* Preview icon: icono anticipado centrado en la isla durante la animacion de entrada */
      .meblip-icon-preview {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: var(--meblip-accent);
        opacity: 0;
        transition: opacity 0.25s ease, top 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), left 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
        z-index: 12;
        pointer-events: none;
      }
      .meblip-icon-preview.is-visible {
        opacity: 1;
      }
      .meblip-content.is-active ~ .meblip-icon-preview {
        top: 24px;
        left: 28px;
      }
      .meblip-icon-preview svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* ACCIONES RAPIDAS - Botones de accion dentro de la notificacion */
      .meblip-actions {
        display: flex;
        gap: 8px;
        margin-top: 14px;
        justify-content: flex-end;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.3s ease, transform 0.4s ease;
        pointer-events: none;
      }

      .meblip-content.is-active .meblip-actions {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
        transition-delay: 0.25s;
      }

      .meblip-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--meblip-btn-bg);
        border: none;
        color: var(--meblip-text-main);
        padding: 6px 12px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.1s ease;
      }

      .meblip-btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; flex-shrink: 0; }
      .meblip-btn-icon svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

      .meblip-action-btn:hover { background: var(--meblip-btn-hover); }
      .meblip-action-btn:active { transform: scale(0.92); }

      .meblip-action-btn.primary {
        background: var(--meblip-accent);
        color: var(--meblip-accent-contrast);
      }

      /* VERIFY CODE */
      .meblip-verify {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .meblip-verify.is-ready {
        opacity: 1;
      }

      .meblip-verify-code {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 6px;
        color: var(--meblip-accent);
        user-select: all;
      }

      .meblip-verify-inputs {
        display: flex;
        gap: 6px;
      }

      .meblip-verify-input {
        width: 28px;
        height: 34px;
        text-align: center;
        font-size: 16px;
        font-weight: 700;
        border: 1.5px solid var(--meblip-island-border);
        border-radius: 8px;
        background: transparent;
        color: var(--meblip-text-main);
        outline: none;
        transition: border-color 0.2s ease;
        caret-color: var(--meblip-accent);
      }

      .meblip-verify-input:focus {
        border-color: var(--meblip-accent);
      }

      .meblip-verify-input.is-error {
        border-color: var(--meblip-color-error);
        animation: meblip-shake 0.2s ease-in-out 2;
      }

      .meblip-verify-input.is-success {
        border-color: var(--meblip-color-success);
      }

      .meblip-verify-actions {
        display: flex;
        gap: 8px;
        margin-top: 2px;
      }

      /* FORM */
      .meblip-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
        padding-bottom: 6px;
        width: 100%;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .meblip-form.is-ready {
        opacity: 1;
      }

      .meblip-form-field {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .meblip-form-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--meblip-text-sub);
      }

      .meblip-form-label .meblip-form-required {
        color: var(--meblip-color-error);
        margin-left: 2px;
      }

      .meblip-form-input,
      .meblip-form-select,
      .meblip-form-textarea {
        background: transparent;
        border: 1.5px solid var(--meblip-island-border);
        border-radius: 8px;
        color: var(--meblip-text-main);
        font-size: 12px;
        font-family: inherit;
        padding: 6px 8px;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .meblip-form-input:focus,
      .meblip-form-select:focus,
      .meblip-form-textarea:focus {
        border-color: var(--meblip-accent);
      }

      .meblip-form-input::placeholder,
      .meblip-form-textarea::placeholder {
        color: var(--meblip-accent);
        opacity: 0.4;
      }

      .meblip-form-select.is-placeholder {
        color: var(--meblip-accent);
        opacity: 0.4;
      }

      .meblip-form-input.is-error,
      .meblip-form-select.is-error,
      .meblip-form-textarea.is-error {
        border-color: var(--meblip-color-error);
        animation: meblip-shake 0.2s ease-in-out 2;
      }

      .meblip-form-textarea {
        resize: none;
        min-height: 40px;
      }

      .meblip-form-select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        padding-right: 24px;
      }

      .meblip-form-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }

      /* UPLOAD */
      .meblip-upload {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
        padding-bottom: 6px;
        width: 100%;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .meblip-upload.is-ready {
        opacity: 1;
      }

      .meblip-upload-dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 64px;
        border: 2px dashed var(--meblip-island-border);
        border-radius: 10px;
        padding: 12px;
        cursor: pointer;
        transition: border-color 0.2s ease, background 0.2s ease;
      }

      .meblip-upload-dropzone.is-dragover {
        border-color: var(--meblip-accent);
        background: rgba(59, 130, 246, 0.08);
      }

      .meblip-upload-dropzone.is-error {
        border-color: var(--meblip-color-error);
        animation: meblip-shake 0.2s ease-in-out 2;
      }

      .meblip-upload-dropzone-icon {
        color: var(--meblip-accent);
        opacity: 0.6;
      }

      .meblip-upload-dropzone-icon svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .meblip-upload-dropzone-text {
        font-size: 11px;
        color: var(--meblip-text-sub);
        text-align: center;
      }

      .meblip-upload-dropzone-hint {
        font-size: 10px;
        color: var(--meblip-text-sub);
        opacity: 0.6;
      }

      .meblip-upload-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 100px;
        overflow-y: auto;
      }

      .meblip-upload-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 6px;
        border-radius: 6px;
        background: rgba(255,255,255,0.05);
        font-size: 11px;
      }

      .meblip-upload-item-icon {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        color: var(--meblip-accent);
      }

      .meblip-upload-item-icon svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .meblip-upload-item-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--meblip-text-main);
      }

      .meblip-upload-item-size {
        flex-shrink: 0;
        color: var(--meblip-text-sub);
        font-size: 10px;
      }

      .meblip-upload-item-remove {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        cursor: pointer;
        color: var(--meblip-text-sub);
        opacity: 0.6;
        transition: opacity 0.2s;
        background: none;
        border: none;
        padding: 0;
      }

      .meblip-upload-item-remove:hover {
        opacity: 1;
        color: var(--meblip-color-error);
      }

      .meblip-upload-item-remove svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.5;
        stroke-linecap: round;
      }

      .meblip-upload-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }

      /* GEOLOCATION */
      .meblip-geo {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
        padding-bottom: 6px;
        width: 100%;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .meblip-geo.is-ready {
        opacity: 1;
      }

      .meblip-geo-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }

      /* MAP */
      .meblip-map {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
        padding-bottom: 6px;
        width: 100%;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .meblip-map.is-ready {
        opacity: 1;
      }

      .meblip-map-preview {
        border-radius: 10px;
        overflow: hidden;
        position: relative;
        background: rgba(255,255,255,0.05);
      }

      .meblip-map-preview canvas {
        display: block;
        width: 100%;
        border-radius: 10px;
      }

      .meblip-map-marker {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -100%);
        width: 24px;
        height: 24px;
        color: var(--meblip-color-error);
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
        pointer-events: none;
      }

      .meblip-map-marker svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
        stroke: #fff;
        stroke-width: 1;
      }

      .meblip-map-label {
        font-size: 11px;
        color: var(--meblip-text-sub);
        text-align: center;
      }

      .meblip-map-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }

      @keyframes meblip-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .is-spinning { animation: meblip-spin 1s linear infinite; }

      .meblip-title {
        font-size: 14px;
        line-height: 24px;
        font-weight: 600;
        white-space: nowrap;
      }

      .meblip-subtitle {
        font-size: 12px;
        color: var(--meblip-text-sub);
        white-space: nowrap;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 0.3s ease 0.4s, transform 0.3s ease 0.4s;
      }

      .meblip-content.is-active .meblip-subtitle {
        opacity: 1;
        transform: translateY(0);
      }

      .meblip-subtitle a { color: var(--meblip-accent); text-decoration: underline; text-underline-offset: 2px; }
      .meblip-subtitle strong, .meblip-subtitle b { font-weight: 700; color: var(--meblip-text-main); }
      .meblip-subtitle code { font-family: monospace; font-size: 11px; background: var(--meblip-btn-bg); padding: 1px 4px; border-radius: 4px; }

      /* CONTENIDO PERSONALIZADO */
      .meblip-custom-content { width: 100%; margin-top: 6px; font-size: 12px; color: var(--meblip-text-main); line-height: 1.4; }

      /* BARRA DE PROGRESO */
      .meblip-progress {
        margin-top: 10px;
        height: 4px;
        background: rgba(128, 128, 128, 0.15);
        border-radius: 4px;
        overflow: hidden;
      }

      .meblip-progress-bar {
        height: 100%;
        background: var(--meblip-accent);
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
      }

      /* COUNTDOWN VISUAL - Barra inferior que se consume durante el duration */
      .meblip-countdown {
        position: absolute;
        bottom: 0; left: 0;
        height: 3px;
        background: var(--meblip-accent);
        z-index: 12;
        opacity: 0.7;
        width: 100%;
      }
      .meblip-countdown.is-running { animation: meblip-countdown-shrink linear forwards; }
      @keyframes meblip-countdown-shrink { from { width: 100%; } to { width: 0%; } }
      .meblip-island.is-paused .meblip-countdown { animation-play-state: paused; }

      /* Reduced motion */
      #meblip-island-root.meblip-reduced-motion *,
      #meblip-island-root.meblip-reduced-motion *::before,
      #meblip-island-root.meblip-reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.05s !important;
        transition-delay: 0s !important;
      }
      #meblip-island-root.meblip-reduced-motion .meblip-island {
        transition: opacity 0.15s ease !important;
      }
      #meblip-island-root.meblip-reduced-motion {
        transition-duration: 0.1s !important;
      }
      #meblip-island-root.meblip-reduced-motion .meblip-countdown.is-running {
        animation: none !important;
      }

    `;
    document.head.appendChild(style);
  }

  // ──────────────────────────────────────────────
  //  CREACION DEL DOM
  // ──────────────────────────────────────────────

  /**
   * Construye la estructura DOM del componente:
   * - Overlay bloqueante (fondo semitransparente para actividades bloqueantes)
   * - Root container (contenedor principal posicionado en pantalla)
   * - Stack layers (capas visuales que simulan elementos en cola)
   * - Isla principal (burbuja con SVG de forma dinamica + contenido)
   * Registra tambien los eventos de click y teclado (accesibilidad) sobre la isla.
   *
   * @private
   */
   _createDOM() {

    // Overlay bloqueante: impide interaccion con el resto de la pagina
    this.overlay = document.getElementById("meblip-blocking-overlay");
    if (!this.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.id = "meblip-blocking-overlay";
      document.body.appendChild(this.overlay);
    }

    // Root container: elemento fijo que aloja la isla y las capas de stack
    this.root = document.getElementById("meblip-island-root");
    if (!this.root) {
      this.root = document.createElement("div");
      this.root.id = "meblip-island-root";
      document.body.appendChild(this.root);
    }

    // Atributos ARIA para accesibilidad
    if (this.root) {
      this.root.setAttribute('role', 'region');
      this.root.setAttribute('aria-label', 'Notificaciones del sistema');
    }

    // Stack layers: hasta 5 capas apiladas que indican cuantas actividades hay en cola
    this.stackContainer = document.createElement("div");
    this.stackContainer.className = "meblip-stack-container";
    this.stackContainer.setAttribute('aria-hidden', 'true');

    this.stackLayers = [];
    for(let i=0; i<5; i++){
      const l = document.createElement("div");
      l.className = "meblip-stack-layer";
      this.stackContainer.appendChild(l);
      this.stackLayers.push(l);
    }

    // Generar Badge de contador
    this.stackBadge = document.createElement("div");
    this.stackBadge.className = "meblip-stack-badge";
    this.root.appendChild(this.stackBadge);

    // Isla principal: burbuja interactiva con soporte de click y teclado
    this.island = document.createElement("div");
    this.island.className = "meblip-island";
    this.island.setAttribute('tabindex', '-1');
    this.island.addEventListener('click', (e) => this._handleIslandClick(e));
    this.island.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
        e.preventDefault();
        if (e.key === 'Enter') {
          const active = this.activities.find(a => a.id === this.activeId);
          const primary = active?.actions?.find(a => a.type === 'primary');
          if (primary && primary.onClick) { primary.onClick({ activityId: active.id }); return; }
        }
        this._handleIslandClick(e);
      }
    });

    // Escape cierra la notificacion activa (salvo persistent)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible && !this.isClosing && this.activeId) {
        const active = this.activities.find(a => a.id === this.activeId);
        if (active?.persistent) return;
        const dismiss = active?.actions?.find(a => a.type === 'dismiss');
        if (dismiss && dismiss.onClick) dismiss.onClick({ activityId: active.id });
        else this.remove(this.activeId);
      }
    });

    // Pause on hover: pausar timer y countdown al pasar el raton
    this.island.addEventListener('mouseenter', () => {
      if (this.activeId && this.timers.has(this.activeId)) {
        this.isPaused = true;
        this._pauseTimer(this.activeId);
        this.island.classList.add('is-paused');
      }
    });
    this.island.addEventListener('mouseleave', () => {
      if (this.isPaused && this.activeId) {
        this.isPaused = false;
        this._resumeTimer(this.activeId);
        this.island.classList.remove('is-paused');
      }
    });

    // Resize: recalcular ancho en modos relativos (wide, %, vw, etc.)
    window.addEventListener('resize', () => {
      if (this.isVisible && this.activeId) this._measure();
    });

    // SVG de forma: genera el fondo con bordes redondeados que se adaptan al tamano
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("class", "meblip-island-shape-svg");
    this.svg.setAttribute("aria-hidden", "true");
    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.svg.appendChild(this.path);
    this.island.appendChild(this.svg);

    // Contenedor del contenido (titulo, subtitulo, progreso, acciones)
    this.content = document.createElement("div");
    this.content.className = "meblip-content";
    this.island.appendChild(this.content);

    // Preview icon: elemento para mostrar icono anticipado durante la animacion de entrada
    this.iconPreview = document.createElement("div");
    this.iconPreview.className = "meblip-icon-preview";
    this.island.appendChild(this.iconPreview);

    if (this.root) {
      this.root.appendChild(this.stackContainer);
      this.root.appendChild(this.island);
    }

  }

  // ──────────────────────────────────────────────
  //  SISTEMA DE TEMAS
  // ──────────────────────────────────────────────

  /**
   * Registra un listener en la media query `prefers-color-scheme` del sistema.
   * Cuando el tema esta configurado como 'system', reacciona automaticamente
   * a los cambios de preferencia del usuario (modo oscuro/claro del SO).
   *
   * @private
   */
  _initThemeListener() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', () => {
      if (this.theme === 'system') this._applyTheme();
    });
  }

  _initReducedMotionListener() {
    this._reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._reducedMotionQuery.addEventListener('change', () => {
      if (this.reducedMotion === 'system') this._resolveReducedMotion();
    });
    this._resolveReducedMotion();
  }

  _resolveReducedMotion() {
    if (this.reducedMotion === 'system') {
      this._reducedMotionActive = this._reducedMotionQuery?.matches ?? false;
    } else {
      this._reducedMotionActive = !!this.reducedMotion;
    }
    if (this.root) {
      this.root.classList.toggle('meblip-reduced-motion', this._reducedMotionActive);
    }
  }

  setReducedMotion(value) {
    this.reducedMotion = value;
    this._resolveReducedMotion();
  }

  _delay(normalMs, reducedMs = 10) {
    return this._reducedMotionActive ? reducedMs : normalMs;
  }

  /**
   * Establece el tema visual del componente.
   *
   * @param {string} theme - Tema a aplicar ('dark'|'light'|'system').
   */
  setTheme(theme) {
    this.theme = theme;
    this._applyTheme();
  }

  /**
   * Aplica el tema visual activo al DOM.
   * Si el tema es 'system', resuelve automaticamente a 'dark' o 'light'
   * segun la preferencia del sistema operativo.
   * Actualiza las clases CSS del root y refresca el contenido visible.
   *
   * @private
   */
  _applyTheme() {
    let activeTheme = this.theme;
    if (this.theme === 'system') {
      activeTheme = this.mediaQuery.matches ? 'dark' : 'light';
    }
    this.activeThemeName = activeTheme;
    if (this.root) {
      this.root.classList.remove('meblip-theme-light', 'meblip-theme-dark');
      this.root.classList.add(`meblip-theme-${activeTheme}`);
    }
    document.body.classList.remove('system-dark');
    if (activeTheme === 'dark') document.body.classList.add('system-dark');
    this._refresh();
  }

  // ──────────────────────────────────────────────
  //  POSICIONAMIENTO
  // ──────────────────────────────────────────────

  /**
   * Establece la posicion de la isla en la pantalla.
   * Actualiza las clases CSS del root container para reflejar la nueva posicion.
   *
   * @param {string} pos - Posicion deseada
   *   ('top-left'|'top-center'|'top-right'|'center'|'bottom-left'|'bottom-center'|'bottom-right').
   */
  setPosition(pos) {
    this.position = pos;
    this._currentPosition = pos;
    if (this.root) {
        this.root.className = `${pos} meblip-theme-${this.activeThemeName}${this._reducedMotionActive ? ' meblip-reduced-motion' : ''}`;
    }
  }

  setStackStyle(style) {
    this.stackStyle = style;
    this._refresh();
  }

  /**
   * Cambia el ancho por defecto de la isla en runtime.
   * @param {string} width - 'compact', 'normal', 'wide' o valor CSS arbitrario.
   */
  setIslandWidth(width) {
    this.islandWidth = width;
    if (this.isVisible && this.activeId) this._measure();
  }

  // ──────────────────────────────────────────────
  //  API PUBLICA: COLA DE ACTIVIDADES
  // ──────────────────────────────────────────────

  /**
   * Anade una nueva actividad a la cola de notificaciones.
   *
   * Si la actividad tiene un `groupId` y ya existe otra con el mismo grupo,
   * se agrupan: se incrementa el contador, se calcula el promedio de progreso
   * y se actualiza la actividad existente en lugar de crear una nueva.
   *
   * @param {Object} config - Configuracion de la actividad.
   * @param {string} [config.id] - ID unico. Se genera automaticamente si no se proporciona.
   * @param {string} [config.type] - Tipo de actividad ('success'|'error'|'info'|'warning'|'loading'|'thinking'|'generic').
   * @param {string} [config.title] - Titulo principal.
   * @param {string} [config.subtitle] - Texto secundario. Admite HTML.
   * @param {string} [config.content] - HTML personalizado entre el header y las acciones.
   * @param {string} [config.icon] - HTML del icono personalizado (sobrescribe el icono del tipo).
   * @param {string} [config.avatarUrl] - URL de imagen de avatar (reemplaza al icono).
   * @param {number} [config.progress] - Progreso de 0 a 1 para mostrar barra de progreso.
   * @param {number} [config.duration] - Duracion en ms antes de auto-eliminar la actividad.
   * @param {string} [config.priority='normal'] - Prioridad en la cola ('low'|'normal'|'high').
   * @param {boolean} [config.closeOnClick] - Si true, la isla se cierra al hacer click.
   * @param {boolean} [config.persistent] - Si true, la notificacion no se puede cerrar con Escape, click ni boton X. Solo se cierra programaticamente.
   * @param {boolean} [config.isBlocking] - Si true, muestra el overlay bloqueante.
   * @param {boolean} [config.waitToDisplay] - Si true, el temporizador no arranca hasta que la actividad se muestre.
   * @param {boolean} [config.enableAnimations=true] - Si false, desactiva las animaciones de la isla.
   * @param {string} [config.animation] - Override de animacion de la isla
   *   ('pulse'|'shake'|'bounce'|'glow'|'breathe'|'heartbeat'|'wobble'|'ripple'|'swing'|'none').
   *   Si no se indica, se usa la animacion por defecto del tipo.
   * @param {string} [config.entryAnimation] - Animacion de entrada alternativa ('slide-spring').
   * @param {string} [config.soundUrl] - URL de un sonido a reproducir cuando la actividad se muestre.
   * @param {string} [config.groupId] - ID de grupo para agrupar actividades similares.
   * @param {string} [config.groupTitle] - Plantilla de titulo para el grupo. Usa {n} como placeholder del contador.
   * @param {Array<Object>} [config.actions] - Botones de accion [{label, type, icon, onClick}].
   * @param {boolean} [config.confetti] - Si true, lanza confetti al mostrarse.
   * @param {string} [config.iconColor] - Color del icono. Acepta nombre de tipo ('success','error'...) o hex ('#ff00ff').
   * @param {string} [config.glowColor] - Color del shadow en animacion 'glow'. Acepta nombre de tipo o hex.
   * @param {boolean} [config.showCloseButton] - Si true, muestra boton X para cerrar.
   * @param {boolean} [config.showCountdown] - Si true, muestra barra de countdown inferior.
   * @param {string} [config.exitAnimation] - Animacion de salida ('fade'|'slide-down'|'slide-up'|'shrink-bounce').
   * @param {string} [config.position] - Override de posicion para esta notificacion.
   * @param {string} [config.islandWidth] - Override de ancho para esta notificacion ('compact'|'normal'|'wide'|CSS).
   * @param {function} [config.onShow] - Callback al mostrarse. Recibe {id, type}.
   * @param {function} [config.onHide] - Callback al cerrarse. Recibe {id, type}.
   * @returns {Promise} Promesa que se resuelve cuando la actividad se cierra, con {id, status: 'closed'}. La promesa tiene una propiedad `id` con el identificador asignado.
   */
  add(config) {
    // Logica de agrupacion: si ya existe una actividad con el mismo groupId,
    // se actualiza en lugar de crear una nueva
    if (config.groupId) {
      const existing = this.activities.find(a => a.groupId === config.groupId);
      if (existing) {
        existing.groupCount = (existing.groupCount || 1) + 1;

        // Calculo de promedio de progreso del grupo
        if (config.progress !== undefined) {
            if (!existing._groupProgresses) {
                existing._groupProgresses = [existing.progress !== undefined ? existing.progress : 0];
            }
            existing._groupProgresses.push(config.progress);
            const sum = existing._groupProgresses.reduce((a, b) => a + b, 0);
            existing.progress = sum / existing._groupProgresses.length;
        }

        const patch = {
          title: config.groupTitle ? config.groupTitle.replace('{n}', existing.groupCount) : config.title,
          subtitle: config.subtitle,
          progress: existing.progress,
          duration: config.duration,
          enableAnimations: config.enableAnimations !== undefined ? config.enableAnimations : existing.enableAnimations
        };
        this.update(existing.id, patch);
        return this.promises.get(existing.id);
      }
    }

    // Crear nueva actividad con ID unico
    const id = config.id || "meblip-" + Date.now() + Math.random().toString(16).slice(2);
    const activity = {
      ...config,
      id,
      priority: config.priority || 'normal',
      enableAnimations: config.enableAnimations !== false,
      addedAt: Date.now()
    };

    // Inicializar array de promedios si tiene grupo y progreso
    if (activity.groupId && activity.progress !== undefined) {
        activity._groupProgresses = [activity.progress];
    }

    this.activities.push(activity);
    this._sortQueue();

    // Devolver promesa que se resolvera cuando la actividad se cierre
    const promise = new Promise(resolve => this.resolvers.set(id, resolve));
    promise.id = id;
    promise.remove = () => this.remove(id);
    this.promises.set(id, promise);
    if (activity.duration && !activity.waitToDisplay) this._setTimer(id, activity.duration);
    this._refresh();
    return promise;
  }

  /**
   * Actualiza las propiedades de una actividad existente.
   * Si se cambia la prioridad, reordena la cola.
   * Si se cambia la duracion, reinicia el temporizador.
   *
   * @param {string} id - ID de la actividad a actualizar.
   * @param {string|Object} idOrPatch - ID de la actividad, o directamente el objeto patch (en cuyo caso se usa la actividad activa).
   * @param {Object} [patch] - Propiedades a modificar (mismas que en add()).
   */
  update(idOrPatch, patch) {
    let id, p;
    if (typeof idOrPatch === 'object' && idOrPatch !== null) {
      id = this.activeId;
      p = idOrPatch;
    } else {
      id = idOrPatch || this.activeId;
      p = patch;
    }
    const a = this.activities.find(x => x.id === id);
    if (a) {
      Object.assign(a, p);
      if (p.priority) this._sortQueue();
      if (p.duration && (!a.waitToDisplay || this.activeId === id)) this._setTimer(id, p.duration);
      this._refresh();
    }
    return this.promises.get(id);
  }

  /**
   * Comprueba si existe una actividad con el ID dado en la cola.
   *
   * @param {string} id - ID de la actividad a buscar.
   * @returns {boolean} true si la actividad existe, false en caso contrario.
   */
  has(id) {
    return this.activities.some(a => a.id === id);
  }

  /**
   * Elimina una actividad de la cola, limpia su temporizador
   * y resuelve su promesa asociada con estado 'closed'.
   *
   * @param {string} [id] - ID de la actividad a eliminar. Si se omite, se elimina la actividad activa.
   */
  remove(id) {
    if (!id) id = this.activeId;
    const activity = this.activities.find(a => a.id === id);
    // Callback onHide: se dispara antes de resolver la promesa
    if (activity && activity.onHide) activity.onHide({ id, type: activity.type });
    this._lastExitAnimation = activity?.exitAnimation || null;
    if (this.timers.has(id)) { clearTimeout(this.timers.get(id)); this.timers.delete(id); }
    this.timerMeta.delete(id);
    if (this.resolvers.has(id)) {
      this.resolvers.get(id)({ id, status: 'closed' });
      this.resolvers.delete(id);
    }
    this.promises.delete(id);
    this.activities = this.activities.filter(a => a.id !== id);
    this.activeId = this.activities.length ? this.activities[0].id : null;
    this._refresh();
  }

  /**
   * Elimina todas las actividades que pertenecen a un grupo.
   *
   * @param {string} groupId - ID del grupo a eliminar.
   */
  removeGroup(groupId) {
    const ids = this.activities.filter(a => a.groupId === groupId).map(a => a.id);
    ids.forEach(id => this.remove(id));
  }

  /**
   * Patron Undo: muestra una notificacion con boton Deshacer y countdown.
   * Si el usuario pulsa Deshacer, llama onUndo(). Si el timer expira, llama onConfirm().
   *
   * @param {Object} config - Mismas propiedades que add(), mas:
   * @param {string} [config.undoLabel='Deshacer'] - Texto del boton de deshacer.
   * @param {number} [config.undoDuration=5000] - Duracion del countdown en ms.
   * @param {Function} [config.onUndo] - Callback si el usuario deshace.
   * @param {Function} [config.onConfirm] - Callback si el timer expira (accion confirmada).
   * @returns {Promise<{id, status: 'undone'|'confirmed'}>}
   */
  addUndo(config) {
    const undoLabel = config.undoLabel || 'Deshacer';
    const undoDuration = config.undoDuration || 5000;
    let undone = false;

    return new Promise((resolve) => {
      const actConfig = {
        ...config,
        duration: undoDuration,
        showCountdown: true,
        actions: [
          {
            label: undoLabel,
            type: 'primary',
            icon: config.undoIcon || null,
            onClick: (ctx) => {
              undone = true;
              if (config.onUndo) config.onUndo();
              this.remove(ctx.activityId);
            }
          },
          ...(config.actions || [])
        ]
      };

      delete actConfig.undoLabel;
      delete actConfig.undoDuration;
      delete actConfig.onUndo;
      delete actConfig.onConfirm;
      delete actConfig.undoIcon;

      const task = this.add(actConfig);

      // Interceptar el resolver para distinguir undo vs confirmacion
      this.resolvers.set(task.id, () => {
        if (undone) {
          resolve({ id: task.id, status: 'undone' });
        } else {
          if (config.onConfirm) config.onConfirm();
          resolve({ id: task.id, status: 'confirmed' });
        }
      });
    });
  }

  /**
   * Patron Verify: muestra una notificacion con codigo de verificacion.
   *
   * Dos modos de uso:
   * - mode 'verify' (defecto): muestra un codigo que el usuario debe copiar en los inputs.
   *   Se valida automaticamente. Promesa resuelve con status 'verified' o 'cancelled'.
   * - mode 'input': no muestra codigo. El usuario introduce un codigo externo (SMS, email...)
   *   y pulsa Confirmar. Promesa resuelve con status 'submitted' y el codigo introducido.
   *
   * @param {Object} config - Mismas propiedades que add(), mas:
   * @param {string} [config.mode='verify'] - Modo: 'verify' (con codigo visible) o 'input' (codigo ciego).
   * @param {string} [config.code] - Codigo a verificar (solo modo verify). Si se omite, se genera automaticamente.
   * @param {number} [config.codeLength=4] - Longitud del codigo.
   * @param {string} [config.codeType='alphanumeric'] - Tipo: 'numeric' o 'alphanumeric'.
   * @param {boolean} [config.caseSensitive=false] - Si true, distingue mayusculas/minusculas.
   * @param {string} [config.confirmLabel='Confirmar'] - Texto del boton confirmar (solo modo input).
   * @param {string} [config.cancelLabel='Cancelar'] - Texto del boton cancelar.
   * @param {Function} [config.onVerify] - Callback si el codigo es correcto (solo modo verify).
   * @param {Function} [config.onSubmit] - Callback con el codigo introducido (solo modo input).
   * @param {Function} [config.onFail] - Callback si el codigo es incorrecto (solo modo verify).
   * @param {Function} [config.onCancel] - Callback si el usuario cancela.
   * @returns {Promise<{id, status, code}>} status: 'verified'|'submitted'|'cancelled'
   */
  addVerify(config) {
    const mode = config.mode || 'verify';
    const codeLength = config.codeLength || 4;
    const codeType = config.codeType || 'alphanumeric';
    const caseSensitive = config.caseSensitive || false;
    const confirmLabel = config.confirmLabel || 'Confirmar';
    const cancelLabel = config.cancelLabel || 'Cancelar';

    // En modo verify: generar o usar codigo proporcionado. En modo input: no hay codigo interno
    const code = mode === 'input' ? null : (config.code || this._generateCode(codeLength, codeType));

    let verified = false;
    let submittedCode = null;

    return new Promise((resolve) => {
      const actConfig = {
        ...config,
        _verify: { mode, code, codeLength: code ? code.length : codeLength, codeType, caseSensitive, confirmLabel, cancelLabel },
        actions: []
      };

      delete actConfig.mode;
      delete actConfig.code;
      delete actConfig.codeLength;
      delete actConfig.codeType;
      delete actConfig.caseSensitive;
      delete actConfig.confirmLabel;
      delete actConfig.cancelLabel;
      delete actConfig.onVerify;
      delete actConfig.onSubmit;
      delete actConfig.onFail;
      delete actConfig.onCancel;
      delete actConfig.duration;

      const task = this.add(actConfig);

      this.resolvers.set(task.id, () => {
        if (verified) {
          resolve({ id: task.id, status: mode === 'input' ? 'submitted' : 'verified', code: submittedCode || code });
        } else {
          if (config.onCancel) config.onCancel();
          resolve({ id: task.id, status: 'cancelled', code: null });
        }
      });

      const activity = this.activities.find(a => a.id === task.id);
      if (activity) {
        activity._verifyResolve = (enteredCode) => {
          verified = true;
          submittedCode = enteredCode || null;
          if (mode === 'input' && config.onSubmit) config.onSubmit(enteredCode);
          if (mode !== 'input' && config.onVerify) config.onVerify();
          this.remove(task.id);
        };
        activity._verifyFail = () => {
          if (config.onFail) config.onFail();
        };
      }
    });
  }

  /**
   * Genera un codigo aleatorio de la longitud y tipo indicados.
   * @param {number} length - Longitud del codigo.
   * @param {string} type - 'numeric' o 'alphanumeric'.
   * @returns {string}
   * @private
   */
  _generateCode(length, type) {
    const chars = type === 'numeric' ? '0123456789' : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Muestra una notificacion con un formulario interactivo.
   * El usuario rellena los campos y pulsa Confirmar o Cancelar.
   *
   * @param {Object} config - Mismas propiedades que add(), mas:
   * @param {Array<Object>} config.fields - Campos del formulario.
   * @param {string} config.fields[].type - Tipo HTML: 'text','email','tel','number','password','url','date','select','textarea'.
   * @param {string} config.fields[].label - Etiqueta del campo.
   * @param {boolean} [config.fields[].required=false] - Si es obligatorio.
   * @param {string} [config.fields[].placeholder] - Placeholder del campo.
   * @param {string} [config.fields[].value] - Valor inicial.
   * @param {Array<string|Array>} [config.fields[].options] - Opciones (solo para type 'select'). Cada elemento puede ser un string o un array [valor, etiqueta].
   * @param {number} [config.fields[].rows=2] - Numero de filas visibles (solo para type 'textarea').
   * @param {string} [config.confirmLabel='Confirmar'] - Texto del boton confirmar.
   * @param {string} [config.cancelLabel='Cancelar'] - Texto del boton cancelar.
   * @param {Function} [config.onSubmit] - Callback con los datos del formulario.
   * @param {Function} [config.onCancel] - Callback al cancelar.
   * @returns {Promise<{id, status, data}>} status: 'submitted'|'cancelled'
   */
  addForm(config) {
    const fields = config.fields || [];
    const confirmLabel = config.confirmLabel || 'Confirmar';
    const cancelLabel = config.cancelLabel || 'Cancelar';

    let submitted = false;
    let formData = null;

    return new Promise((resolve) => {
      const actConfig = {
        ...config,
        _form: { fields, confirmLabel, cancelLabel },
        actions: []
      };

      delete actConfig.fields;
      delete actConfig.confirmLabel;
      delete actConfig.cancelLabel;
      delete actConfig.onSubmit;
      delete actConfig.onCancel;
      delete actConfig.duration;

      const task = this.add(actConfig);

      this.resolvers.set(task.id, () => {
        if (submitted) {
          resolve({ id: task.id, status: 'submitted', data: formData });
        } else {
          if (config.onCancel) config.onCancel();
          resolve({ id: task.id, status: 'cancelled', data: null });
        }
      });

      const activity = this.activities.find(a => a.id === task.id);
      if (activity) {
        activity._formResolve = (data) => {
          submitted = true;
          formData = data;
          if (config.onSubmit) config.onSubmit(data);
          this.remove(task.id);
        };
      }
    });
  }

  /**
   * Atajo tipo window.prompt(): muestra una notificacion con un unico campo de texto.
   * Internamente usa addForm() con un campo sin etiqueta.
   *
   * @param {Object} [config={}] - Mismas propiedades que add(), mas:
   * @param {string} [config.placeholder] - Texto de ayuda dentro del campo.
   * @param {boolean} [config.required=true] - Si el campo es obligatorio. Por defecto true.
   * @param {string} [config.value] - Valor inicial del campo.
   * @param {string} [config.confirmLabel='Confirmar'] - Texto del boton confirmar.
   * @param {string} [config.cancelLabel='Cancelar'] - Texto del boton cancelar.
   * @param {Function} [config.onCancel] - Callback al cancelar.
   * @returns {Promise<string|null>} El texto introducido o null si se cancelo.
   */
  prompt(config = {}) {
    const placeholder = config.placeholder || '';
    const required = config.required !== false;
    const value = config.value || '';

    const formConfig = {
      ...config,
      fields: [{ type: 'text', label: '', placeholder, required, value }]
    };

    delete formConfig.placeholder;
    delete formConfig.required;
    delete formConfig.value;

    return this.addForm(formConfig).then(result => {
      if (result.status === 'submitted') {
        return result.data.field_0;
      }
      return null;
    });
  }

  /**
   * Muestra una notificacion con zona de drop para subir ficheros.
   *
   * @param {Object} config - Mismas propiedades que add(), mas:
   * @param {boolean} [config.multiple=false] - Si true, permite seleccionar multiples ficheros.
   * @param {string} [config.accept] - Extensiones o MIME types permitidos (ej: '.pdf,.docx', 'image/*').
   * @param {number} [config.maxSize] - Tamano maximo por fichero en bytes. 0 o sin definir = sin limite.
   * @param {string} [config.confirmLabel='Subir'] - Texto del boton confirmar.
   * @param {string} [config.cancelLabel='Cancelar'] - Texto del boton cancelar.
   * @param {Function} [config.onSubmit] - Callback con el array de ficheros.
   * @param {Function} [config.onCancel] - Callback al cancelar.
   * @returns {Promise<{id, status, files}>} status: 'submitted'|'cancelled'
   */
  addUpload(config) {
    const multiple = config.multiple || false;
    const accept = config.accept || '';
    const maxSize = config.maxSize || 0;
    const confirmLabel = config.confirmLabel || 'Subir';
    const cancelLabel = config.cancelLabel || 'Cancelar';

    let submitted = false;
    let uploadedFiles = null;

    return new Promise((resolve) => {
      const actConfig = {
        ...config,
        _upload: { multiple, accept, maxSize, confirmLabel, cancelLabel },
        actions: []
      };

      delete actConfig.multiple;
      delete actConfig.accept;
      delete actConfig.maxSize;
      delete actConfig.confirmLabel;
      delete actConfig.cancelLabel;
      delete actConfig.onSubmit;
      delete actConfig.onCancel;
      delete actConfig.duration;

      const task = this.add(actConfig);

      this.resolvers.set(task.id, () => {
        if (submitted) {
          resolve({ id: task.id, status: 'submitted', files: uploadedFiles });
        } else {
          if (config.onCancel) config.onCancel();
          resolve({ id: task.id, status: 'cancelled', files: null });
        }
      });

      const activity = this.activities.find(a => a.id === task.id);
      if (activity) {
        activity._uploadResolve = (files) => {
          submitted = true;
          uploadedFiles = files;
          if (config.onSubmit) config.onSubmit(files);
          this.remove(task.id);
        };
      }
    });
  }

  /**
   * Muestra una notificacion que obtiene la geolocalizacion del usuario.
   * Mientras se obtiene la ubicacion, muestra un indicador de carga.
   * Al obtenerla o fallar, cierra la notificacion y resuelve la promesa.
   * Si se indica duration, mantiene la notificacion visible ese tiempo antes de cerrar.
   *
   * @param {Object} config - Mismas propiedades que add(), mas:
   * @param {boolean} [config.highAccuracy=false] - Si true, solicita alta precision (GPS).
   * @param {number} [config.timeout] - Tiempo maximo en ms para obtener la posicion.
   * @param {number} [config.maximumAge] - Edad maxima en ms de una posicion cacheada aceptable.
   * @param {number} [config.duration] - Tiempo en ms que la notificacion permanece visible tras el resultado.
   * @param {string} [config.cancelLabel='Cancelar'] - Texto del boton cancelar.
   * @param {Function} [config.onCancel] - Callback al cancelar.
   * @returns {Promise<{id, status, position, error}>} status: 'located'|'cancelled'|'error'
   */
  addGeolocation(config) {
    const highAccuracy = config.highAccuracy || false;
    const timeout = config.timeout;
    const maximumAge = config.maximumAge;
    const cancelLabel = config.cancelLabel || 'Cancelar';
    const duration = config.duration;

    let located = false;
    let geoPosition = null;
    let geoError = null;

    return new Promise((resolve) => {
      const actConfig = {
        ...config,
        type: config.type || 'loading',
        icon: config.icon || 'location',
        title: config.title || 'Ubicacion',
        subtitle: config.subtitle || 'Obteniendo ubicacion...',
        _geo: { highAccuracy, timeout, maximumAge, cancelLabel, duration },
        actions: []
      };

      delete actConfig.highAccuracy;
      delete actConfig.timeout;
      delete actConfig.maximumAge;
      delete actConfig.cancelLabel;
      delete actConfig.onCancel;
      delete actConfig.duration;

      const task = this.add(actConfig);

      this.resolvers.set(task.id, () => {
        if (located) {
          resolve({ id: task.id, status: 'located', position: geoPosition, error: null });
        } else if (geoError) {
          resolve({ id: task.id, status: 'error', position: null, error: geoError });
        } else {
          if (config.onCancel) config.onCancel();
          resolve({ id: task.id, status: 'cancelled', position: null, error: null });
        }
      });

      const activity = this.activities.find(a => a.id === task.id);
      if (activity) {
        activity._geoResolve = (position) => {
          located = true;
          geoPosition = position;
          this.remove(task.id);
        };
        activity._geoError = (errorMsg) => {
          geoError = errorMsg;
        };
      }
    });
  }

  /**
   * Muestra una notificacion con una previsualizacion de mapa estatico.
   * Por defecto usa tiles de OpenStreetMap (sin API key).
   * Permite enviar una URL de tiles personalizada para otros proveedores.
   *
   * @param {Object} config - Mismas propiedades que add(), mas:
   * @param {number} config.lat - Latitud del centro del mapa.
   * @param {number} config.lng - Longitud del centro del mapa.
   * @param {number} [config.zoom=15] - Nivel de zoom (1-19).
   * @param {number} [config.mapWidth=368] - Ancho del mapa en pixeles.
   * @param {number} [config.mapHeight=160] - Alto del mapa en pixeles.
   * @param {string} [config.tileUrl] - URL de tiles personalizada con placeholders {z}, {x}, {y}. Por defecto OpenStreetMap.
   * @param {string} [config.markerLabel] - Texto descriptivo debajo del mapa.
   * @param {boolean} [config.showMarker=true] - Si true, muestra un marcador en el centro del mapa.
   * @param {string} [config.cancelLabel='Cerrar'] - Texto del boton cerrar.
   * @param {Function} [config.onCancel] - Callback al cerrar.
   * @returns {Promise<{id, status}>} status: 'closed'|'cancelled'
   */
  addMap(config) {
    const lat = config.lat;
    const lng = config.lng;
    const zoom = config.zoom || 15;
    const mapWidth = config.mapWidth || 368;
    const mapHeight = config.mapHeight || 160;
    const tileUrl = config.tileUrl || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const markerLabel = config.markerLabel || '';
    const showMarker = config.showMarker !== undefined ? config.showMarker : true;
    const cancelLabel = config.cancelLabel || 'Cerrar';

    return new Promise((resolve) => {
      const actConfig = {
        ...config,
        icon: config.icon || 'map',
        _map: { lat, lng, zoom, mapWidth, mapHeight, tileUrl, markerLabel, showMarker, cancelLabel },
        actions: []
      };

      delete actConfig.lat;
      delete actConfig.lng;
      delete actConfig.zoom;
      delete actConfig.mapWidth;
      delete actConfig.mapHeight;
      delete actConfig.tileUrl;
      delete actConfig.markerLabel;
      delete actConfig.showMarker;
      delete actConfig.cancelLabel;
      delete actConfig.onCancel;
      delete actConfig.duration;

      const task = this.add(actConfig);

      this.resolvers.set(task.id, () => {
        if (config.onCancel) config.onCancel();
        resolve({ id: task.id, status: 'closed' });
      });
    });
  }

  /**
   * Convierte coordenadas lat/lng/zoom a coordenadas de tile x/y de OpenStreetMap.
   * @param {number} lat - Latitud.
   * @param {number} lng - Longitud.
   * @param {number} zoom - Nivel de zoom.
   * @returns {{x: number, y: number, fracX: number, fracY: number}} Tile x/y y fracciones dentro del tile.
   * @private
   */
  _latLngToTile(lat, lng, zoom) {
    const n = Math.pow(2, zoom);
    const xFloat = (lng + 180) / 360 * n;
    const latRad = lat * Math.PI / 180;
    const yFloat = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
    return {
      x: Math.floor(xFloat),
      y: Math.floor(yFloat),
      fracX: xFloat - Math.floor(xFloat),
      fracY: yFloat - Math.floor(yFloat)
    };
  }

  /**
   * Formatea un tamano en bytes a formato legible (B, KB, MB).
   * @param {number} bytes
   * @returns {string}
   * @private
   */
  _formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Comprueba si un fichero cumple las restricciones del atributo accept.
   * @param {File} file
   * @param {string} accept - Extensiones o MIME types separados por coma.
   * @returns {boolean}
   * @private
   */
  _matchAccept(file, accept) {
    const rules = accept.split(',').map(s => s.trim().toLowerCase());
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return rules.some(rule => {
      if (rule.startsWith('.')) return name.endsWith(rule);
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
  }

  /**
   * Ejecuta una secuencia de pasos de notificacion en orden.
   * Cada paso se muestra tras completar el anterior (morphing suave via update).
   *
   * @param {Array<Object>} steps - Pasos de la cadena. Cada paso acepta las mismas propiedades que add(), mas:
   * @param {Promise} [step.until] - Esperar a esta promesa antes de avanzar al siguiente paso.
   * @returns {Promise<{id, status: 'chain-complete'|'chain-interrupted'}>}
   */
  async chain(steps) {
    if (!steps || steps.length === 0) return { status: 'chain-complete' };

    // Primer paso: crear la actividad (sin auto-remove si hay mas pasos)
    const firstStep = { ...steps[0] };
    if (steps.length > 1) delete firstStep.duration;
    delete firstStep.until;
    const task = this.add(firstStep);
    const chainId = task.id;

    // Pasos intermedios: usar update() para morphing suave
    for (let i = 1; i < steps.length; i++) {
      const prevStep = steps[i - 1];

      if (prevStep.until) {
        await prevStep.until;
      } else if (prevStep.duration) {
        await new Promise(r => setTimeout(r, prevStep.duration));
      }

      // Si la actividad fue eliminada externamente, interrumpir
      if (!this.activities.find(a => a.id === chainId)) {
        return { id: chainId, status: 'chain-interrupted' };
      }

      const patch = { ...steps[i] };
      const isLast = i === steps.length - 1;
      if (!isLast) delete patch.duration;
      delete patch.until;
      this.update(chainId, patch);
    }

    // Esperar a que la actividad se cierre (por timer del ultimo paso o manualmente)
    return new Promise((resolve) => {
      this.resolvers.set(chainId, () => {
        resolve({ id: chainId, status: 'chain-complete' });
      });
    });
  }

  /**
   * Lanza manualmente el efecto de confetti sobre la isla.
   */
  confetti() {
    if (!this._reducedMotionActive) this._spawnConfetti();
  }

  // ──────────────────────────────────────────────
  //  GESTION INTERNA DE COLA
  // ──────────────────────────────────────────────

  /**
   * Ordena la cola de actividades por prioridad (descendente) y por orden de llegada (FIFO).
   * Establece como activa la primera actividad de la cola ordenada.
   *
   * @private
   */
  _sortQueue() {
    this.activities.sort((a, b) => {
      const pA = this.priorityMap[a.priority];
      const pB = this.priorityMap[b.priority];
      if (pA !== pB) return pB - pA;
      return a.addedAt - b.addedAt;
    });
    if (this.activities.length) this.activeId = this.activities[0].id;
  }

  /**
   * Refresca el estado visual de la isla segun la actividad activa.
   * Si no hay actividades, cierra la isla.
   * Si la actividad tiene sonido y aun no se ha reproducido, lo reproduce.
   *
   * @private
   */
  _refresh() {
    const active = this.activities.find(a => a.id === this.activeId);
    if (!active) { this._closeIsland(this._lastExitAnimation); this._lastExitAnimation = null; return; }
    // Posición por notificación: mover isla si la actividad lo requiere
    const targetPos = active.position || this.position;
    if (this._currentPosition !== targetPos) {
      this._currentPosition = targetPos;
      if (this.root) this.root.className = `${targetPos} meblip-theme-${this.activeThemeName}${this._reducedMotionActive ? ' meblip-reduced-motion' : ''}`;
    }
    if (active.duration && active.waitToDisplay && !this.timers.has(active.id)) {
      this._setTimer(active.id, active.duration);
      if (this.isPaused) this._pauseTimer(active.id);
    }
    if (active.soundUrl && !active.soundPlayed) { new Audio(active.soundUrl).play().catch(() => {}); active.soundPlayed = true; }
    this._updateIslandState(active, this.activities.length - 1);
  }

  /**
   * Establece o reinicia el temporizador de auto-eliminacion de una actividad.
   *
   * @param {string} id - ID de la actividad.
   * @param {number} ms - Milisegundos antes de eliminar la actividad automaticamente.
   * @private
   */
  _setTimer(id, ms) {
    if (this.timers.has(id)) clearTimeout(this.timers.get(id));
    this.timers.set(id, setTimeout(() => this.remove(id), ms));
    this.timerMeta.set(id, { startTime: Date.now(), remainingTime: ms, originalDuration: ms });
  }

  /**
   * Pausa el temporizador de una actividad, guardando el tiempo restante.
   * @param {string} id
   * @private
   */
  _pauseTimer(id) {
    if (!this.timers.has(id) || !this.timerMeta.has(id)) return;
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    const meta = this.timerMeta.get(id);
    meta.remainingTime = Math.max(0, meta.remainingTime - (Date.now() - meta.startTime));
  }

  /**
   * Reanuda el temporizador de una actividad con el tiempo restante.
   * @param {string} id
   * @private
   */
  _resumeTimer(id) {
    const meta = this.timerMeta.get(id);
    if (!meta || meta.remainingTime <= 0) return;
    this.timers.set(id, setTimeout(() => this.remove(id), meta.remainingTime));
    meta.startTime = Date.now();
  }

  /**
   * Gestiona el click o pulsacion de tecla sobre la isla.
   * Si se pulsa un boton de accion, ejecuta su callback onClick.
   * Si la actividad tiene closeOnClick, se elimina de la cola.
   *
   * @param {Event} e - Evento de click o teclado.
   * @private
   */
  _handleIslandClick(e) {
    const active = this.activities.find(a => a.id === this.activeId);
    if (!active) return;
    const closeBtn = e.target.closest('.meblip-close-btn');
    if (closeBtn) { if (active.persistent) return; this.remove(active.id); return; }
    const actionBtn = e.target.closest('.meblip-action-btn');
    if (actionBtn) {
      const actionIndex = parseInt(actionBtn.dataset.index);
      const action = active.actions?.[actionIndex];
      if (action && action.onClick) action.onClick({ activityId: active.id });
      return;
    }
    if (active._verify) return;
    if (active._form) return;
    if (active._upload) return;
    if (active._geo) return;
    if (active._map) return;
    if (active.closeOnClick && !active.persistent) this.remove(active.id);
  }

  /**
   * Activa o desactiva el atributo `inert` en todos los hijos directos de `<body>`
   * excepto la isla y el overlay. Esto bloquea la interaccion por teclado (Tab, escritura)
   * mientras una notificacion bloqueante esta activa.
   *
   * @param {boolean} inert - `true` para bloquear, `false` para desbloquear.
   * @private
   */
  _setPageInert(inert) {
    if (inert) this._previouslyFocused = document.activeElement;
    for (const el of document.body.children) {
      if (el === this.root || el === this.overlay) continue;
      el.inert = inert;
    }
    if (inert) this.island.focus();
    else if (this._previouslyFocused) {
      this._previouslyFocused.focus();
      this._previouslyFocused = null;
    }
  }

  // ──────────────────────────────────────────────
  //  RENDERIZADO DE CONTENIDO
  // ──────────────────────────────────────────────

  /**
   * Actualiza el estado visual completo de la isla para la actividad indicada.
   * Gestiona: overlay bloqueante, accesibilidad (role, aria-label),
   * color de acento segun tipo, animaciones (shake/pulse) y transicion de visibilidad.
   *
   * @param {Object} data - Datos de la actividad activa.
   * @param {number} queueCount - Numero de actividades pendientes en cola (sin contar la activa).
   * @private
   */
  _updateIslandState(data, queueCount) {
    if (!this.island) return;
    this.isClosing = false;
    if (!this.closeAnimation) this.island.classList.remove('is-closing-fade');
    this.stackCount = Math.min(queueCount, 5);

    // Gestionar overlay bloqueante
    if (this.overlay) {
      if (data.isBlocking) {
        this.overlay.classList.add('is-active');
        this._setPageInert(true);
      } else if (this.stackCount === 0) {
        this.overlay.classList.remove('is-active');
        this._setPageInert(false);
      }
    }

    // Gestionar className custom
    if (this._currentClassName) {
      this.root.classList.remove(this._currentClassName);
      if (this.overlay) this.overlay.classList.remove(this._currentClassName);
    }
    this._currentClassName = data.className || null;
    if (this._currentClassName) {
      this.root.classList.add(this._currentClassName);
      if (this.overlay) this.overlay.classList.add(this._currentClassName);
    }

    // Gestión del Contador de Apilamiento (Badge)
    if (this.stackBadge) {
      if (this.stackStyle === 'counter' && queueCount > 0) {
        this.stackBadge.innerText = `+${queueCount}`;
        this.stackBadge.classList.add('is-visible');
      } else {
        this.stackBadge.classList.remove('is-visible');
      }
    }

    // Accesibilidad: configurar role y aria-label segun tipo de interaccion
    if (data.closeOnClick) {
      this.island.classList.add('is-clickable');
      this.island.setAttribute('role', 'button');
      this.island.setAttribute('aria-label', `Notificación: ${data.title}. Pulse para cerrar.`);
    } else {
      this.island.classList.remove('is-clickable');
      this.island.removeAttribute('role');
      this.island.setAttribute('aria-label', `Notificación: ${data.title}`);
    }

    // Estilo visual segun el tipo de actividad
    const typeColor = this.typeColors[data.type];

    if (this.root) {
        if (typeColor) {
            // Fondo coloreado: isla con el color del tipo
            const r = parseInt(typeColor.slice(1,3), 16);
            const g = parseInt(typeColor.slice(3,5), 16);
            const b = parseInt(typeColor.slice(5,7), 16);
            // Luminancia percibida (Rec. 601) para contraste automatico
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const isLight = lum > 0.5;
            this.root.style.setProperty('--meblip-island-bg', `rgba(${r},${g},${b},0.9)`);
            this.root.style.setProperty('--meblip-island-border', isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)');
            this.root.style.setProperty('--meblip-text-main', isLight ? '#1d1d1f' : '#ffffff');
            this.root.style.setProperty('--meblip-text-sub', isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)');
            this.root.style.setProperty('--meblip-accent', isLight ? '#1d1d1f' : '#ffffff');
            this.root.style.setProperty('--meblip-accent-contrast', typeColor);
            this.root.style.setProperty('--meblip-btn-bg', isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.2)');
            this.root.style.setProperty('--meblip-btn-hover', isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)');
        } else {
            // Sin color de tipo: restaurar valores del tema activo
            const isDark = this.activeThemeName === 'dark';
            this.root.style.setProperty('--meblip-island-bg', isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.8)');
            this.root.style.setProperty('--meblip-island-border', isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)');
            this.root.style.setProperty('--meblip-text-main', isDark ? '#ffffff' : '#1d1d1f');
            this.root.style.setProperty('--meblip-text-sub', isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
            this.root.style.setProperty('--meblip-accent', isDark ? '#ffffff' : '#1d1d1f');
            this.root.style.setProperty('--meblip-accent-contrast', isDark ? '#000000' : '#ffffff');
            this.root.style.setProperty('--meblip-btn-bg', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)');
            this.root.style.setProperty('--meblip-btn-hover', isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)');
        }
    }

    // Animaciones: sistema de lookup con soporte para override via propiedad 'animation'
    this.island.classList.remove(...this.allAnimClasses);
    if (data.enableAnimations && !this._reducedMotionActive) {
      const anim = data.animation === 'none' ? null : (data.animation || this.defaultAnimations[data.type] || null);
      if (anim) {
        // glowColor: color custom para la animacion glow (acepta nombre de tipo o hex)
        if (anim === 'glow' && data.glowColor) {
          const gc = this.typeColors[data.glowColor] || data.glowColor;
          this.island.style.setProperty('--meblip-glow-color', gc);
        } else {
          this.island.style.removeProperty('--meblip-glow-color');
        }
        void this.island.offsetWidth; // Forzar reflow para reiniciar animacion
        this.island.classList.add(`anim-${anim}`);
      }
    }

    // Si la isla no es visible, mostrarla primero y luego aplicar contenido
    if (!this.isVisible) {
      this.isVisible = true;
      this.island.setAttribute('tabindex', '0');
      this.width = this.minWidth; this.height = this.minHeight;
      this.targetWidth = this.minWidth; this.targetHeight = this.minHeight;

      // Limpiar clases de entrada previas
      this.island.classList.remove('entry-slide-spring-left', 'entry-slide-spring-right', 'entry-slide-spring-down');

      if (data.entryAnimation === 'slide-spring' && !this._reducedMotionActive) {
        // Determinar direccion segun posicion de la isla
        let dir = 'down';
        if (this._currentPosition.includes('left')) dir = 'left';
        else if (this._currentPosition.includes('right')) dir = 'right';
        this.island.style.transform = 'none';
        this.island.style.opacity = '0';
        this.island.classList.add('is-visible');
        void this.island.offsetWidth;
        this.island.classList.add(`entry-slide-spring-${dir}`);
      } else {
        this.island.classList.add('is-visible');
      }

      // Preview icon: mostrar icono anticipado en el circulo
      const resolvedIconPreview = data.icon ? (this.icons[data.icon] || data.icon) : null;
      if (resolvedIconPreview && this.iconPreview && !this._reducedMotionActive) {
        const previewColor = data.iconColor ? (this.typeColors[data.iconColor] || data.iconColor) : null;
        this.iconPreview.innerHTML = resolvedIconPreview;
        if (previewColor) this.iconPreview.style.color = previewColor;
        else this.iconPreview.style.color = '';
        this._iconPreviewTimer = setTimeout(() => {
          if (this.iconPreview) this.iconPreview.classList.add('is-visible');
        }, 300);
      }

      this._contentTimer = setTimeout(() => {
        this._applyContent(data);
        if (!this._reducedMotionActive && (data.confetti || (this.autoConfetti && data.type === 'success'))) {
          setTimeout(() => this._spawnConfetti(), this._delay(200));
        }
      }, this._delay(400, 50));
    } else {
      clearTimeout(this._contentTimer);
      clearTimeout(this._iconPreviewTimer);
      this._applyContent(data);
      if (!this._reducedMotionActive && (data.confetti || (this.autoConfetti && data.type === 'success'))) {
        setTimeout(() => this._spawnConfetti(), this._delay(200));
      }
    }
  }

  /**
   * Aplica el contenido HTML dentro de la isla (icono/avatar, titulo, subtitulo,
   * barra de progreso, botones de accion).
   * Si el titulo no ha cambiado, actualiza solo los campos dinamicos (progreso, subtitulo)
   * para evitar parpadeos. Si el titulo es nuevo, realiza una transicion completa.
   *
   * @param {Object} data - Datos de la actividad a renderizar.
   * @private
   */
  _applyContent(data) {
    if (!this.content) return;
    const existingTitle = this.content.querySelector('.meblip-title')?.innerText;

    // Determinar si mostrar avatar o icono
    const resolvedIcon = data.icon ? (this.icons[data.icon] || data.icon) : null;
    const iconColor = data.iconColor ? (this.typeColors[data.iconColor] || data.iconColor) : null;
    const iconStyle = iconColor ? ` style="color:${iconColor}"` : '';
    let mediaHTML = "";
    if (data.avatarUrl) {
      mediaHTML = `<img src="${data.avatarUrl}" class="meblip-avatar" alt="${data.title}">`;
    } else {
      mediaHTML = resolvedIcon ? `<div class="meblip-icon"${iconStyle}>${resolvedIcon}</div>` : '';
    }

    // Atributos ARIA segun prioridad: 'alert' (assertive) para alta prioridad, 'status' (polite) para el resto
    const isHighPriority = data.priority === 'high' || data.type === 'error';
    this.content.setAttribute('role', isHighPriority ? 'alert' : 'status');
    this.content.setAttribute('aria-live', isHighPriority ? 'assertive' : 'polite');
    this.content.setAttribute('aria-atomic', 'true');

    // Generar HTML de botones de accion
    let actionsHTML = '';
    if (data.actions && data.actions.length > 0) {
      actionsHTML = `<div class="meblip-actions" role="group" aria-label="Acciones de la notificación">
        ${data.actions.map((act, i) => `<button class="meblip-action-btn ${act.type || ''}" data-index="${i}">${act.icon ? `<span class="meblip-btn-icon">${act.icon}</span>` : ''}${act.label}</button>`).join('')}
      </div>`;
    }

    // Generar HTML de verificacion si existe _verify
    let verifyHTML = '';
    if (data._verify) {
      const v = data._verify;
      const isInput = v.mode === 'input';
      const inputType = v.codeType === 'numeric' ? 'tel' : 'text';
      const inputs = Array.from({ length: v.codeLength }, (_, i) =>
        `<input class="meblip-verify-input" type="${inputType}" maxlength="1" data-index="${i}" autocomplete="off" />`
      ).join('');
      verifyHTML = `
        <div class="meblip-verify">
          ${isInput ? '' : `<div class="meblip-verify-code">${v.code}</div>`}
          <div class="meblip-verify-inputs">${inputs}</div>
          <div class="meblip-verify-actions">
            <button class="meblip-action-btn meblip-verify-cancel">${v.cancelLabel}</button>
            ${isInput ? `<button class="meblip-action-btn primary meblip-verify-confirm">${v.confirmLabel}</button>` : ''}
          </div>
        </div>`;
    }

    // Generar HTML de formulario si existe _form
    let formHTML = '';
    if (data._form) {
      const f = data._form;
      const fieldsHTML = f.fields.map((field, i) => {
        const req = field.required ? '<span class="meblip-form-required">*</span>' : '';
        const ph = field.placeholder ? ` placeholder="${field.placeholder}"` : '';
        const val = field.value || '';
        let inputHTML = '';
        if (field.type === 'select') {
          const opts = (field.options || []).map(o => {
            const optVal = Array.isArray(o) ? o[0] : o;
            const optLabel = Array.isArray(o) ? o[1] : o;
            return `<option value="${optVal}"${val === optVal ? ' selected' : ''}>${optLabel}</option>`;
          }).join('');
          const phClass = field.placeholder && !val ? ' is-placeholder' : '';
          inputHTML = `<select class="meblip-form-select${phClass}" data-field="${i}">${field.placeholder ? `<option value="" disabled${!val ? ' selected' : ''}>${field.placeholder}</option>` : ''}${opts}</select>`;
        } else if (field.type === 'textarea') {
          inputHTML = `<textarea class="meblip-form-textarea" data-field="${i}"${ph} rows="${field.rows || 2}">${val}</textarea>`;
        } else {
          inputHTML = `<input class="meblip-form-input" type="${field.type || 'text'}" data-field="${i}"${ph} value="${val}" autocomplete="off" />`;
        }
        const labelHTML = field.label ? `<label class="meblip-form-label">${field.label}${req}</label>` : '';
        return `<div class="meblip-form-field">${labelHTML}${inputHTML}</div>`;
      }).join('');

      formHTML = `
        <div class="meblip-form">
          ${fieldsHTML}
          <div class="meblip-form-actions">
            <button class="meblip-action-btn meblip-form-cancel">${f.cancelLabel}</button>
            <button class="meblip-action-btn primary meblip-form-confirm">${f.confirmLabel}</button>
          </div>
        </div>`;
    }

    // Generar HTML de upload si existe _upload
    let uploadHTML = '';
    if (data._upload) {
      const u = data._upload;
      const hintParts = [];
      if (u.accept) hintParts.push(u.accept);
      if (u.maxSize) hintParts.push('Max ' + this._formatFileSize(u.maxSize));
      const hint = hintParts.length ? `<div class="meblip-upload-dropzone-hint">${hintParts.join(' &middot; ')}</div>` : '';

      uploadHTML = `
        <div class="meblip-upload">
          <div class="meblip-upload-dropzone">
            <div class="meblip-upload-dropzone-icon">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div class="meblip-upload-dropzone-text">${u.multiple ? 'Arrastra archivos o pulsa para seleccionar' : 'Arrastra un archivo o pulsa para seleccionar'}</div>
            ${hint}
            <input type="file" class="meblip-upload-file-input" style="display:none"${u.multiple ? ' multiple' : ''}${u.accept ? ` accept="${u.accept}"` : ''} />
          </div>
          <div class="meblip-upload-list"></div>
          <div class="meblip-upload-actions">
            <button class="meblip-action-btn meblip-upload-cancel">${u.cancelLabel}</button>
            <button class="meblip-action-btn primary meblip-upload-confirm" disabled>${u.confirmLabel}</button>
          </div>
        </div>`;
    }

    // Generar HTML de geolocalizacion si existe _geo
    let geoHTML = '';
    if (data._geo) {
      const g = data._geo;
      geoHTML = `
        <div class="meblip-geo">
          <div class="meblip-geo-actions">
            <button class="meblip-action-btn meblip-geo-cancel">${g.cancelLabel}</button>
          </div>
        </div>`;
    }

    // Generar HTML de mapa si existe _map
    let mapHTML = '';
    if (data._map) {
      const m = data._map;
      mapHTML = `
        <div class="meblip-map">
          <div class="meblip-map-preview" style="height:${m.mapHeight}px">
            <canvas class="meblip-map-canvas" width="${m.mapWidth}" height="${m.mapHeight}"></canvas>
            ${m.showMarker ? `<div class="meblip-map-marker"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg></div>` : ''}
          </div>
          ${m.markerLabel ? `<div class="meblip-map-label">${m.markerLabel}</div>` : ''}
          <div class="meblip-map-actions">
            <button class="meblip-action-btn meblip-map-cancel">${m.cancelLabel}</button>
          </div>
        </div>`;
    }

    // Actualizacion parcial: si el titulo no cambio, solo actualizar campos dinamicos
    if (this.content.classList.contains('is-active') && existingTitle === data.title) {
      const bar = this.content.querySelector('.meblip-progress-bar');
      if (bar) {
        bar.style.width = `${(data.progress || 0) * 100}%`;
        bar.setAttribute('aria-valuenow', Math.round((data.progress || 0) * 100));
      }
      const sub = this.content.querySelector('.meblip-subtitle');
      if (sub) sub.innerHTML = data.subtitle || '';

      const contentEl = this.content.querySelector('.meblip-custom-content');
      if (contentEl) {
        if (data.content) contentEl.innerHTML = data.content;
        else contentEl.remove();
      }

      const mediaContainer = this.content.querySelector('.meblip-header-media');
      if (mediaContainer && mediaContainer.innerHTML !== mediaHTML) {
        // Crossfade del icono para morphing suave entre tipos
        mediaContainer.style.transition = 'opacity 0.2s ease';
        mediaContainer.style.opacity = '0';
        setTimeout(() => {
          mediaContainer.innerHTML = mediaHTML;
          mediaContainer.style.opacity = '1';
        }, 200);
      }

      const actionsDiv = this.content.querySelector('.meblip-actions');
      if (actionsDiv) {
        actionsDiv.innerHTML = data.actions ? data.actions.map((act, i) => `<button class="meblip-action-btn ${act.type || ''}" data-index="${i}">${act.icon ? `<span class="meblip-btn-icon">${act.icon}</span>` : ''}${act.label}</button>`).join('') : '';
      } else if (actionsHTML) {
        this.content.insertAdjacentHTML('beforeend', actionsHTML);
      }
      this._measure(); return;
    }

    // Transicion completa: ocultar contenido actual, reemplazar y mostrar con animacion
    this.content.classList.remove('is-active');
    setTimeout(() => {
      if (this.isClosing || !this.content || data.id !== this.activeId) return;
      this.content.innerHTML = `
        <div class="meblip-header">
          <div class="meblip-header-media">${mediaHTML}</div>
          <div>
            <div class="meblip-title">${data.title || ''}</div>
            <div class="meblip-subtitle">${data.subtitle || ''}</div>
          </div>
          ${data.showCloseButton ? `<button class="meblip-close-btn" aria-label="Cerrar notificación"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>` : ''}
        </div>
        ${data.progress != null ? `
          <div class="meblip-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(data.progress * 100)}">
            <div class="meblip-progress-bar" style="width:0%"></div>
          </div>` : ""}
        ${data.content ? `<div class="meblip-custom-content">${data.content}</div>` : ''}
        ${data._verify ? verifyHTML : (data._form ? formHTML : (data._upload ? uploadHTML : (data._geo ? geoHTML : (data._map ? mapHTML : actionsHTML))))}
      `;
      this._measure();
      setTimeout(() => {
        if (this.isClosing || !this.content || data.id !== this.activeId) return;
        this.content.classList.add('is-active');
        // Animar preview icon hacia posicion del icono real (via CSS sibling selector), luego fade-out
        if (this.iconPreview && this.iconPreview.classList.contains('is-visible')) {
            if (this.iconPreview) {
              this.iconPreview.classList.remove('is-visible');
              if (this.iconPreview) this.iconPreview.innerHTML = '';
            }
        }
        const bar = this.content.querySelector('.meblip-progress-bar');
        if (bar) bar.style.width = `${(data.progress || 0) * 100}%`;
        // Callback onShow: se dispara una sola vez cuando la actividad se muestra por primera vez
        if (data.onShow && !data._onShowFired) {
          data._onShowFired = true;
          data.onShow({ id: data.id, type: data.type });
        }
        // Countdown visual: barra que se consume durante el duration
        this._updateCountdown(data);
        // Bind de eventos para verificacion, formulario o upload
        if (data._verify) this._bindVerifyInputs(data);
        if (data._form) this._bindFormInputs(data);
        if (data._upload) this._bindUploadInputs(data);
        if (data._geo) this._bindGeoInputs(data);
        if (data._map) this._bindMapInputs(data);
      }, 50);
    }, 150);
  }

  /**
   * Crea o actualiza la barra de countdown visual en la isla.
   * @param {Object} data - Datos de la actividad.
   * @private
   */
  _updateCountdown(data) {
    const existing = this.island?.querySelector('.meblip-countdown');
    if (existing) existing.remove();
    if (data.duration && data.showCountdown === true && this.island) {
      const el = document.createElement('div');
      el.className = 'meblip-countdown';
      this.island.appendChild(el);
      requestAnimationFrame(() => {
        el.style.animationDuration = `${data.duration}ms`;
        el.classList.add('is-running');
        if (this.isPaused) this.island.classList.add('is-paused');
      });
    }
  }

  /**
   * Vincula los eventos de los inputs de verificacion: auto-avance, backspace,
   * pegado, validacion y boton cancelar.
   * @param {Object} data - Datos de la actividad con _verify.
   * @private
   */
  _bindVerifyInputs(data) {
    if (!this.content) return;
    const inputs = this.content.querySelectorAll('.meblip-verify-input');
    const cancelBtn = this.content.querySelector('.meblip-verify-cancel');
    const v = data._verify;

    inputs.forEach((input, i) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length === 1 && i < inputs.length - 1) {
          inputs[i + 1].focus();
        }
        // Si es el ultimo input, validar (solo en modo verify)
        if (i === inputs.length - 1 && val.length === 1 && v.mode !== 'input') {
          const entered = Array.from(inputs).map(inp => inp.value).join('');
          const code = v.caseSensitive ? v.code : v.code.toUpperCase();
          const check = v.caseSensitive ? entered : entered.toUpperCase();
          if (check === code) {
            inputs.forEach(inp => inp.classList.add('is-success'));
            setTimeout(() => data._verifyResolve(), 400);
          } else {
            inputs.forEach(inp => { inp.classList.add('is-error'); inp.value = ''; });
            setTimeout(() => {
              inputs.forEach(inp => inp.classList.remove('is-error'));
              inputs[0].focus();
            }, 500);
            if (data._verifyFail) data._verifyFail();
          }
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && i > 0) {
          inputs[i - 1].focus();
        }
      });

      // Pegar codigo completo
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').trim();
        for (let j = 0; j < Math.min(paste.length, inputs.length); j++) {
          inputs[j].value = paste[j];
        }
        const last = Math.min(paste.length, inputs.length) - 1;
        inputs[last].focus();
        inputs[last].dispatchEvent(new Event('input'));
      });
    });

    // Confirmar codigo (solo modo input): boton + Enter
    const confirmBtn = this.content.querySelector('.meblip-verify-confirm');
    if (confirmBtn) {
      const submitCode = () => {
        const entered = Array.from(inputs).map(inp => inp.value).join('');
        if (entered.length < inputs.length) {
          inputs.forEach(inp => { if (!inp.value) inp.classList.add('is-error'); });
          setTimeout(() => inputs.forEach(inp => inp.classList.remove('is-error')), 500);
          return;
        }
        inputs.forEach(inp => inp.classList.add('is-success'));
        setTimeout(() => data._verifyResolve(entered), 400);
      };
      confirmBtn.addEventListener('click', submitCode);
      inputs.forEach(inp => {
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') submitCode();
        });
      });
    }

    // Focus inmediato para móviles (dentro del callstack del tap)
    inputs[0]?.focus();

    // Esperar a que la isla termine de expandirse antes de mostrar inputs y dar foco
    const verifyEl = this.content.querySelector('.meblip-verify');
    const waitForSpring = () => {
      if (Math.abs(this.width - this.targetWidth) < 1 && Math.abs(this.height - this.targetHeight) < 1) {
        if (verifyEl) verifyEl.classList.add('is-ready');
        inputs[0]?.focus();
      } else {
        requestAnimationFrame(waitForSpring);
      }
    };
    requestAnimationFrame(waitForSpring);

    // Boton cancelar
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.remove(data.id);
      });
    }
  }

  /**
   * Vincula eventos del formulario: validacion, submit con Enter, boton confirmar/cancelar.
   * @param {Object} data - Datos de la actividad con _form.
   * @private
   */
  _bindFormInputs(data) {
    if (!this.content) return;
    const f = data._form;
    const formEl = this.content.querySelector('.meblip-form');
    const confirmBtn = this.content.querySelector('.meblip-form-confirm');
    const cancelBtn = this.content.querySelector('.meblip-form-cancel');
    const allInputs = this.content.querySelectorAll('.meblip-form-input, .meblip-form-select, .meblip-form-textarea');

    const submitForm = () => {
      const formData = {};
      let valid = true;
      f.fields.forEach((field, i) => {
        const el = this.content.querySelector(`[data-field="${i}"]`);
        if (!el) return;
        const val = el.value.trim();
        const key = field.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `field_${i}`;
        formData[key] = val;
        if (field.required && !val) {
          valid = false;
          el.classList.add('is-error');
          setTimeout(() => el.classList.remove('is-error'), 500);
        }
      });
      if (!valid) return;
      allInputs.forEach(inp => inp.style.borderColor = 'var(--meblip-color-success)');
      setTimeout(() => data._formResolve(formData), 400);
    };

    if (confirmBtn) confirmBtn.addEventListener('click', submitForm);

    allInputs.forEach(el => {
      if (el.tagName !== 'TEXTAREA') {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); submitForm(); }
        });
      }
      if (el.tagName === 'SELECT') {
        el.addEventListener('change', () => {
          el.classList.toggle('is-placeholder', !el.value);
        });
      }
    });

    // Focus inmediato para móviles (dentro del callstack del tap)
    allInputs[0]?.focus();

    // Esperar a que la isla termine de expandirse antes de mostrar campos y dar foco
    const waitForSpring = () => {
      if (Math.abs(this.width - this.targetWidth) < 1 && Math.abs(this.height - this.targetHeight) < 1) {
        if (formEl) formEl.classList.add('is-ready');
        allInputs[0]?.focus();
      } else {
        requestAnimationFrame(waitForSpring);
      }
    };
    requestAnimationFrame(waitForSpring);

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.remove(data.id));
    }
  }

  /**
   * Vincula eventos de la zona de upload: drag & drop, selector de ficheros,
   * lista de previsualizacion, validacion, boton confirmar/cancelar.
   * @param {Object} data - Datos de la actividad con _upload.
   * @private
   */
  _bindUploadInputs(data) {
    if (!this.content) return;
    const u = data._upload;
    const uploadEl = this.content.querySelector('.meblip-upload');
    const dropzone = this.content.querySelector('.meblip-upload-dropzone');
    const fileInput = this.content.querySelector('.meblip-upload-file-input');
    const listEl = this.content.querySelector('.meblip-upload-list');
    const confirmBtn = this.content.querySelector('.meblip-upload-confirm');
    const cancelBtn = this.content.querySelector('.meblip-upload-cancel');

    let files = [];

    const renderList = () => {
      listEl.innerHTML = files.map((f, i) => `
        <div class="meblip-upload-item">
          <div class="meblip-upload-item-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <span class="meblip-upload-item-name">${f.name}</span>
          <span class="meblip-upload-item-size">${this._formatFileSize(f.size)}</span>
          <button class="meblip-upload-item-remove" data-index="${i}"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
      `).join('');

      listEl.querySelectorAll('.meblip-upload-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          files.splice(parseInt(btn.dataset.index), 1);
          renderList();
        });
      });

      confirmBtn.disabled = files.length === 0;
      this._measure();
    };

    const validateAndAdd = (newFiles) => {
      const arr = Array.from(newFiles);
      let hasError = false;

      for (const f of arr) {
        if (u.maxSize && f.size > u.maxSize) { hasError = true; continue; }
        if (u.accept && !this._matchAccept(f, u.accept)) { hasError = true; continue; }
        files.push(f);
      }

      if (!u.multiple && files.length > 1) {
        files = [files[files.length - 1]];
      }

      if (hasError) {
        dropzone.classList.add('is-error');
        setTimeout(() => dropzone.classList.remove('is-error'), 500);
      }

      renderList();
    };

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) validateAndAdd(fileInput.files);
      fileInput.value = '';
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('is-dragover');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      if (e.dataTransfer.files.length) validateAndAdd(e.dataTransfer.files);
    });

    confirmBtn.addEventListener('click', () => {
      if (files.length === 0) return;
      data._uploadResolve(files);
    });

    const waitForSpring = () => {
      if (Math.abs(this.width - this.targetWidth) < 1 && Math.abs(this.height - this.targetHeight) < 1) {
        if (uploadEl) uploadEl.classList.add('is-ready');
      } else {
        requestAnimationFrame(waitForSpring);
      }
    };
    requestAnimationFrame(waitForSpring);

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.remove(data.id));
    }
  }

  /**
   * Vincula eventos de la notificacion de geolocalizacion: obtener posicion
   * y resolver promesa, o manejar error y cerrar. Boton cancelar.
   * @param {Object} data - Datos de la actividad con _geo.
   * @private
   */
  _bindGeoInputs(data) {
    if (!this.content) return;
    const g = data._geo;
    const geoEl = this.content.querySelector('.meblip-geo');
    const cancelBtn = this.content.querySelector('.meblip-geo-cancel');

    let watchId = null;

    const geoOptions = {};
    if (g.highAccuracy) geoOptions.enableHighAccuracy = true;
    if (g.timeout !== undefined) geoOptions.timeout = g.timeout;
    if (g.maximumAge !== undefined) geoOptions.maximumAge = g.maximumAge;

    const onSuccess = (pos) => {
      if (!this.activities.find(a => a.id === data.id)) return;
      const c = pos.coords;
      const position = {
        latitude: c.latitude,
        longitude: c.longitude,
        accuracy: c.accuracy,
        altitude: c.altitude,
        altitudeAccuracy: c.altitudeAccuracy,
        heading: c.heading,
        speed: c.speed
      };

      if (g.duration) {
        this.update(data.id, { type: 'success', icon: 'location' });
        setTimeout(() => {
          if (data._geoResolve) data._geoResolve(position);
        }, g.duration);
      } else {
        if (data._geoResolve) data._geoResolve(position);
      }
    };

    const onError = (err) => {
      if (!this.activities.find(a => a.id === data.id)) return;
      const errorMsg = err.message || 'Error al obtener la ubicacion';

      if (g.duration) {
        if (data._geoError) data._geoError(errorMsg);
        this.update(data.id, { type: 'error', icon: 'location' });
        setTimeout(() => {
          if (this.activities.find(a => a.id === data.id)) {
            this.remove(data.id);
          }
        }, g.duration);
      } else {
        if (data._geoError) data._geoError(errorMsg);
        this.remove(data.id);
      }
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
    } else {
      onError({ message: 'Geolocalizacion no soportada por el navegador' });
    }

    // Esperar a que la isla termine de expandirse
    const waitForSpring = () => {
      if (Math.abs(this.width - this.targetWidth) < 1 && Math.abs(this.height - this.targetHeight) < 1) {
        if (geoEl) geoEl.classList.add('is-ready');
      } else {
        requestAnimationFrame(waitForSpring);
      }
    };
    requestAnimationFrame(waitForSpring);

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (watchId !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(watchId);
        }
        this.remove(data.id);
      });
    }
  }

  /**
   * Vincula eventos de la previsualizacion de mapa: carga de tiles en canvas,
   * marcador y boton cerrar.
   * @param {Object} data - Datos de la actividad con _map.
   * @private
   */
  _bindMapInputs(data) {
    if (!this.content) return;
    const m = data._map;
    const mapEl = this.content.querySelector('.meblip-map');
    const canvas = this.content.querySelector('.meblip-map-canvas');
    const cancelBtn = this.content.querySelector('.meblip-map-cancel');

    if (canvas) {
      const ctx = canvas.getContext('2d');

      // Ajustar mapWidth al ancho real del island si es mayor
      const contentPadding = 32;
      const effectiveWidth = Math.max(m.mapWidth, (this.targetWidth || m.mapWidth) - contentPadding);
      canvas.width = effectiveWidth;

      const tileSize = 256;
      const tile = this._latLngToTile(m.lat, m.lng, m.zoom);

      // Calcular cuantos tiles necesitamos para cubrir el canvas
      const tilesX = Math.ceil(effectiveWidth / tileSize) + 1;
      const tilesY = Math.ceil(m.mapHeight / tileSize) + 1;
      const offsetX = Math.round(tile.fracX * tileSize - effectiveWidth / 2);
      const offsetY = Math.round(tile.fracY * tileSize - m.mapHeight / 2);

      // Rango de tiles a cargar
      const startTX = Math.floor(offsetX / tileSize);
      const startTY = Math.floor(offsetY / tileSize);

      let loaded = 0;
      const totalTiles = tilesX * tilesY;

      for (let tx = startTX; tx < startTX + tilesX; tx++) {
        for (let ty = startTY; ty < startTY + tilesY; ty++) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          const tileX = tile.x + tx;
          const tileY = tile.y + ty;
          const url = m.tileUrl.replace('{z}', m.zoom).replace('{x}', tileX).replace('{y}', tileY);
          img.onload = () => {
            const dx = tx * tileSize - offsetX;
            const dy = ty * tileSize - offsetY;
            ctx.drawImage(img, dx, dy, tileSize, tileSize);
            loaded++;
            if (loaded >= totalTiles) this._measure();
          };
          img.onerror = () => {
            loaded++;
            if (loaded >= totalTiles) this._measure();
          };
          img.src = url;
        }
      }
    }

    // Esperar a que la isla termine de expandirse
    const waitForSpring = () => {
      if (Math.abs(this.width - this.targetWidth) < 1 && Math.abs(this.height - this.targetHeight) < 1) {
        if (mapEl) mapEl.classList.add('is-ready');
      } else {
        requestAnimationFrame(waitForSpring);
      }
    };
    requestAnimationFrame(waitForSpring);

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.remove(data.id));
    }
  }

  /**
   * Mide las dimensiones naturales del contenido usando un nodo clon invisible.
   * Calcula el tamano objetivo (targetWidth/targetHeight) al que la isla
   * debe animar, respetando los limites minimo y maximo.
   *
   * @private
   */
  _measure() {
    if (!this.content) return;
    const active = this.activities.find(a => a.id === this.activeId);
    const widthMode = active?.islandWidth || this.islandWidth;
    const resolved = this._resolveWidth(widthMode);
    const ghost = this.content.cloneNode(true);
    ghost.classList.add('is-active');
    const verifyGhost = ghost.querySelector('.meblip-verify');
    if (verifyGhost) verifyGhost.classList.add('is-ready');
    const formGhost = ghost.querySelector('.meblip-form');
    if (formGhost) formGhost.classList.add('is-ready');
    const uploadGhost = ghost.querySelector('.meblip-upload');
    if (uploadGhost) uploadGhost.classList.add('is-ready');
    const geoGhost = ghost.querySelector('.meblip-geo');
    if (geoGhost) geoGhost.classList.add('is-ready');
    const mapGhost = ghost.querySelector('.meblip-map');
    if (mapGhost) mapGhost.classList.add('is-ready');
    if (resolved !== null) {
      ghost.style.cssText = `position:absolute;visibility:hidden;display:block;width:${resolved}px;`;
      document.body.appendChild(ghost);
      const rect = ghost.getBoundingClientRect();
      this.targetWidth = resolved;
      this.targetHeight = Math.max(this.minHeight, Math.ceil(rect.height));
    } else {
      ghost.style.cssText = "position:absolute;visibility:hidden;display:inline-block;width:max-content;";
      document.body.appendChild(ghost);
      const rect = ghost.getBoundingClientRect();
      this.targetWidth = Math.max(this.minWidth, Math.min(Math.ceil(rect.width) + 2, this.maxWidth));
      this.targetHeight = Math.max(this.minHeight, Math.ceil(rect.height));
    }
    ghost.remove();
  }

  /**
   * Resuelve un valor de islandWidth a pixeles.
   * @param {string} val - 'compact', 'normal', 'wide' o valor CSS.
   * @returns {number|null} Pixeles resueltos, o null para modo compact.
   * @private
   */
  _resolveWidth(val) {
    if (val === 'compact') return null;
    if (val === 'normal') return Math.min(400, window.innerWidth - 32);
    if (val === 'wide') return window.innerWidth - 32;
    const tmp = document.createElement('div');
    tmp.style.cssText = `position:absolute;visibility:hidden;width:${val};`;
    document.body.appendChild(tmp);
    const w = tmp.getBoundingClientRect().width;
    tmp.remove();
    return Math.max(this.minWidth, w);
  }

  /**
   * Comprueba si la isla esta en su tamano minimo (forma circular colapsada).
   *
   * @returns {boolean} True si el ancho y alto estan en el minimo (con tolerancia de 1px).
   */
  isAtMinSize() { return Math.abs(this.width - this.minWidth) < 1 && Math.abs(this.height - this.minHeight) < 1; }

  /**
   * Inicia la secuencia de cierre de la isla:
   * oculta el contenido, colapsa la isla a su tamano minimo
   * y limpia el overlay bloqueante.
   *
   * @private
   */
  _closeIsland(exitAnimation) {
    clearTimeout(this._contentTimer);
    clearTimeout(this._iconPreviewTimer);
    if (this.iconPreview) {
      this.iconPreview.classList.remove('is-visible');
      this.iconPreview.innerHTML = '';
    }
    this.isClosing = true;
    if (this.content) this.content.classList.remove('is-active');
    const countdown = this.island?.querySelector('.meblip-countdown');
    if (countdown) countdown.remove();
    if (this.island) {
      this.island.setAttribute('tabindex', '-1');
      // Detener animaciones infinitas y limpiar clases de entrada/salida
      this.island.classList.remove('anim-breathe', 'entry-slide-spring-left', 'entry-slide-spring-right', 'entry-slide-spring-down', ...this.allExitClasses);
      this.island.style.transform = '';
      this.island.style.opacity = '';
      if (!this.closeAnimation) this.island.classList.add('is-closing-fade');

      if (exitAnimation && exitAnimation !== 'none') {
        void this.island.offsetWidth;
        this.island.classList.add(`exit-${exitAnimation}`);
        const dur = exitAnimation === 'shrink-bounce' ? this._delay(400) : this._delay(300);
        setTimeout(() => {
          if (this.isClosing && this.island) {
            this.island.classList.remove(...this.allExitClasses);
            this.targetWidth = this.minWidth; this.targetHeight = this.minHeight;
          }
        }, dur);
      } else {
        setTimeout(() => { if (this.isClosing) { this.targetWidth = this.minWidth; this.targetHeight = this.minHeight; } }, this._delay(200));
      }
    }
    // Limpiar className custom
    if (this._currentClassName) {
      if (this.root) this.root.classList.remove(this._currentClassName);
      if (this.overlay) this.overlay.classList.remove(this._currentClassName);
      this._currentClassName = null;
    }

    this.stackCount = 0;
  }

  /**
   * Genera una explosion de particulas tipo confetti sobre la isla.
   * Canvas temporal con fisica simple (gravedad, friccion, fade).
   * @private
   */
  _spawnConfetti() {
    if (!this.island) return;
    const rect = this.island.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width + 100;
    canvas.height = rect.height + 140;
    canvas.style.cssText = `position:fixed;left:${rect.left - 50}px;top:${rect.top - 30}px;pointer-events:none;z-index:10000;`;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#ec4899','#06b6d4','#facc15'];
    const particles = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 40,
        y: canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 7 - 2,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.opacity <= 0) continue;
        alive = true;
        p.vy += 0.15;
        p.vx *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= 0.014;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(animate);
      else canvas.remove();
    };
    animate();
    setTimeout(() => { cancelAnimationFrame(frame); if (canvas.parentNode) canvas.remove(); }, 2500);
  }

  // ──────────────────────────────────────────────
  //  MOTOR DE ANIMACION (SPRING PHYSICS)
  // ──────────────────────────────────────────────

  /**
   * Arranca el bucle principal de animacion con requestAnimationFrame.
   *
   * En cada frame:
   * 1. Calcula la posicion del muelle (spring) para ancho y alto hacia las dimensiones objetivo.
   *    Primero anima el ancho; cuando converge, anima el alto (efecto secuencial suave).
   * 2. Si la isla se esta cerrando y llega al tamano minimo, la oculta completamente.
   * 3. Actualiza las dimensiones del elemento DOM y del SVG de forma.
   * 4. Calcula el radio de borde dinamico: circular cuando esta colapsada, redondeado cuando esta expandida.
   * 5. Posiciona y escala las capas de stack segun el numero de actividades en cola.
   *
   * @private
   */
  _startLoop() {
    /**
     * Calcula un paso de simulacion de muelle (spring).
     * Aplica fuerza de rigidez (stiffness) y amortiguacion (damping).
     *
     * @param {number} cur - Valor actual.
     * @param {number} tar - Valor objetivo.
     * @param {number} vel - Velocidad actual.
     * @param {Object} cfg - Configuracion del muelle {stiffness, damping, mass, dt}.
     * @returns {{v: number, vel: number}} Nuevo valor y nueva velocidad.
     */
    const spring = (cur, tar, vel, cfg) => {
      const f = -cfg.stiffness * (cur - tar); const d = -cfg.damping * vel; const a = (f + d) / cfg.mass;
      vel += a * cfg.dt; cur += vel * cfg.dt;
      return { v: cur, vel };
    };

    const loop = () => {
      if (!this.island || !this.svg) return;

      // Animar dimensiones con spring: primero ancho, luego alto
      if (this._reducedMotionActive) {
        this.width = this.targetWidth;
        this.height = this.targetHeight;
        this.vw = 0; this.vh = 0;
      } else if (Math.abs(this.width - this.targetWidth) > 0.1 || Math.abs(this.height - this.targetHeight) > 0.1) {
        if (Math.abs(this.width - this.targetWidth) > 0.5) {
          const res = spring(this.width, this.targetWidth, this.vw, this.springCfg);
          this.width = res.v; this.vw = res.vel;
        } else {
          const res = spring(this.height, this.targetHeight, this.vh, this.springCfg);
          this.height = res.v; this.vh = res.vel;
        }
      }

      // Completar cierre cuando la isla llega al tamano minimo
      if (this.isClosing && this.isAtMinSize()) {
          this.isClosing = false; this.isVisible = false;
          this.island.classList.remove('is-visible');
          if (!this.closeAnimation) this.island.classList.remove('is-closing-fade');
          if (this.overlay) {
            this.overlay.classList.remove('is-active');
            this._setPageInert(false);
          }
          // Limpiar className custom (fallback)
          if (this._currentClassName) {
            if (this.root) this.root.classList.remove(this._currentClassName);
            if (this.overlay) this.overlay.classList.remove(this._currentClassName);
            this._currentClassName = null;
          }
      }

      // Aplicar dimensiones al DOM
      this.island.style.width = `${this.width}px`; this.island.style.height = `${this.height}px`;
      this.svg.setAttribute("width", this.width); this.svg.setAttribute("height", this.height);

      // Radio de borde dinamico: circular (minimo) o redondeado (expandido)
      const r = this.isAtMinSize() ? this.height / 2 : Math.min(22, this.height * 0.4);
      this.path.setAttribute("d", `M ${r},0 H ${this.width-r} Q ${this.width},0 ${this.width},${r} V ${this.height-r} Q ${this.width},${this.height} ${this.width-r},${this.height} H ${r} Q 0,${this.height} 0,${this.height-r} V ${r} Q 0,0 ${r},0 Z`);
      this.island.style.borderRadius = `${r}px`;

      this.stackLayers.forEach((layer, i) => {
        if (i < this.stackCount && this.isVisible && !this.isClosing && this.stackStyle !== 'counter') {
          let transform = "";
          if (this.stackStyle === '3d') {
            const sc = 1 - (i + 1) * 0.05;
            transform = `translateX(-50%) translateY(${(i + 1) * 6}px) scaleX(${sc})`;
          } else if (this.stackStyle === 'fan') {
            const offY = (i + 1) * 4; const offX = (i + 1) * 8; const rot = (i + 1) * 5;
            transform = `translateX(calc(-50% + ${offX}px)) translateY(${offY}px) rotate(${rot}deg)`;
          }
          layer.style.opacity = (0.6 / (i + 1)).toString();
          layer.style.width = `${this.width}px`; layer.style.height = `${this.height}px`;
          layer.style.borderRadius = `${r}px`; layer.style.transform = transform;
        } else layer.style.opacity = "0";
      });

      requestAnimationFrame(loop);
    };
    loop();
  }
}

// Module exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = meBlip;
}
