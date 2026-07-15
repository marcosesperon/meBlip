type Position = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type Theme = 'dark' | 'light' | 'system';
type StackStyle = '3d' | 'fan' | 'counter';
type IslandWidth = 'compact' | 'normal' | 'wide' | string;
type ReducedMotion = boolean | 'system';
type Priority = 'low' | 'normal' | 'high';
type ActivityType = 'success' | 'error' | 'info' | 'warning' | 'upload' | 'download' | 'loading' | 'thinking' | 'speaking' | 'listening' | string;
type Animation = 'shake' | 'pulse' | 'bounce' | 'glow' | 'breathe' | 'heartbeat' | 'wobble' | 'ripple' | 'swing';
type ExitAnimation = 'fade' | 'slide-down' | 'slide-up' | 'shrink-bounce';

interface OverlayStyle {
  /** Desenfoque en px. */
  blur?: number;
  /** Contraste (0-1, donde 1 es normal). */
  contrast?: number;
  /** Escala de grises (0-1, donde 0 es normal). */
  grayscale?: number;
}

interface MeBlipOptions {
  position?: Position;
  theme?: Theme;
  stackStyle?: StackStyle;
  islandWidth?: IslandWidth;
  autoConfetti?: boolean;
  reducedMotion?: ReducedMotion;
  closeAnimation?: boolean;
  typeColors?: Partial<Record<ActivityType, string>>;
  icons?: Record<string, string>;
  overlayStyle?: OverlayStyle;
}

interface ActionConfig {
  label: string;
  type?: 'primary' | 'secondary' | 'danger' | 'dismiss';
  icon?: string;
  onClick?: (ctx: { activityId: string }) => void;
}

interface ActivityConfig {
  id?: string;
  type?: ActivityType;
  icon?: string;
  title?: string;
  subtitle?: string;
  duration?: number;
  priority?: Priority;
  progress?: number;
  /** Muestra el anillo de countdown circular que se completa durante el duration (rodea al boton X, o como elemento visual si no hay boton). Activo por defecto si hay duration; pasa false para ocultarlo. */
  showCountdown?: boolean;
  /** Muestra el boton X para cerrar. Visible por defecto en add() (pasa false para ocultarlo). En los metodos especiales (addUndo/addVerify/addForm/prompt/promptScanner/addUpload/addGeolocation/addMap) esta oculto por defecto salvo que pases true. */
  showCloseButton?: boolean;
  animation?: Animation;
  exitAnimation?: ExitAnimation;
  enableAnimations?: boolean;
  groupId?: string;
  groupTitle?: string;
  groupCount?: number;
  blocking?: boolean;
  className?: string;
  actions?: ActionConfig[];
  waitToDisplay?: boolean;
  restoreFocus?: boolean;
  focusOnClose?: Element | string | (() => Element | null);
  onShow?: (ctx: { id: string; type?: string }) => void;
  onHide?: (ctx: { id: string; type?: string; reason: CloseReason }) => void;
}

/** Origen del cierre de una notificacion: accion del usuario, expiracion del duration o cierre por codigo. */
type CloseReason = 'user' | 'timeout' | 'programmatic';

interface RemoveOptions {
  /** Element (o selector CSS, o funcion que devuelve un Element) que recibira el foco al cerrar, en lugar del valor previo de la actividad. */
  focusOnClose?: Element | string | (() => Element | null);
  /** Si es false, no restaura el foco al cerrar (anula el valor previo de la actividad para esta llamada). */
  restoreFocus?: boolean;
  /** Origen del cierre que se propaga a onHide y a la promesa. Por defecto 'programmatic'. */
  reason?: CloseReason;
}

interface ActivityPromise extends Promise<{ id: string; status: string; reason: CloseReason }> {
  id: string;
  remove(): void;
}

interface UndoConfig extends ActivityConfig {
  undoLabel?: string;
  undoDuration?: number;
  undoIcon?: string;
  onUndo?: () => void;
  onConfirm?: () => void;
}

interface VerifyConfig extends ActivityConfig {
  mode?: 'verify' | 'input';
  code?: string;
  codeLength?: number;
  codeType?: 'numeric' | 'alphanumeric';
  caseSensitive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onVerify?: () => void;
  onSubmit?: (code: string) => void;
  onFail?: () => void;
  onCancel?: () => void;
}

interface FormField {
  type: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'date' | 'select' | 'textarea';
  label: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  options?: (string | [string, string])[];
  rows?: number;
}

interface FormConfig extends ActivityConfig {
  fields: FormField[];
  confirmLabel?: string;
  cancelLabel?: string;
  onSubmit?: (data: Record<string, string>) => void;
  onCancel?: () => void;
}

