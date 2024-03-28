process.on('uncaughtException', () => { });

const {
  createAccountsWithSelenium,
  generateName
} = require('./functions.js');
const rlSync = require('readline-sync');

(async () => {
  process.on("SIGINT", function () {
    console.log('\nEncerrando script\n')
    process.exit();
  });

  process.on("exit", function () {
    console.log("\nScript encerrado!");
  });

  const link = rlSync.question('Informe o link da plataforma: \n', {
    hideEchoBack: false,
  })

  const proxy = rlSync.question('Informe a proxy: \n', {
    hideEchoBack: false,
  })

  const isWithCpf = rlSync.question('A plataforma requer CPF? (s/n)\n', {
    hideEchoBack: false,
    trueValue: 's',
    falseValue: 'n'
  })

  const quantities = rlSync.question('Quantas contas deseja criar?\n', {
    hideEchoBack: false,
  })

  console.log(`Iniciando criação de contas para ${link} ${isWithCpf ? 'com CPF' : 'sem CPF'}`)

  const promises = []
  for (let i = 0; i < Number(quantities); i++) {
    promises.push(createAccountsWithSelenium(generateName(), link, isWithCpf, proxy))
  }
  await Promise.allSettled(promises)

  rlSync.question('Encerrar script, aperte ENTER');
})();