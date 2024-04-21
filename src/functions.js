const { faker } = require('@faker-js/faker');
const { Builder, Browser, By, until } = require('selenium-webdriver');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
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
    confirmRegistrationButtonPath,
    phonePath
} = require('./paths.js')
const proxyChain = require('proxy-chain');

async function neverStop() {
    return new Promise(() => {
        setInterval(() => {
            console.log()
        }, 1000)
    });
}

async function createAccountsWithSelenium({
    username, link, isWithCpf, proxy, isWithPhone, accountsPassword, depositValue
                                          }) {
    try {
        const options = new ChromeOptions();
        setOptions(options)
        const oldProxyUrl = `http://${proxy}`
        const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
        options.addArguments(`--proxy-server=${newProxyUrl}`)

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
            phoneEl,
        } = await findFormFields(driver, isWithCpf, isWithPhone);

        if (isWithCpf) {
            await Promise.all([
                userNameEl.sendKeys(username),
                passwordEl.sendKeys(accountsPassword),
                confirmPasswordEl.sendKeys(accountsPassword),
                completeNameEl.sendKeys(username),
                cpfEl.sendKeys(faker.string.numeric(11)),
            ])
        } else if (isWithPhone && isWithCpf) {
            await Promise.all([
                userNameEl.sendKeys(username),
                passwordEl.sendKeys(accountsPassword),
                confirmPasswordEl.sendKeys(accountsPassword),
                completeNameEl.sendKeys(username),
                cpfEl.sendKeys(faker.string.numeric(11)),
                phoneEl.sendKeys(faker.string.numeric(11)),
            ])
        } else if (isWithPhone && !isWithCpf) {
            await Promise.all([
                userNameEl.sendKeys(username),
                passwordEl.sendKeys(accountsPassword),
                confirmPasswordEl.sendKeys(accountsPassword),
                completeNameEl.sendKeys(username),
                phoneEl.sendKeys(faker.string.numeric(11)),
            ])
        } else {
            await Promise.all([
                userNameEl.sendKeys(username),
                passwordEl.sendKeys(accountsPassword),
                confirmPasswordEl.sendKeys(accountsPassword),
                completeNameEl.sendKeys(username),
            ])
        }

        await registerButtonEl.click();

        await findConfirmModal(driver);
        const confirmRegistrationButtonEl = await findConfirmRegistrationButton(driver)
        await driver.executeScript("arguments[0].click();", confirmRegistrationButtonEl);

        await findModalInfo(driver)
        await closeModal(driver)
        const { deposit10ButtonEl, rechargeButtonEl } = await findDeposit10Button(driver);
        await deposit10ButtonEl.sendKeys(depositValue?.toString() || '10');
        await driver.executeScript("arguments[0].click();", rechargeButtonEl);

        await driver.sleep(5000)
        await driver.get(link);

        const tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[0]);

        for (let i = 0; i < 2; i++) {
            await closeModal(driver)
        }

        await neverStop()
    } catch (e) {
        console.log(e)
    }
};

async function findModal(driver) {
    await driver.wait(until.elementLocated(By.css(modalPath)));
    return await driver.findElement(By.css(modalPath));
}

async function findFormFields(driver, isWithCpf, isWithPhone) {
    let cpfEl = null;
    let phoneEl = null;
    await driver.wait(until.elementLocated(By.css(usernamePath)));
    await driver.wait(until.elementLocated(By.css(passwordPath)));
    await driver.wait(until.elementLocated(By.css(confirmPasswordPath)));
    await driver.wait(until.elementLocated(By.css(completeNamePath)));
    await driver.wait(until.elementLocated(By.css(registerButtonPath)));
    if (isWithCpf) await driver.wait(until.elementLocated(By.css(cpfPath)));
    const userNameEl = await driver.findElement(By.css(usernamePath));
    const passwordEl = await driver.findElement(By.css(passwordPath));
    const confirmPasswordEl = await driver.findElement(By.css(confirmPasswordPath));
    const completeNameEl = await driver.findElement(By.css(completeNamePath));
    const registerButtonEl = await driver.findElement(By.css(registerButtonPath));
    if (isWithCpf) {
        cpfEl = await driver.findElement(By.css(cpfPath));
    }
    if (isWithPhone) {
        phoneEl = await driver.findElement(By.css(phonePath));
    }
    return {
        userNameEl,
        passwordEl,
        confirmPasswordEl,
        completeNameEl,
        registerButtonEl,
        cpfEl,
        phoneEl
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
    return await driver.findElement(By.className(confirmModalPath))
}

async function findModalInfo(driver) {
    await driver.wait(until.elementLocated(By.css(modalInfoPath)));
    return await driver.findElement(By.css(modalInfoPath))
}

async function findCloseModalInfo(driver) {
    try {
        await driver.wait(until.elementLocated(By.css(closeModalInfoPath)), 10000);
        return await driver.findElement(By.css(closeModalInfoPath))
    } catch {
        return null
    }
}

async function findConfirmRegistrationButton(driver) {
    await driver.wait(until.elementLocated(By.css(confirmRegistrationButtonPath)));
    return await driver.findElement(By.css(confirmRegistrationButtonPath))
}

async function closeModal(driver) {
    const closeModalInfoEl = await findCloseModalInfo(driver)
    if (closeModalInfoEl) {
        await driver.executeScript("arguments[0].click();", closeModalInfoEl);
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

const generateName = () => `${faker.person.firstName().toLowerCase().substring(0, 8)}${faker.string.numeric(6)}`

module.exports = {
    createAccountsWithSelenium,
    generateName
}