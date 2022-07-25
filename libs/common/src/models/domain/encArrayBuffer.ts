import { EncryptionType } from "@bitwarden/common/enums/encryptionType";
import { IEncrypted } from "@bitwarden/common/interfaces/IEncrypted";

const ENC_TYPE_LENGTH = 1;
const IV_LENGTH = 16;
const MAC_LENGTH = 32;
const MIN_DATA_LENGTH = 1;

const decryptionError =
  "Error parsing encrypted ArrayBuffer: data is corrupted or has an invalid format.";

export class EncArrayBuffer implements IEncrypted {
  readonly encryptionType: EncryptionType = null;
  readonly dataBytes: ArrayBuffer = null;
  readonly ivBytes: ArrayBuffer = null;
  readonly macBytes: ArrayBuffer = null;

  constructor(readonly buffer: ArrayBuffer) {
    const encBytes = new Uint8Array(buffer);
    const encType = encBytes[0];

    switch (encType) {
      case EncryptionType.AesCbc128_HmacSha256_B64:
      case EncryptionType.AesCbc256_HmacSha256_B64: {
        const minimumLength = ENC_TYPE_LENGTH + IV_LENGTH + MAC_LENGTH + MIN_DATA_LENGTH;
        if (encBytes.length < minimumLength) {
          throw new Error(decryptionError);
        }

        this.ivBytes = encBytes.slice(ENC_TYPE_LENGTH, ENC_TYPE_LENGTH + IV_LENGTH).buffer;
        this.macBytes = encBytes.slice(
          ENC_TYPE_LENGTH + IV_LENGTH,
          ENC_TYPE_LENGTH + IV_LENGTH + MAC_LENGTH
        ).buffer;
        this.dataBytes = encBytes.slice(ENC_TYPE_LENGTH + IV_LENGTH + MAC_LENGTH).buffer;
        break;
      }
      case EncryptionType.AesCbc256_B64: {
        const minimumLength = ENC_TYPE_LENGTH + IV_LENGTH + MIN_DATA_LENGTH;
        if (encBytes.length < minimumLength) {
          throw new Error(decryptionError);
        }

        this.ivBytes = encBytes.slice(ENC_TYPE_LENGTH, ENC_TYPE_LENGTH + IV_LENGTH).buffer;
        this.dataBytes = encBytes.slice(ENC_TYPE_LENGTH + IV_LENGTH).buffer;
        break;
      }
      default:
        throw new Error(decryptionError);
    }

    this.encryptionType = encType;
  }
}
