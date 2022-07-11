import { EncryptionType } from "@bitwarden/common/enums/encryptionType";
import { EncArrayBuffer } from "@bitwarden/common/models/domain/encArrayBuffer";

import { makeStaticByteArray } from "../utils";

describe("encArrayBuffer", () => {
  describe("parses the buffer", () => {
    test.each([
      [EncryptionType.AesCbc128_HmacSha256_B64, "AesCbc128_HmacSha256_B64"],
      [EncryptionType.AesCbc256_HmacSha256_B64, "AesCbc256_HmacSha256_B64"],
    ])("with %c%s", (encType: EncryptionType) => {
      const iv = makeStaticByteArray(16, 10);
      const mac = makeStaticByteArray(32, 20);
      const cipherText = makeStaticByteArray(20, 30);

      const array = new Uint8Array(1 + iv.byteLength + mac.byteLength + cipherText.byteLength);
      array.set([encType]);
      array.set(iv, 1);
      array.set(mac, 1 + iv.byteLength);
      array.set(cipherText, 1 + iv.byteLength + mac.byteLength);

      const actual = new EncArrayBuffer(array.buffer);

      expect(actual.encryptionType).toEqual(encType);
      expect(actual.ivBytes).toEqualBuffer(iv);
      expect(actual.macBytes).toEqualBuffer(mac);
      expect(actual.ctBytes).toEqualBuffer(cipherText);
    });

    it("with AesCbc256_B64", () => {
      const encType = EncryptionType.AesCbc256_B64;
      const iv = makeStaticByteArray(16, 10);
      const cipherText = makeStaticByteArray(20, 30);

      const array = new Uint8Array(1 + iv.byteLength + cipherText.byteLength);
      array.set([encType]);
      array.set(iv, 1);
      array.set(cipherText, 1 + iv.byteLength);

      const actual = new EncArrayBuffer(array.buffer);

      expect(actual.encryptionType).toEqual(encType);
      expect(actual.ivBytes).toEqualBuffer(iv);
      expect(actual.ctBytes).toEqualBuffer(cipherText);
      expect(actual.macBytes).toBeNull();
    });
  });

  describe("doesn't parse the buffer if it has an invalid length", () => {
    test.each([
      [EncryptionType.AesCbc128_HmacSha256_B64, 49, "AesCbc128_HmacSha256_B64"],
      [EncryptionType.AesCbc256_HmacSha256_B64, 49, "AesCbc256_HmacSha256_B64"],
      [EncryptionType.AesCbc256_B64, 17, "AesCbc256_B64"],
    ])("with %c%c%s", (encType: EncryptionType, minLength: number) => {
      // Generate invalid byte array
      // Minus 1 to leave room for the encType, minus 1 to make it invalid
      const invalidBytes = makeStaticByteArray(minLength - 2);

      const invalidArray = new Uint8Array(1 + invalidBytes.buffer.byteLength);
      invalidArray.set([encType]);
      invalidArray.set(invalidBytes, 1);

      const actual = new EncArrayBuffer(invalidArray.buffer);

      expect(actual.buffer).not.toBeNull();
      expect(actual.ctBytes).toBeNull();
      expect(actual.encryptionType).toBeNull();
      expect(actual.ivBytes).toBeNull();
      expect(actual.macBytes).toBeNull();
    });
  });

  it("doesn't parse the buffer if the encryptionType is not supported", () => {
    // Starting at 9 implicitly gives us an invalid encType
    const bytes = makeStaticByteArray(50, 9);
    const actual = new EncArrayBuffer(bytes);

    expect(actual.buffer).not.toBeNull();
    expect(actual.ctBytes).toBeNull();
    expect(actual.encryptionType).toBeNull();
    expect(actual.ivBytes).toBeNull();
    expect(actual.macBytes).toBeNull();
  });
});
