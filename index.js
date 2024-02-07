const { Builder, Browser, By, until } = require('selenium-webdriver');
const { faker } = require('@faker-js/faker');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
const { exec } = require('child_process');
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

process.on('uncaughtException', () => { })

const modalPath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.ant-space.ant-space-vertical > div > div > button.ant-btn.ant-btn-primary.ant-btn-block"
const usernamePath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.ant-space.ant-space-vertical > div > div > form > div.ant-row.ant-form-item.base-form-item-platformId > div > div > span > span > input"
const passwordPath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.ant-space.ant-space-vertical > div > div > form > div.ant-row.ant-form-item.base-form-item-passwd > div > div > span > span > input"
const confirmPasswordPath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.ant-space.ant-space-vertical > div > div > form > div.ant-row.ant-form-item.base-form-item-passwdConfirm > div > div > span > span > input"
const completeNamePath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.ant-space.ant-space-vertical > div > div > form > div.ant-row.ant-form-item.base-form-item-realName > div > div > span > span > input"
const registerButtonPath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.ant-space.ant-space-vertical > div > div > button.ant-btn.ant-btn-primary.ant-btn-block"
const deposit10Path = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps.ps--active-y > div.ant-modal-body > div > section > section > div.common-tabs-content > section > div > div > div.my-scrollbar-wrap.my-scrollbar-wrap-y > div > div > div:nth-child(3) > section > div > ul > li:nth-child(1)"
const rechargePath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > section > section > div.common-tabs-content > section > div > div > div.my-scrollbar-wrap.my-scrollbar-wrap-y > div > div > button"
const closeBonusModalPath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > button > span"
const confirmModalPath = "ant-modal-confirm-centered"
const modalInfoPath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div"
const closeModalInfoPath = "body > div > div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div > i"
const confirmRegistrationButtonPath = "div.ant-modal-wrap.ant-modal-centered.ant-modal-confirm-centered > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary"
// const phonePath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div/div[3]/div/div[2]/div[1]/div/form/div[5]/div/div/span/span/input"

async function findModal(driver) {
  await driver.wait(until.elementLocated(By.css(modalPath)));
  const modal = await driver.findElement(By.css(modalPath));
  return modal;
}

async function findFormFields(driver) {
  await driver.wait(until.elementLocated(By.css(usernamePath)));
  await driver.wait(until.elementLocated(By.css(passwordPath)));
  await driver.wait(until.elementLocated(By.css(confirmPasswordPath)));
  await driver.wait(until.elementLocated(By.css(completeNamePath)));
  await driver.wait(until.elementLocated(By.css(registerButtonPath)));
  // await driver.wait(until.elementLocated(By.css(phonePath)))
  const userNameEl = await driver.findElement(By.css(usernamePath));
  const passwordEl = await driver.findElement(By.css(passwordPath));
  const confirmPasswordEl = await driver.findElement(By.css(confirmPasswordPath));
  const completeNameEl = await driver.findElement(By.css(completeNamePath));
  const registerButtonEl = await driver.findElement(By.css(registerButtonPath));
  // const phoneEl = await driver.findElement(By.css(phonePath))
  return {
    userNameEl,
    passwordEl,
    confirmPasswordEl,
    completeNameEl,
    registerButtonEl,
    // phoneEl
  }
}

async function findDeposit10Button(driver) {
  await driver.wait(until.elementLocated(By.css(deposit10Path)));
  await driver.wait(until.elementLocated(By.css(rechargePath)));
  const deposit10ButtonEl = await driver.findElement(By.css(deposit10Path));
  const rechargeButtonEl = await driver.findElement(By.css(rechargePath));
  return {
    deposit10ButtonEl,
    rechargeButtonEl
  };
}

async function findConfirmModal(driver) {
  await driver.wait(until.elementLocated(By.className(confirmModalPath)));
  const confirmModalEl = await driver.findElement(By.className(confirmModalPath));
  return confirmModalEl
}

async function findModalInfo(driver) {
  await driver.wait(until.elementLocated(By.css(modalInfoPath)));
  const modalInfoEl = await driver.findElement(By.css(modalInfoPath));
  return modalInfoEl
}

async function findCloseModalInfo(driver) {
  await driver.wait(until.elementLocated(By.css(closeModalInfoPath)));
  const closeModalInfoEl = await driver.findElement(By.css(closeModalInfoPath));
  return closeModalInfoEl
}

