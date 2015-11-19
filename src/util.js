export function log(...message) {
  process.stdout.write(message.join(' ') + '\n');
}

export function error(...message) {
  process.stderr.write(message.join(' ') + '\n');
}
