export function getAuthPlainText() {
  const plainText = `Welcome to ETransfer!

Click to sign in and accept the ETransfer Terms of Service (https://etransfer.gitbook.io/docs/more-information/terms-of-service) and Privacy Policy (https://etransfer.gitbook.io/docs/more-information/privacy-policy).

This request will not trigger a blockchain transaction or cost any gas fees.

Nonce:
${Date.now()}`;

  console.log(
    '>>>>>> current plain_text',
    Buffer.from(plainText).toString('hex').replace('0x', ''),
  );

  return {
    plainTextOrigin: plainText,
    plainTextHex: Buffer.from(plainText).toString('hex').replace('0x', ''),
  };
}
