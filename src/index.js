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

  const isWithPhone = rlSync.question('A plataforma requer telefone? (s/n)\n', {
    hideEchoBack: false,
    trueValue: 's',
    falseValue: 'n'
  })

  const accountsPassword = rlSync.question('Informe a senha para as contas: \n')

  const quantities = rlSync.question('Quantas contas deseja criar?\n', {
    hideEchoBack: false,
  })

  const depositValue = rlSync.question('Qual o valor do depósito?\n', {
    hideEchoBack: false,
  })

  console.log(`Iniciando criação de contas para ${link} ${isWithCpf ? 'com CPF' : 'sem CPF'} ${isWithPhone ? 'com telefone' : 'sem telefone'}`)

  const promises = []

  for (let i = 0; i < Number(quantities); i++) {
    promises.push(createAccountsWithSelenium({
        username: generateName(),
        link,
        isWithCpf,
        proxy,
        isWithPhone,
        accountsPassword,
        depositValue
    }))
  }

  await Promise.allSettled(promises)

  rlSync.question('Encerrar script, aperte ENTER');
})();