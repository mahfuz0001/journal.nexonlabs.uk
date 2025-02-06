export async function encryptText(text: string, encryptionKey: string) {
  if (!text) return text;

  try {
    // Convert text to bytes
    const textEncoder = new TextEncoder();
    const textBytes = textEncoder.encode(text);

    // Generate random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Generate encryption key from password using PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(process.env.ENCRYPTION_KEY || "fallback-key"),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    // Encrypt the text
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      textBytes
    );

    // Combine IV and encrypted content and convert to base64
    const encryptedArray = new Uint8Array([
      ...iv,
      ...new Uint8Array(encryptedContent),
    ]);
    return btoa(String.fromCharCode(...encryptedArray));
  } catch (error) {
    console.error("Encryption failed:", error);
    return text;
  }
}

export async function decryptText(text: string, encryptionKey: string) {
  try {
    // Convert base64 back to bytes
    const encryptedArray = new Uint8Array(
      atob(text)
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    // Extract IV and encrypted content
    const iv = encryptedArray.slice(0, 12);
    const encryptedContent = encryptedArray.slice(12);

    // Generate key from password using PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(process.env.ENCRYPTION_KEY || "fallback-key"),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decrypt the content
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedContent
    );

    // Convert bytes back to text
    return new TextDecoder().decode(decryptedContent);
  } catch (error) {
    console.error("Decryption failed:", error);
    return text;
  }
}
