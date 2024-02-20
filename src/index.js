const readline = require('readline');
const {
  createAccountsWithSelenium,
  generateName
} = require('./functions.js');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

(async () => {
  for (let i = 0; i < 10; i++) {
    await createAccountsWithSelenium(generateName())
  }

  // setInterval(() => openVpn('br.protonvpn.tcp.ovpn'), 60000)
  rl.question('Encerrar script, aperte ENTER', () => process.exit());
})();

process.on('uncaughtException', () => { });