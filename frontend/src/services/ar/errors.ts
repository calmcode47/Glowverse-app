/* AR SDK Error Types and Classes */
export enum ARErrorCode {
  NOT_INITIALIZED = 'AR_NOT_INITIALIZED',
  LICENSE_INVALID = 'AR_LICENSE_INVALID',
  CAMERA_PERMISSION_DENIED = 'AR_CAMERA_DENIED',
  FACE_NOT_DETECTED = 'AR_NO_FACE',
  SDK_ERROR = 'AR_SDK_ERROR',
  PLATFORM_NOT_SUPPORTED = 'AR_PLATFORM_ERROR'
}

export class ARSDKError extends Error {
  code: ARErrorCode;
  nativeError?: any;
  constructor(code: ARErrorCode, message: string, nativeError?: any) {
    super(message);
    this.code = code;
    this.nativeError = nativeError;
    Object.setPrototypeOf(this, ARSDKError.prototype);
  }
}

export function toARSDKError(err: any, fallbackCode: ARErrorCode = ARErrorCode.SDK_ERROR): ARSDKError {
  if (err instanceof ARSDKError) return err;
  const code: ARErrorCode = (err?.code as ARErrorCode) || fallbackCode;
  const message: string = err?.message || 'AR SDK error';
  return new ARSDKError(code, message, err);
}

