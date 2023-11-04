const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

process.on('uncaughtException', handleErrors)

function handleErrors(e) {
  console.log('error', e)
}

const url = 'https://boa777.com/?id=31589091'
const modalClass = ".register-modal"
const userNameXPath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div[1]/div/div[3]/div/div[2]/div[1]/div/form/div[1]/div/div/span/span/input"
const passwordXPath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div[1]/div/div[3]/div/div[2]/div[1]/div/form/div[2]/div/div/span/span/input"
const passwordConfirmXPath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div[1]/div/div[3]/div/div[2]/div[1]/div/form/div[3]/div/div/span/span/input"
const completeNameXPath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div[1]/div/div[3]/div/div[2]/div[1]/div/form/div[4]/div/div/span/span/input"
const registerButtonXPath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div[1]/div/div[3]/div/div[2]/div[3]/div/button[2]"
const deposit10ButtonClass = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > section > section > div.common-tabs-content > section > div > div > div.my-scrollbar-wrap.my-scrollbar-wrap-y > div > div > div > section > div > ul > li"
const rechargeButtonClass = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > section > section > div.common-tabs-content > section > div > div > div.my-scrollbar-wrap.my-scrollbar-wrap-y > div > div > button"
const confirmModalClass = "ant-modal-confirm-centered"
const confirmRegistrationClass = "div.ant-modal-wrap.ant-modal-centered.ant-modal-confirm-centered > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary"
const passwordValue = 'Quiqui45$'
const modalInfoClass = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div"
const closeModalInfoClass = "body > div > div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div > i"
const closeBonusModalClass = "body > div > div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > button > span > i"

const findModal = async (driver) => {
  await driver.wait(until.elementLocated(By.css(modalClass)));
  const modal = await driver.findElement(By.css(modalClass));
  return modal;
}

const findFormFields = async (driver) => {
  await driver.wait(until.elementLocated(By.xpath(userNameXPath)));
  await driver.wait(until.elementLocated(By.xpath(passwordXPath)));
  await driver.wait(until.elementLocated(By.xpath(passwordConfirmXPath)));
  await driver.wait(until.elementLocated(By.xpath(completeNameXPath)));
  await driver.wait(until.elementLocated(By.xpath(registerButtonXPath)));
  const userNameEl = await driver.findElement(By.xpath(userNameXPath));
  const passwordEl = await driver.findElement(By.xpath(passwordXPath));
  const confirmPasswordEl = await driver.findElement(By.xpath(passwordConfirmXPath));
  const completeNameEl = await driver.findElement(By.xpath(completeNameXPath));
  const registerButtonEl = await driver.findElement(By.xpath(registerButtonXPath));
  return {
    userNameEl,
    passwordEl,
    confirmPasswordEl,
    completeNameEl,
    registerButtonEl
  }
}

const findDeposit10Button = async (driver) => {
  await driver.wait(until.elementLocated(By.css(deposit10ButtonClass)));
  await driver.wait(until.elementLocated(By.css(rechargeButtonClass)));
  const deposit10ButtonEl = await driver.findElement(By.css(deposit10ButtonClass));
  const rechargeButtonEl = await driver.findElement(By.css(rechargeButtonClass));
  return {
    deposit10ButtonEl,
    rechargeButtonEl
  };
}

const findConfirmModal = async (driver) => {
  await driver.wait(until.elementLocated(By.className(confirmModalClass)));
  const confirmModalEl = await driver.findElement(By.className(confirmModalClass));
  return confirmModalEl
}

const findModalInfo = async (driver) => {
  await driver.wait(until.elementLocated(By.css(modalInfoClass)));
  const modalInfoEl = await driver.findElement(By.css(modalInfoClass));
  return modalInfoEl
}

const findCloseModalInfo = async (driver) => {
  await driver.wait(until.elementLocated(By.css(closeModalInfoClass)));
  const closeModalInfoEl = await driver.findElement(By.css(closeModalInfoClass));
  return closeModalInfoEl
}

const findConfirmRegistrationButton = async (driver) => {
  await driver.wait(until.elementLocated(By.css(confirmRegistrationClass)));
  const confirmRegistrationButtonEl = await driver.findElement(By.css(confirmRegistrationClass));
  return confirmRegistrationButtonEl
}

const closeModal = async (driver) => {
  const closeModalInfoEl = await findCloseModalInfo(driver)
  if (closeModalInfoEl) {
    await driver.executeScript("arguments[0].click();", closeModalInfoEl);
  }
}

const findCloseBonusModal = async (driver) => {
  await driver.wait(until.elementLocated(By.css(closeBonusModalClass)));
  const closeBonusModalEl = await driver.findElement(By.css(closeBonusModalClass));
  return closeBonusModalEl
}

const closeBonusModal = async (driver) => {
  const closeBonusModalEl = await findCloseBonusModal(driver)
  if (closeBonusModalEl) {
    await driver.executeScript("arguments[0].click();", closeBonusModalEl);
  }
}

async function createAccountsWithSelenium(username) {
  const options = new ChromeOptions();
  options.addArguments('--incognito');
  options.detachDriver(true);
  options.addArguments('--ignore-certificate-errors')
  options.addArguments('--disable-gpu')
  options.addArguments('--verbose')

  const driver = new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  await driver.manage().deleteAllCookies();
  await driver.get(url);
  await findModal(driver);
  await driver.navigate().refresh();
  const {
    userNameEl,
    passwordEl,
    confirmPasswordEl,
    completeNameEl,
    registerButtonEl
  } = await findFormFields(driver);

  await userNameEl.sendKeys(username);
  await passwordEl.sendKeys(passwordValue);
  await confirmPasswordEl.sendKeys(passwordValue);
  await completeNameEl.sendKeys(username);
  await registerButtonEl.click();

  await findConfirmModal(driver);

  const confirmRegistrationButtonEl = await findConfirmRegistrationButton(driver)
  await confirmRegistrationButtonEl.click();

  await findModalInfo(driver)
  await closeModal(driver)

  const { deposit10ButtonEl, rechargeButtonEl } = await findDeposit10Button(driver);
  await driver.executeScript("arguments[0].click();", deposit10ButtonEl);
  await driver.executeScript("arguments[0].click();", rechargeButtonEl);

  await driver.navigate().refresh();

  const tabs = await driver.getAllWindowHandles();
  await driver.switchTo().window(tabs[0]);

  await closeModal(driver)
  await closeModal(driver)
  // await closeBonusModal(driver)
  await driver.manage().window().minimize();
}

(async () => {
  for (let i = 0; i < 10; i++) {
    const username = `${faker
      .internet
      .userName()}${new Date().getTime()}`
      .replace('.', '2023')
      .replace('_', '2021')
      .substring(0, 12)

    try {
      await createAccountsWithSelenium(username)
      fs.appendFileSync('usuarios.txt', `${username}\n`);
    } catch (e) {
      console.log('error', e)
    }
  }

  readline.question(`\n\n ******** Pressione Enter para encerrar o script... ********`, () => {
    readline.close();
  });
})();