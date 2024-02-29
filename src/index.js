process.on('uncaughtException', () => { });

const {
  createAccountsWithSelenium,
  generateName
} = require('./functions.js');
const rlSync = require('readline-sync');

(async () => {
  const link = rlSync.question('Informe o link da plataforma: \n', {
    hideEchoBack: false,
  })

  const isWithCpf = rlSync.question('A plataforma requer CPF? (s/n)\n', {
    hideEchoBack: false,
    trueValue: 's',
    falseValue: 'n'
  })

  console.log(`Iniciando criação de contas para ${link} ${isWithCpf ? 'com CPF' : 'sem CPF'}`)

  for (let i = 0; i < 2; i++) {
    await createAccountsWithSelenium(generateName(), link, isWithCpf)
  }

  // setInterval(() => openVpn('br.protonvpn.tcp.ovpn'), 60000)
  rlSync.question('Encerrar script, aperte ENTER');
})();