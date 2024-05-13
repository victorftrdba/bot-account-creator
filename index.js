"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("puppeteer");
const faker_1 = require("@faker-js/faker");
const proxyChain = require('proxy-chain');
const rlSync = require('readline-sync');
process.on('uncaughtException', async () => {
    await Promise.all(browsers.map(async (b) => b === null || b === void 0 ? void 0 : b.close()));
});
process.on('SIGINT', async () => {
    await Promise.all(browsers.map(async (b) => b === null || b === void 0 ? void 0 : b.close()));
});
const browsers = [];
(async () => {
    const link = rlSync.question('Informe o link da plataforma: \n', {
        hideEchoBack: false,
    });
    const proxy = rlSync.question('Informe a proxy: \n', {
        hideEchoBack: false,
    });
    const quantities = rlSync.question('Quantidade de contas para criar: \n', {
        hideEchoBack: false,
    });
    const accountsPassword = rlSync.question('Informe a senha para as contas: \n', {
        hideEchoBack: false,
    });
    const platformModel = rlSync.question('Modelo da plataforma (1 ou 2): \n', {
        hideEchoBack: false,
    });
    const promises = [];
    for (let i = 0; i < parseInt(quantities); i++) {
        promises.push(createAccount({ link, proxy, accountsPassword, platformModel }));
    }
    await Promise.all(promises);
})();
async function createAccount({ link, proxy, accountsPassword, platformModel }) {
    var _a, _b, _c, _d;
    const mainLink = (_d = (_c = (_a = link.replace) === null || _a === void 0 ? void 0 : (_b = _a.call(link, "https://", "")).split) === null || _c === void 0 ? void 0 : _c.call(_b, "/")) === null || _d === void 0 ? void 0 : _d[0];
    const depositLink = `https://${mainLink}/deposit`;
    const browser = await puppeteer_1.default.launch({
        headless: false,
        defaultViewport: null,
        ignoreDefaultArgs: true,
        args: [
            `--proxy-server=${await proxyChain.anonymizeProxy(`http://${proxy}`)}`,
            '--incognito',
            '--verbose',
            '--disable-dev-shm-usage',
            '--disable-xss-auditor',
            '--no-zygote',
            '--disable-breakpad',
            '--disable-hang-monitor',
            '--disable-dev-profile',
            '--start-maximized',
            '--disable-infobars'
        ],
    });
    const [page] = await browser.pages();
    await page.goto(link, {
        waitUntil: "networkidle0"
    });
    if (platformModel === '1') {
        const usernameInput = "form > div:nth-child(1) > div > div > div > input";
        const passwordInput = "form > div:nth-child(2) > div > div > div > input";
        const confirmPasswordInput = "form > div:nth-child(4) > div > div > div > input";
        const completeNameInput = "form > div:nth-child(5) > div > div > div > input";
        await page.waitForSelector(usernameInput);
        await page.waitForSelector(passwordInput);
        await page.waitForSelector(confirmPasswordInput);
        await page.waitForSelector(completeNameInput);
        await page.type(usernameInput, `${faker_1.faker.person.firstName().toLowerCase().substring(0, 8)}${faker_1.faker.string.numeric(6)}`, {
            delay: 100
        });
        await page.type(passwordInput, accountsPassword, {
            delay: 100
        });
        await page.type(confirmPasswordInput, accountsPassword, {
            delay: 100
        });
        await page.type(completeNameInput, `${faker_1.faker.person.firstName()} ${faker_1.faker.person.lastName()}`, {
            delay: 100
        });
        const registerButton = "form > div:nth-child(7) > button";
        await page.waitForSelector(registerButton);
        await page.click(registerButton);
        await page.evaluate(async () => await new Promise(resolve => setTimeout(resolve, 2000)));
        await page.goto(depositLink, {
            waitUntil: "networkidle0"
        });
        const depositAmountElement = '#homeBoxScroll > div > div > div > div > section:nth-child(10) > div:nth-child(1)';
        await page.waitForSelector(depositAmountElement);
        await page.click(depositAmountElement);
        const depositButton = "#homeBoxScroll > div > div > div > div > div > button";
        await page.waitForSelector(depositButton);
        await page.click(depositButton);
    }
    else if (platformModel === '2') {
        const usernameInput = "form > div > div > div > div > div:nth-child(1) > div > div > div > span > span > input";
        const passwordInput = "form > div > div > div > div > div:nth-child(2) > div > div > div > span > span > input";
        const confirmPasswordInput = "form > div > div > div > div > div:nth-child(4) > div > div > div > span > span > input";
        await page.waitForSelector(usernameInput);
        await page.waitForSelector(passwordInput);
        await page.waitForSelector(confirmPasswordInput);
        await page.type(usernameInput, `${faker_1.faker.person.firstName().toLowerCase().substring(0, 8)}${faker_1.faker.string.numeric(6)}`, {
            delay: 100
        });
        await page.type(passwordInput, accountsPassword, {
            delay: 100
        });
        await page.type(confirmPasswordInput, accountsPassword, {
            delay: 100
        });
        await clickWithMouseOnElement(page, "div > div > div.ant-row-flex.ant-row-flex-center.ant-row-flex-middle > button");
        await clickWithMouseOnElement(page, "div > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary");
        await clickWithMouseOnElement(page, "section > div > div > div > div > div > div:nth-child(3) > section > div > ul > li:nth-child(1)");
        await clickWithMouseOnElement(page, "section > div.common-tabs-content > section > div > div > div > div > div > button");
    }
    browsers.push(browser);
    await neverStop();
}
async function clickWithMouseOnElement(page, path) {
    const element = await page.waitForSelector(path);
    const rect = await page.evaluate(el => {
        const { top, left, width, height } = el === null || el === void 0 ? void 0 : el.getBoundingClientRect();
        return { top, left, width, height };
    }, element);
    await page.mouse.click((rect === null || rect === void 0 ? void 0 : rect.left) + (rect === null || rect === void 0 ? void 0 : rect.width) / 2, (rect === null || rect === void 0 ? void 0 : rect.top) + (rect === null || rect === void 0 ? void 0 : rect.height) / 2);
}
async function neverStop() {
    return new Promise(() => {
        setInterval(() => {
            console.log();
        }, 1000);
    });
}
//# sourceMappingURL=index.js.map