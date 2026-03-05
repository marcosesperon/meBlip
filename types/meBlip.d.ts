type Position = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type Theme = 'dark' | 'light' | 'system';
type StackStyle = '3d' | 'fan' | 'counter';
type IslandWidth = 'compact' | 'normal' | 'wide' | string;
type ReducedMotion = boolean | 'system';
type Priority = 'low' | 'normal' | 'high';
type ActivityType = 'success' | 'error' | 'info' | 'warning' | 'upload' | 'download' | 'loading' | 'thinking' | 'speaking' | 'listening' | string;
type Animation = 'shake' | 'pulse' | 'bounce' | 'glow' | 'breathe' | 'heartbeat' | 'wobble' | 'ripple' | 'swing';
type ExitAnimation = 'fade' | 'slide-down' | 'slide-up' | 'shrink-bounce';

interface MeBlipOptions {
  position?: Position;
  theme?: Theme;
  stackStyle?: StackStyle;
  islandWidth?: IslandWidth;
  autoConfetti?: boolean;
  reducedMotion?: ReducedMotion;
  typeColors?: Partial<Record<ActivityType, string>>;
  icons?: Record<string, string>;
}

interface ActionConfig {
  label: string;
  type?: 'primary' | 'secondary' | 'danger';
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
  showCountdown?: boolean;
  animation?: Animation;
  exitAnimation?: ExitAnimation;
  enableAnimations?: boolean;
  groupId?: string;
  groupTitle?: string;
  groupCount?: number;
  blocking?: boolean;
  actions?: ActionConfig[];
  waitToDisplay?: boolean;
  onShow?: (ctx: { id: string; type?: string }) => void;
  onHide?: (ctx: { id: string; type?: string }) => void;
}

interface ActivityPromise extends Promise<{ id: string; status: string }> {
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

interface UploadConfig extends ActivityConfig {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  onSubmit?: (files: File[]) => void;
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

  /** Add a notification to the queue */
  add(config: ActivityConfig): ActivityPromise;

  /** Update an existing notification */
  update(id: string, patch: Partial<ActivityConfig>): void;
  update(patch: Partial<ActivityConfig>): void;

  /** Check if a notification exists in the queue by ID */
  has(id: string): boolean;

  /** Remove a notification by ID (or the active one) */
  remove(id?: string): void;

  /** Add an undo-pattern notification */
  addUndo(config: UndoConfig): Promise<{ id: string; status: 'undone' | 'confirmed' }>;

  /** Add a verification code notification */
  addVerify(config: VerifyConfig): Promise<{ id: string; status: 'verified' | 'submitted' | 'cancelled'; code: string | null }>;

  /** Add a form notification */
  addForm(config: FormConfig): Promise<{ id: string; status: 'submitted' | 'cancelled'; data: Record<string, string> | null }>;

  /** Add a file upload notification */
  addUpload(config: UploadConfig): Promise<{ id: string; status: 'submitted' | 'cancelled'; files: File[] | null }>;

  /** Launch confetti animation */
  confetti(): void;
}

export default meBlip;
export { meBlip };
export type {
  MeBlipOptions,
  ActivityConfig,
  ActivityPromise,
  ActionConfig,
  UndoConfig,
  VerifyConfig,
  FormField,
  FormConfig,
  UploadConfig,
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
