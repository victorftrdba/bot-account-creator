"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("puppeteer");
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
    const quantities = rlSync.question('Quantidade de contas para criar: \n', {
        hideEchoBack: false,
    });
    const platformModel = rlSync.question('Modelo da plataforma (1 ou 2): \n', {
        hideEchoBack: false,
    });
    const promises = [];
    for (let i = 0; i < parseInt(quantities); i++) {
        promises.push(createAccount({ link, platformModel }));
    }
    await Promise.all(promises);
})();
async function createAccount({ link, platformModel }) {
    var _a, _b, _c, _d;
    const mainLink = (_d = (_c = (_a = link.replace) === null || _a === void 0 ? void 0 : (_b = _a.call(link, "https://", "")).split) === null || _c === void 0 ? void 0 : _c.call(_b, "/")) === null || _d === void 0 ? void 0 : _d[0];
    const browser = await puppeteer_1.default.launch({
        headless: false,
        defaultViewport: null,
        ignoreDefaultArgs: true,
        args: [
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
        const withdrawLink = `https://${mainLink}/withdraw-set?to=withdraw`;
        const loginNowBtn = "body > div > div > div > div:nth-child(3)";
        await page.waitForSelector(loginNowBtn);
        await clickWithMouseOnElement(page, loginNowBtn);
        const usernameInput = "form > div:nth-child(1) > div > div > div > input";
        const passwordInput = "form > div:nth-child(2) > div > div > div > input";
        const loginBtn = "form > div:nth-child(4) > button";
        await page.waitForSelector(usernameInput);
        await page.waitForSelector(passwordInput);
        await page.waitForSelector(loginBtn);
        await page.type(usernameInput, "xcfcxvcxvx", {
            delay: 100
        });
        await page.type(passwordInput, "123456rr", {
            delay: 100,
        });
        await clickWithMouseOnElement(page, loginBtn);
        await page.evaluate(async () => await new Promise(resolve => setTimeout(resolve, 2000)));
        await page.goto(withdrawLink, {
            waitUntil: "networkidle0"
        });
        for (let i = 0; i < 2; i++) {
            await page.keyboard.press('Tab');
            await page.keyboard.press('1', {
                delay: 100
            });
            await page.keyboard.press('2', {
                delay: 100
            });
            await page.keyboard.press('3', {
                delay: 100
            });
            await page.keyboard.press('4', {
                delay: 100
            });
            await page.keyboard.press('5', {
                delay: 100
            });
            await page.keyboard.press('6', {
                delay: 100
            });
        }
        const confirmBtn = "#homeBoxScroll > div > div > div > div > div > button";
        await page.waitForSelector(confirmBtn);
        await clickWithMouseOnElement(page, confirmBtn);
        await page.evaluate(async () => await new Promise(resolve => setTimeout(resolve, 2000)));
        const addPix = "#homeBoxScroll > div > div > div > div > div > section > section > section.radioGroup > div > div";
        await page.waitForSelector(addPix);
        await clickWithMouseOnElement(page, addPix);
        const addPix2 = "#homeBoxScroll > div > div > div > div > div > section > section > div > div:nth-child(2) > section > div > div";
        await page.waitForSelector(addPix2);
        await clickWithMouseOnElement(page, addPix2);
        await page.keyboard.press('Tab');
        await page.keyboard.press('1', {
            delay: 100
        });
        await page.keyboard.press('2', {
            delay: 100
        });
        await page.keyboard.press('3', {
            delay: 100
        });
        await page.keyboard.press('4', {
            delay: 100
        });
        await page.keyboard.press('5', {
            delay: 100
        });
        await page.keyboard.press('6', {
            delay: 100
        });
        const confirmBtn2 = "body > div > div > button";
        await page.waitForSelector(confirmBtn2);
        await clickWithMouseOnElement(page, confirmBtn2);
        const pixEmail = "body > div > div > div > form > div:nth-child(3) > div > div > div > input";
        await page.waitForSelector(pixEmail);
        await page.type(pixEmail, "victornogu80@gmail.com");
        const pixCpf = "body > div > div > div > form > div:nth-child(4) > div > div > div > input";
        await page.waitForSelector(pixCpf);
        await page.type(pixCpf, "12345678901");
        const confirmBtn3 = "body > div > div > div > form > div:nth-child(5) > div > button";
        await page.waitForSelector(confirmBtn3);
        await clickWithMouseOnElement(page, confirmBtn3);
        const withdrawTab = "#homeBoxScroll > div > div > div > div > div > section > div > div > div > div:nth-child(1)";
        await page.waitForSelector(withdrawTab);
        await clickWithMouseOnElement(page, withdrawTab);
        const withdrawAmount = "#homeBoxScroll > div > div > div > div > div > section > section > div > div > div > div > div > input";
        await page.waitForSelector(withdrawAmount);
        await page.type(withdrawAmount, "10");
        await page.keyboard.press('Tab');
        await page.keyboard.press('1', {
            delay: 100
        });
        await page.keyboard.press('2', {
            delay: 100
        });
        await page.keyboard.press('3', {
            delay: 100
        });
        await page.keyboard.press('4', {
            delay: 100
        });
        await page.keyboard.press('5', {
            delay: 100
        });
        await page.keyboard.press('6', {
            delay: 100
        });
        const confirmBtn4 = "#homeBoxScroll > div > div > div > div > div > section > section > div > button";
        await page.waitForSelector(confirmBtn4);
        await clickWithMouseOnElement(page, confirmBtn4);
    }
    else if (platformModel === '2') {
        const loginNowBtn = "div.ant-modal-content > div > div > div.ant-row-flex.ant-row-flex-space-around.ant-row-flex-middle > div:nth-child(3) > button";
        await page.waitForSelector(loginNowBtn);
        await clickWithMouseOnElement(page, loginNowBtn);
        const usernameInput = "form > div > div > div > div > div:nth-child(1) > div > div > div > span > span > input";
        const passwordInput = "form > div > div > div > div > div:nth-child(2) > div > div > div > span > span > input";
        await page.waitForSelector(usernameInput);
        await page.waitForSelector(passwordInput);
        await page.evaluate(async () => await new Promise(resolve => setTimeout(resolve, 2000)));
        await page.type(usernameInput, "xcfcxvcxvx", {
            delay: 100
        });
        await page.type(passwordInput, "123456rr", {
            delay: 100
        });
        await clickWithMouseOnElement(page, "div.ant-modal-content > div > div > div.ant-row-flex.ant-row-flex-center.ant-row-flex-middle > button");
        const loginBtnHeader = "#headerWrap > div > section > div > div > button.ant-btn.ant-btn-primary";
        await page.waitForSelector(loginBtnHeader, {
            hidden: true
        });
        await page.evaluate(async () => await new Promise(resolve => setTimeout(resolve, 2000)));
        await page.goto(`https://${mainLink}/home/security?current=5&isCallbackWithdraw=0`, {
            waitUntil: "networkidle0"
        });
        await page.keyboard.press('Tab');
        for (let i = 0; i < 2; i++) {
            await page.keyboard.press('1', {
                delay: 100
            });
            await page.keyboard.press('2', {
                delay: 100
            });
            await page.keyboard.press('3', {
                delay: 100
            });
            await page.keyboard.press('4', {
                delay: 100
            });
            await page.keyboard.press('5', {
                delay: 100
            });
            await page.keyboard.press('6', {
                delay: 100
            });
        }
        const confirmBtn = "section > div > div > div > div > div > div > section > div > div > div > div > div > button";
        await page.waitForSelector(confirmBtn);
        await clickWithMouseOnElement(page, confirmBtn);
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
//# sourceMappingURL=withdraw.js.map