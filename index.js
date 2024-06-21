"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("puppeteer");
const faker_1 = require("@faker-js/faker");
const fs = require("fs");
const user_agents_1 = require("./user-agents");
const proxyChain = require('proxy-chain');
process.on('uncaughtException', async () => {
    await Promise.all(browsers.map(async (b) => b === null || b === void 0 ? void 0 : b.close()));
});
process.on('SIGINT', async () => {
    await Promise.all(browsers.map(async (b) => b === null || b === void 0 ? void 0 : b.close()));
});
const browsers = [];
(async () => {
    const { link, proxy, quantidade_contas, senha_contas, modelo_plataforma } = JSON.parse(Buffer.from(fs.readFileSync("./configs/config.json")).toString('utf8'));
    const promises = [];
    for (let i = 0; i < parseInt(quantidade_contas); i++) {
        promises.push(createAccount({
            link,
            proxy,
            accountsPassword: senha_contas,
            platformModel: modelo_plataforma,
            index: i
        }));
    }
    await Promise.allSettled(promises);
})();
function getWindowPosition(index, step, resetValue) {
    return (index * step) % resetValue;
}
function getWindowPositionYByIndexMultiple(index) {
    return index % 3 === 0 ? 0 : 500;
}
async function createAccount({ link, proxy, accountsPassword, platformModel, index }) {
    var _a, _b, _c, _d;
    const mainLink = (_d = (_c = (_a = link.replace) === null || _a === void 0 ? void 0 : (_b = _a.call(link, "https://", "")).split) === null || _c === void 0 ? void 0 : _c.call(_b, "/")) === null || _d === void 0 ? void 0 : _d[0];
    const depositLink = `https://${mainLink}/deposit`;
    const step = 350;
    const resetValue = 1750;
    const show4WindowsSideBySide = `--window-position=${getWindowPosition(index, step, resetValue)},${getWindowPositionYByIndexMultiple(index)}`;
    const userAgent = user_agents_1.userAgents[Math.floor(Math.random() * user_agents_1.userAgents.length)];
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
            '--disable-infobars',
            show4WindowsSideBySide,
            '--window-size=250,500',
            `--user-agent=${userAgent}`
        ],
    });
    try {
        const [page] = await browser.pages();
        await page.setUserAgent(userAgent);
        page.setDefaultNavigationTimeout(0);
        page.setDefaultTimeout(0);
        await page.goto(link);
        await page.reload();
        const username = `${faker_1.faker.person.firstName().toLowerCase().substring(0, 8)}${faker_1.faker.person.lastName().toLowerCase().substring(0, 8).replace('-', '')}`;
        if (platformModel === '1') {
            const usernameInput = "form > div:nth-child(1) > div > div > div > input";
            const passwordInput = "form > div:nth-child(2) > div > div > div > input";
            const confirmPasswordInput = "form > div:nth-child(4) > div > div > div > input";
            await page.waitForSelector(usernameInput);
            await page.waitForSelector(passwordInput);
            await page.waitForSelector(confirmPasswordInput);
            await page.type(usernameInput, username);
            await page.type(passwordInput, accountsPassword);
            await page.type(confirmPasswordInput, accountsPassword);
            const registerButton = "form > div:nth-child(6) > button";
            await page.waitForSelector(registerButton);
            await page.click(registerButton);
            await page.evaluate(async () => await new Promise(resolve => setTimeout(resolve, 2000)));
            await page.goto(depositLink);
            const depositAmountElement = 'div > div > div > div > div > div > div > input';
            await page.waitForSelector(depositAmountElement);
            await page.type(depositAmountElement, '10');
            const depositButton = "div > div > div > div > button";
            await page.waitForSelector(depositButton);
            await page.click(depositButton);
        }
        else if (platformModel === '2') {
            await page.reload();
            const usernameInput = "form > div > div > div > div > div:nth-child(1) > div > div > div > span > span > input";
            const passwordInput = "form > div > div > div > div > div:nth-child(2) > div > div > div > span > span > input";
            const confirmPasswordInput = "form > div > div > div > div > div:nth-child(4) > div > div > div > span > span > input";
            await page.waitForSelector(usernameInput);
            await page.waitForSelector(passwordInput);
            await page.waitForSelector(confirmPasswordInput);
            await page.type(usernameInput, username);
            await page.type(passwordInput, accountsPassword);
            await page.type(confirmPasswordInput, accountsPassword);
            await clickWithMouseOnElement(page, "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content > div > div > div.ant-row-flex.ant-row-flex-center.ant-row-flex-middle > button");
            await clickOnElement(page, "div.ant-modal-wrap.ant-modal-centered.ant-modal-confirm-centered > div > div.ant-modal-content > div > div > div.ant-modal-confirm-body > div > div > div.closeIcon > img");
            await clickOnElement(page, ".ant-btn-primary");
            await clickWithMouseOnElement(page, "section > div > div > div > div > div > div:nth-child(3) > section > div > ul > li:nth-child(1)");
            await clickWithMouseOnElement(page, "section > div.common-tabs-content > section > div > div > div > div > div > button");
        }
        browsers.push(browser);
        await neverStop();
    }
    catch (e) {
        console.log(e);
    }
}
async function clickWithMouseOnElement(page, path) {
    const element = await page.waitForSelector(path, {
        timeout: 0
    });
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
async function clickOnElement(page, path) {
    await page.evaluate(async (path) => await new Promise(resolve => {
        const element = document.querySelector(path);
        setInterval(() => {
            resolve(element === null || element === void 0 ? void 0 : element.click());
        }, 1000);
    }), path);
}
//# sourceMappingURL=index.js.map