async function findConfirmRegistrationButton(driver) {
  await driver.wait(until.elementLocated(By.css(confirmRegistrationButtonPath)));
  const confirmRegistrationButtonEl = await driver.findElement(By.css(confirmRegistrationButtonPath));
  return confirmRegistrationButtonEl
}

async function closeModal(driver) {
  const closeModalInfoEl = await findCloseModalInfo(driver)
  if (closeModalInfoEl) {
    await driver.executeScript("arguments[0].click();", closeModalInfoEl);
  }
}

async function closeBonusModal(driver) {
  await driver.wait(until.elementLocated(By.css(closeBonusModalPath)));
  const closeBonusModalEl = await driver.findElement(By.css(closeBonusModalPath));
  if (closeBonusModalEl) {
    await driver.executeScript("arguments[0].click();", closeBonusModalEl);
  }
}

function setOptions(options) {
  options.detachDriver(true);
  options.addArguments('--incognito');
  options.addArguments('--ignore-certificate-errors')
  options.addArguments('--verbose')
  options.addArguments('--no-sandbox')
  options.addArguments('--disable-dev-shm-usage')
  options.addArguments('--disable-web-security')
  options.addArguments('--allow-running-insecure-content')
  options.addArguments('--disable-extensions')
  options.addArguments('--disable-infobars')
  options.addArguments('--disable-notifications')
  options.addArguments('--disable-application-cache')
  options.addArguments('--disable-xss-auditor')
  options.addArguments('--disable-setuid-sandbox')
  options.addArguments('--disable-dev-profile')
  options.addArguments('--disable-ipc-flooding-protection')
  options.addArguments('--disable-breakpad')
  options.addArguments('--disable-hang-monitor')
  options.addArguments('--no-zygote')
  options.windowSize({
    width: 800,
    height: 600
  })
}

async function createAccountsWithSelenium(username) {
  try {
    const options = new ChromeOptions();
    setOptions(options)

    const driver = new Builder()
      .setChromeOptions(options)
      .forBrowser(Browser.CHROME)
      .build();

    await driver.manage().deleteAllCookies();
    await driver.get('https://jaejogo.com/?id=71451003');
    await findModal(driver);
    await driver.navigate().refresh();
    const {
      userNameEl,
      passwordEl,
      confirmPasswordEl,
      completeNameEl,
      registerButtonEl,
      // phoneEl
    } = await findFormFields(driver);

    await Promise.all([
      userNameEl.sendKeys(username),
      passwordEl.sendKeys('Quiqui45$'),
      confirmPasswordEl.sendKeys('Quiqui45$'),
      completeNameEl.sendKeys(username),
      // phoneEl.sendKeys(`11${faker.string.numeric(8)}`)
    ])
    await registerButtonEl.click();

    await findConfirmModal(driver);

    const confirmRegistrationButtonEl = await findConfirmRegistrationButton(driver)
    await confirmRegistrationButtonEl.click();

    await findModalInfo(driver)
    await closeModal(driver)

    const { deposit10ButtonEl, rechargeButtonEl } = await findDeposit10Button(driver);
    [deposit10ButtonEl, rechargeButtonEl].forEach(async (el) => await driver.executeScript("arguments[0].click();", el));

    await driver.sleep(5000)
    await driver.navigate().refresh();

    const tabs = await driver.getAllWindowHandles();
    await driver.switchTo().window(tabs[0]);

    // for (let i = 0; i < 3; i++) {
    //   await closeModal(driver)
    // }

    await closeBonusModal(driver)
    disconnectVpn()
  } catch (e) {
    if (e.name === 'WebDriverError') await createAccountsWithSelenium(username);
  }
}

const openVpn = (config) => exec(`python .\\vpn.py${config ? ` ${config}` : ''}`);
const disconnectVpn = () => exec('taskkill.exe /F /IM openvpn.exe');
const pause = async () => await new Promise((resolve) => {
  setTimeout(() => {
    resolve()
  }, 8000)
});

(async () => {
  for (let i = 0; i < 10; i++) {
    openVpn()
    await pause()
    await createAccountsWithSelenium(
      `${faker
        .internet
        .userName()}${new Date().getTime()}`
        .replace('.', '2023')
        .replace('_', '2021')
        .substring(0, 12)
    )
  }

  setInterval(() => openVpn('br.protonvpn.tcp.ovpn'), 60000)
  rl.question('Encerrar script, aperte ENTER', () => process.exit());
})();