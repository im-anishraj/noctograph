const ansiPattern =
  /[\u001b\u009b][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;
const oscPattern = /\u001b\][^\u0007]*(?:\u0007|\u001b\\)/g;

export function stripAnsi(input: string): string {
  return input.replace(oscPattern, "").replace(ansiPattern, "");
}
