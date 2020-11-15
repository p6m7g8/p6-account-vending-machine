export function handler(event: any, context: any, callback: (...args: any[]) => void) {

  console.log({ event });

  callback();
}
