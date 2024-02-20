const { faker } = require('@faker-js/faker');
const { Builder, Browser, By, until } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
const { exec } = require('child_process');
const {
    modalPath,
    usernamePath,
    passwordPath,
    confirmPasswordPath,
    completeNamePath,
    cpfPath,
    registerButtonPath,
    deposit10Path,
    rechargePath,
    closeBonusModalPath,
    confirmModalPath,
    modalInfoPath,
    closeModalInfoPath,
    confirmRegistrationButtonPath
    // phonePath
} = require('./paths.js')
const { link } = require('./config.js');

async function createAccountsWithSelenium(username) {
    try {
        disconnectVpn()
        openVpn()
        await pause()

        const options = new ChromeOptions();
        setOptions(options)

        const driver = new Builder()
            .setChromeOptions(options)
            .forBrowser(Browser.CHROME)
            .build();

        await driver.manage().deleteAllCookies();
        await driver.get(link);
        await findModal(driver);
        await driver.navigate().refresh();

        const {
            userNameEl,
            passwordEl,
            confirmPasswordEl,
            completeNameEl,
            registerButtonEl,
            cpfEl,
            // phoneEl
        } = await findFormFields(driver);
        await Promise.all([
            userNameEl.sendKeys(username),
            passwordEl.sendKeys('Quiqui45$'),
            confirmPasswordEl.sendKeys('Quiqui45$'),
            completeNameEl.sendKeys(username),
            cpfEl.sendKeys(faker.string.numeric(11)),
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
        await driver.get(link);

        const tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[0]);

        // for (let i = 0; i < 3; i++) {
        //   await closeModal(driver)
        // }

        // await closeBonusModal(driver)

        disconnectVpn()
    } catch (e) {
        await createAccountsWithSelenium(generateName());
    }
};

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
    await driver.wait(until.elementLocated(By.css(cpfPath)));
    // await driver.wait(until.elementLocated(By.css(phonePath)))
    const userNameEl = await driver.findElement(By.css(usernamePath));
    const passwordEl = await driver.findElement(By.css(passwordPath));
    const confirmPasswordEl = await driver.findElement(By.css(confirmPasswordPath));
    const completeNameEl = await driver.findElement(By.css(completeNamePath));
    const registerButtonEl = await driver.findElement(By.css(registerButtonPath));
    const cpfEl = await driver.findElement(By.css(cpfPath));
    // const phoneEl = await driver.findElement(By.css(phonePath))
    return {
        userNameEl,
        passwordEl,
        confirmPasswordEl,
        completeNameEl,
        registerButtonEl,
        cpfEl,
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

const openVpn = (config) => exec(`python .\\src\\vpn.py${config ? ` ${config}` : ''}`);

const disconnectVpn = () => exec('taskkill.exe /F /IM openvpn.exe');

const pause = async () => await new Promise((resolve) => {
    setTimeout(() => {
        resolve()
    }, 8000)
});

const generateName = () => `${faker
    .internet
    .userName()}${new Date().getTime()}`
    .replace('.', '2023')
    .replace('_', '2021')
    .substring(0, 12)

module.exports = {
    createAccountsWithSelenium,
    generateName
}