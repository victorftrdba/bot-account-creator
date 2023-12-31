const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
const { exec } = require('child_process');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

process.on('uncaughtException', handleErrors)

function handleErrors(e) {
  console.log('error', e)
}

const usernamePath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div/div[3]/div/div[2]/div[1]/div/form/div[1]/div/div/span/span/input"
const passwordPath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div/div[3]/div/div[2]/div[1]/div/form/div[2]/div/div/span/span/input"
const confirmPasswordPath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div/div[3]/div/div[2]/div[1]/div/form/div[3]/div/div/span/span/input"
const completeNamePath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div/div[3]/div/div[2]/div[1]/div/form/div[4]/div/div/span/span/input"
const registerButtonPath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div/div[3]/div/div[2]/div[3]/div/button[2]"
// const phonePath = "/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div/div[3]/div/div[2]/div[1]/div/form/div[5]/div/div/span/span/input"
const deposit10Path = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > section > section > div.common-tabs-content > section > div > div > div.my-scrollbar-wrap.my-scrollbar-wrap-y > div > div > div > section > div > ul > li"
const rechargePath = "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > section > section > div.common-tabs-content > section > div > div > div.my-scrollbar-wrap.my-scrollbar-wrap-y > div > div > button"

const findModal = async (driver) => {
  await driver.wait(until.elementLocated(By.css(".registerModal")));
  const modal = await driver.findElement(By.css(".registerModal"));
  return modal;
}

const findFormFields = async (driver) => {
  await driver.wait(until.elementLocated(By.xpath(usernamePath)));
  await driver.wait(until.elementLocated(By.xpath(passwordPath)));
  await driver.wait(until.elementLocated(By.xpath(confirmPasswordPath)));
  await driver.wait(until.elementLocated(By.xpath(completeNamePath)));
  await driver.wait(until.elementLocated(By.xpath(registerButtonPath)));
  // await driver.wait(until.elementLocated(By.xpath(phonePath)))
  const userNameEl = await driver.findElement(By.xpath(usernamePath));
  const passwordEl = await driver.findElement(By.xpath(passwordPath));
  const confirmPasswordEl = await driver.findElement(By.xpath(confirmPasswordPath));
  const completeNameEl = await driver.findElement(By.xpath(completeNamePath));
  const registerButtonEl = await driver.findElement(By.xpath(registerButtonPath));
  // const phoneEl = await driver.findElement(By.xpath(phonePath))
  return {
    userNameEl,
    passwordEl,
    confirmPasswordEl,
    completeNameEl,
    registerButtonEl,
    // phoneEl
  }
}

const findDeposit10Button = async (driver) => {
  await driver.wait(until.elementLocated(By.css(deposit10Path)));
  await driver.wait(until.elementLocated(By.css(rechargePath)));
  const deposit10ButtonEl = await driver.findElement(By.css(deposit10Path));
  const rechargeButtonEl = await driver.findElement(By.css(rechargePath));
  return {
    deposit10ButtonEl,
    rechargeButtonEl
  };
}

const findConfirmModal = async (driver) => {
  await driver.wait(until.elementLocated(By.className("ant-modal-confirm-centered")));
  const confirmModalEl = await driver.findElement(By.className("ant-modal-confirm-centered"));
  return confirmModalEl
}

const findModalInfo = async (driver) => {
  await driver.wait(until.elementLocated(By.css("div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div")));
  const modalInfoEl = await driver.findElement(By.css("div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div"));
  return modalInfoEl
}

const findCloseModalInfo = async (driver) => {
  await driver.wait(until.elementLocated(By.css("body > div > div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div > i")));
  const closeModalInfoEl = await driver.findElement(By.css("body > div > div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > div.ant-modal-body > div > div > div > i"));
  return closeModalInfoEl
}

const findConfirmRegistrationButton = async (driver) => {
  await driver.wait(until.elementLocated(By.css("div.ant-modal-wrap.ant-modal-centered.ant-modal-confirm-centered > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary")));
  const confirmRegistrationButtonEl = await driver.findElement(By.css("div.ant-modal-wrap.ant-modal-centered.ant-modal-confirm-centered > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary"));
  return confirmRegistrationButtonEl
}

const closeModal = async (driver) => {
  const closeModalInfoEl = await findCloseModalInfo(driver)
  if (closeModalInfoEl) {
    await driver.executeScript("arguments[0].click();", closeModalInfoEl);
  }
}

// const findCloseBonusModal = async (driver) => {
//   await driver.wait(until.elementLocated(By.css("body > div > div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > button > span > i")));
//   const closeBonusModalEl = await driver.findElement(By.css("body > div > div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content.ps > button > span > i"));
//   return closeBonusModalEl
// }

// const closeBonusModal = async (driver) => {
//   const closeBonusModalEl = await findCloseBonusModal(driver)
//   if (closeBonusModalEl) {
//     await driver.executeScript("arguments[0].click();", closeBonusModalEl);
//   }
// }

async function createAccountsWithSelenium(username) {
  const options = new ChromeOptions();
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

  const driver = new Builder()
    .setChromeOptions(options)
    .forBrowser(Browser.CHROME)
    .build();

  await driver.manage().deleteAllCookies();
  await driver.get('https://9991bet.com/?id=92920911');
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

  await userNameEl.sendKeys(username);
  await passwordEl.sendKeys('Quiqui45$');
  await confirmPasswordEl.sendKeys('Quiqui45$');
  // await phoneEl.sendKeys(`11${faker.string.numeric(8)}`);
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

  await driver.sleep(5000)
  await driver.navigate().refresh();

  const tabs = await driver.getAllWindowHandles();
  await driver.switchTo().window(tabs[0]);

  // await closeModal(driver)
  // await closeModal(driver)
  // await closeBonusModal(driver)
  // await driver.manage().window().minimize();
}

async function pause() {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 8000)
  })
}

(async () => {
  exec("python ./vpn.py")

  await pause()

  for (let i = 0; i < 20; i++) {
    const username = `${faker
      .internet
      .userName()}${new Date().getTime()}`
      .replace('.', '2023')
      .replace('_', '2021')
      .substring(0, 12)

    try {
      await createAccountsWithSelenium(username)
      if (((i + 1) % 3) === 0) {
        exec("python ./vpn.py")
        await pause()
      }
      await pause()
    } catch (e) {
      console.log('error', e)
    }
  }

  readline.question(`\n\n ******** Pressione Enter para encerrar o script... ********`, () => {
    readline.close();
  });
})();