interface PromptConfig extends ActivityConfig {
  placeholder?: string;
  required?: boolean;
  value?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

interface UploadConfig extends ActivityConfig {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  onSubmit?: (files: File[]) => void;
  onCancel?: () => void;
}

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

interface GeolocationConfig extends ActivityConfig {
  highAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  duration?: number;
  cancelLabel?: string;
  onCancel?: () => void;
}

interface PromisePhaseConfig {
  title?: string;
  subtitle?: string;
  icon?: string;
  type?: ActivityType;
  duration?: number;
  [key: string]: any;
}

interface PromiseConfig extends ActivityConfig {
  loading?: PromisePhaseConfig;
  success?: PromisePhaseConfig | ((data: any) => PromisePhaseConfig);
  error?: PromisePhaseConfig | ((error: any) => PromisePhaseConfig);
}

interface MapConfig extends ActivityConfig {
  lat: number;
  lng: number;
  zoom?: number;
  mapWidth?: number;
  mapHeight?: number;
  tileUrl?: string;
  markerLabel?: string;
  showMarker?: boolean;
  cancelLabel?: string;
  actions?: ActionConfig[];
  onCancel?: () => void;
}

declare class meBlip {
  constructor(options?: MeBlipOptions);

  /** Set the visual theme */
  setTheme(theme: Theme): void;

  /** Set the island position on screen */
  setPosition(pos: Position): void;

  /** Set the stack style for queued notifications */
  setStackStyle(style: StackStyle): void;

  /** Set the default island width */
  setIslandWidth(width: IslandWidth): void;

  /** Set reduced motion mode */
  setReducedMotion(value: ReducedMotion): void;

  /** Set the overlay backdrop-filter style */
  setOverlayStyle(style: OverlayStyle): void;

  /** Add a notification to the queue */
  add(config: ActivityConfig): ActivityPromise;

  /** Update an existing notification */
  update(id: string, patch: Partial<ActivityConfig>): ActivityPromise | undefined;
  update(patch: Partial<ActivityConfig>): ActivityPromise | undefined;

  /** Check if a notification exists in the queue by ID */
  has(id: string): boolean;

  /** Remove a notification by ID (or the active one), optionally overriding focus behavior at close */
  remove(id?: string, options?: RemoveOptions): void;
  remove(options: RemoveOptions): void;

  /** Remove all notifications belonging to a group */
  removeGroup(groupId: string): void;

  /** Add an undo-pattern notification */
  addUndo(config: UndoConfig): Promise<{ id: string; status: 'undone' | 'confirmed' }>;

  /** Add a verification code notification */
  addVerify(config: VerifyConfig): Promise<{ id: string; status: 'verified' | 'submitted' | 'cancelled'; code: string | null }>;

  /** Add a form notification */
  addForm(config: FormConfig): Promise<{ id: string; status: 'submitted' | 'cancelled'; data: Record<string, string> | null }>;

  /** Show a prompt notification (shortcut for addForm with a single text field) */
  prompt(config?: PromptConfig): Promise<string | null>;

  /** Add a file upload notification */
  addUpload(config: UploadConfig): Promise<{ id: string; status: 'submitted' | 'cancelled'; files: File[] | null }>;

  /** Add a geolocation notification */
  addGeolocation(config: GeolocationConfig): Promise<{ id: string; status: 'located' | 'cancelled' | 'error'; position: GeolocationPosition | null; error: string | null }>;

  /** Add a static map preview notification */
  addMap(config: MapConfig): Promise<{ id: string; status: 'closed' | 'cancelled' }>;

  /** Promise pattern: show loading while a promise is pending, then transition to success or error */
  promise<T = any>(userPromise: Promise<T>, config?: PromiseConfig): Promise<{ id: string; status: 'resolved' | 'rejected'; data?: T; error?: any }>;

  /** Launch confetti animation */
  confetti(): void;
}

export default meBlip;
export { meBlip };
export type {
  MeBlipOptions,
  OverlayStyle,
  ActivityConfig,
  ActivityPromise,
  RemoveOptions,
  ActionConfig,
  UndoConfig,
  VerifyConfig,
  FormField,
  FormConfig,
  PromptConfig,
  UploadConfig,
  GeolocationConfig,
  GeolocationPosition,
  MapConfig,
  PromisePhaseConfig,
  PromiseConfig,
  Position,
  Theme,
  StackStyle,
  IslandWidth,
  Priority,
  ActivityType,
  Animation,
  ExitAnimation,
  ReducedMotion,
};

// React hook
declare function useBlip(options?: MeBlipOptions): meBlip | null;
export { useBlip };

declare module 'meblip' {
  export default meBlip;
  export { meBlip };
}

declare module 'meblip/react' {
  export function useBlip(options?: MeBlipOptions): meBlip | null;
  export { meBlip };
  export default useBlip;
}
