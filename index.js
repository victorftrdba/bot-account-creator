"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = require("puppeteer");
const faker_1 = require("@faker-js/faker");
const fs = require("fs");
const user_agents_1 = require("./user-agents");
const node_process_1 = require("node:process");
const proxyChain = require("proxy-chain");
const readline = require("node:readline/promises");
const rl = readline.createInterface({
    input: node_process_1.stdin,
    output: node_process_1.stdout
});
process.on("uncaughtException", async () => {
    await Promise.all(browsers.map(async (b) => b === null || b === void 0 ? void 0 : b.close()));
});
process.on("SIGINT", async () => {
    await Promise.all(browsers.map(async (b) => b === null || b === void 0 ? void 0 : b.close()));
});
const browsers = [];
(async () => {
    const { link, proxy, quantidade_contas, senha_contas, } = JSON.parse(Buffer.from(fs.readFileSync("./configs/config.json")).toString("utf8"));
    const isUseNormalProxy = await rl.question("Deseja usar proxy normal? (s/n): ");
    const promises = [];
    for (let i = 0; i < parseInt(quantidade_contas); i++) {
        promises.push(createAccount({
            link,
            proxy: isUseNormalProxy === 's' ? proxy : '',
            accountsPassword: senha_contas,
            index: i,
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
async function createAccount({ link, proxy, accountsPassword, index, }) {
    const step = 350;
    const resetValue = 1750;
    const show4WindowsSideBySide = `--window-position=${getWindowPosition(index, step, resetValue)},${getWindowPositionYByIndexMultiple(index)}`;
    const userAgent = user_agents_1.userAgents[Math.floor(Math.random() * user_agents_1.userAgents.length)];
    const browser = await puppeteer_1.default.launch({
        headless: false,
        defaultViewport: null,
        ignoreDefaultArgs: true,
        args: [
            (proxy === null || proxy === void 0 ? void 0 : proxy.length) ? `--proxy-server=${await proxyChain.anonymizeProxy(`http://${proxy}`)}` : '',
            "--incognito",
            "--verbose",
            "--disable-dev-shm-usage",
            "--disable-xss-auditor",
            "--no-zygote",
            "--disable-breakpad",
            "--disable-hang-monitor",
            "--disable-dev-profile",
            "--disable-infobars",
            show4WindowsSideBySide,
            "--window-size=250,750",
            `--user-agent=${userAgent}`,
        ],
    });
    try {
        const [page] = await browser.pages();
        await page.setUserAgent(userAgent);
        page.setDefaultNavigationTimeout(0);
        page.setDefaultTimeout(0);
        await page.goto(link, {
            waitUntil: ["networkidle0", "domcontentloaded", "load"],
        });
        const username = `${faker_1.faker.person
            .firstName()
            .toLowerCase()
            .substring(0, 8)}${faker_1.faker.person
            .lastName()
            .toLowerCase()
            .substring(0, 8)
            .replace("-", "")}`;
        await page.waitForFunction(async () => {
            function clickOnElement(path) {
                return new Promise(async (resolve) => {
                    const element = document.querySelector(path);
                    if (!element) {
                        console.log(`${path} not found`);
                        return resolve(false);
                    }
                    const { top, left, width, height } = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
                    const clickEvt = new MouseEvent('click', {
                        clientX: left + width / 2,
                        clientY: top + height / 2,
                        bubbles: true,
                        cancelable: false,
                        composed: true
                    });
                    element === null || element === void 0 ? void 0 : element.dispatchEvent(clickEvt);
                    element === null || element === void 0 ? void 0 : element.click();
                    console.log(`${path} found`);
                    resolve(true);
                });
            }
            await Promise.all(["div.right-content-wrapper > div.content-wrapper > div > div.v--modal-overlay > div > div.v--modal-box.v--modal > div > div.tcg_modal_close"].map(async (path) => {
                return await clickOnElement(path);
            }));
            await Promise.all(["#mc-animate-container > div > div.page_container.home-container > div.popup_container_v2.show-popup > div > div.popup_content > div.am-navbar-title.close-btn > svg"].map(async (path) => {
                return await clickOnElement(path);
            }));
            await Promise.all(["div.right-content-wrapper > div.header > div > div > div.right-wrap > div.hd_login > div:nth-child(2) > span"].map(async (path) => {
                return await clickOnElement(path);
            }));
            return true;
        });
        await page.waitForFunction(async () => {
            function isElementRendered(paths) {
                return new Promise(resolve => {
                    var _a, _b;
                    const element = (_a = paths === null || paths === void 0 ? void 0 : paths.map(path => document.querySelector(path))) === null || _a === void 0 ? void 0 : _a.find(Boolean);
                    const isAllUndefined = (_b = paths === null || paths === void 0 ? void 0 : paths.map(path => document.querySelector(path))) === null || _b === void 0 ? void 0 : _b.every(p => !p);
                    if (isAllUndefined) {
                        resolve(true);
                    }
                    if (!element) {
                        console.log(`${element} not found`);
                        return resolve(false);
                    }
                    console.log(`${element} found`);
                    resolve(true);
                });
            }
            return await isElementRendered([
                "div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content > div > div.login-register-body",
                "div.right-content-wrapper > div.header > div.v--modal-overlay > div > div.v--modal-box.v--modal",
                "body > div > div > div > div > div",
                "#accountRegisterModal"
            ]);
        });
        await page.waitForFunction(async (username, accountsPassword) => {
            function clickOnElement(path) {
                return new Promise(async (resolve) => {
                    const element = document.querySelector(path);
                    if (!element) {
                        console.log(`${path} not found`);
                        return resolve(false);
                    }
                    const { top, left, width, height } = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
                    const clickEvt = new MouseEvent('click', {
                        clientX: left + width / 2,
                        clientY: top + height / 2,
                        bubbles: true,
                        cancelable: false,
                        composed: true
                    });
                    element === null || element === void 0 ? void 0 : element.dispatchEvent(clickEvt);
                    element === null || element === void 0 ? void 0 : element.click();
                    console.log(`${path} found`);
                    resolve(true);
                });
            }
            function setValueOnElement(path, value) {
                return new Promise(async (resolve) => {
                    var _a, _b;
                    const element = document.querySelector(path);
                    if (!element) {
                        console.log(`${path} not found`);
                        return resolve(false);
                    }
                    (_b = (_a = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')) === null || _a === void 0 ? void 0 : _a.set) === null || _b === void 0 ? void 0 : _b.call(element, value);
                    for (let i = 0; i < value.length; i++) {
                        element.dispatchEvent(new Event("input", { bubbles: true, cancelable: false, composed: true }));
                        element.dispatchEvent(new Event("change", { bubbles: true, cancelable: false, composed: true }));
                        element.dispatchEvent(new Event("blur", { bubbles: true, cancelable: false, composed: true }));
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    console.log(`${path} found`);
                    resolve(true);
                });
            }
            await Promise.all([
                [
                    "form > div > div:nth-child(2) > div > div > div > span > div > div > div > ul > li > div > input",
                    "form > div:nth-child(1) > div:nth-child(1) > div > input",
                    "form > div:nth-child(1) > div > div > div > input",
                    "form > div:nth-child(1) > div > div > div > div > input"
                ].map(async (path) => {
                    return await setValueOnElement(path, username);
                }),
                [
                    "form > div > div:nth-child(4) > div > div > div > span > span > input",
                    "form > div:nth-child(1) > div:nth-child(2) > div > input",
                    "form > div:nth-child(2) > div > div > div > input",
                    "form > div:nth-child(2) > div > div > div > div > input"
                ].map(async (path) => {
                    return await setValueOnElement(path, accountsPassword);
                }),
                [
                    "form > div > div:nth-child(6) > div > div > div > span > span > input",
                    "form > div:nth-child(1) > div:nth-child(3) > div > input",
                    "form > div:nth-child(4) > div > div > div > input",
                    "form > div:nth-child(4) > div > div > div > div > input"
                ].map(async (path) => {
                    return await setValueOnElement(path, accountsPassword);
                })
            ]);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await Promise.all([
                [
                    "div.right-content-wrapper > div.header > div.v--modal-overlay > div > div.v--modal-box.v--modal > div > div.tcg_modal_body > div > div.register_wrapper.register-modal > div > div.form_container > form > div.form_item.reg-btn-wrap > button",
                    "div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content > div > div.login-register-body > div:nth-child(4) > div:nth-child(2) > button",
                    "form > div:nth-child(6) > button",
                    "#js_login > div > div > div:nth-child(3) > button"
                ].map(async (path) => {
                    return await clickOnElement(path);
                })
            ]);
            return true;
        }, {}, username, accountsPassword);
        await page.waitForFunction(async () => {
            function isElementRendered(paths) {
                return new Promise(resolve => {
                    var _a, _b;
                    const element = (_a = paths === null || paths === void 0 ? void 0 : paths.map(path => document.querySelector(path))) === null || _a === void 0 ? void 0 : _a.find(Boolean);
                    const isAllUndefined = (_b = paths === null || paths === void 0 ? void 0 : paths.map(path => document.querySelector(path))) === null || _b === void 0 ? void 0 : _b.every(p => !p);
                    if (isAllUndefined) {
                        resolve(true);
                    }
                    if (!element) {
                        console.log(`${element} not found`);
                        return resolve(false);
                    }
                    console.log(`${element} found`);
                    resolve(true);
                });
            }
            return await isElementRendered([
                "body > div._modalBox_3bzvl_3 > div > div > div._delete_re3qb_19 > img",
                "div.ant-modal-wrap.ant-modal-centered.ant-modal-confirm-centered > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary",
                ".cms-mango-popup > div > div > div > div > div > div:nth-child(3)"
            ]);
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.waitForFunction(async () => {
            function clickOnElement(path) {
                return new Promise(async (resolve) => {
                    const element = document.querySelector(path);
                    if (!element) {
                        console.log(`${path} not found`);
                        return resolve(false);
                    }
                    const { top, left, width, height } = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
                    const clickEvt = new MouseEvent('click', {
                        clientX: left + width / 2,
                        clientY: top + height / 2,
                        bubbles: true,
                        cancelable: false,
                        composed: true
                    });
                    element === null || element === void 0 ? void 0 : element.dispatchEvent(clickEvt);
                    element === null || element === void 0 ? void 0 : element.click();
                    console.log(`${path} found`);
                    resolve(true);
                });
            }
            await Promise.all([
                [
                    "body > div._modalBox_3bzvl_3 > div > div > div._delete_re3qb_19 > img",
                    "div.ant-modal-wrap.ant-modal-centered.ant-modal-confirm-centered > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary",
                    ".cms-mango-popup > div > div > div > div > div > div:nth-child(3)"
                ].map(async (path) => {
                    return await clickOnElement(path);
                })
            ]);
            return true;
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.waitForFunction(async () => {
            function clickOnElement(path) {
                return new Promise(async (resolve) => {
                    const element = document.querySelector(path);
                    if (!element) {
                        console.log(`${path} not found`);
                        return resolve(false);
                    }
                    const { top, left, width, height } = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
                    const clickEvt = new MouseEvent('click', {
                        clientX: left + width / 2,
                        clientY: top + height / 2,
                        bubbles: true,
                        cancelable: false,
                        composed: true
                    });
                    element === null || element === void 0 ? void 0 : element.dispatchEvent(clickEvt);
                    element === null || element === void 0 ? void 0 : element.click();
                    console.log(`${path} found`);
                    resolve(true);
                });
            }
            await Promise.all([
                [
                    ".cms-mango-popup:last-child > div > div > div > div > div > div > div:nth-child(3) > span"
                ].map(async (path) => {
                    return await clickOnElement(path);
                })
            ]);
            return true;
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.waitForFunction(async () => {
            function clickOnElement(path) {
                return new Promise(async (resolve) => {
                    const element = document.querySelector(path);
                    if (!element) {
                        console.log(`${path} not found`);
                        return resolve(false);
                    }
                    const { top, left, width, height } = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
                    const clickEvt = new MouseEvent('click', {
                        clientX: left + width / 2,
                        clientY: top + height / 2,
                        bubbles: true,
                        cancelable: false,
                        composed: true
                    });
                    element === null || element === void 0 ? void 0 : element.dispatchEvent(clickEvt);
                    element === null || element === void 0 ? void 0 : element.click();
                    console.log(`${path} found`);
                    resolve(true);
                });
            }
            await Promise.all([
                [
                    ".cms-mango-popup:last-child > div > div > div > div > div:nth-child(2)"
                ].map(async (path) => {
                    return await clickOnElement(path);
                })
            ]);
            return true;
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.waitForFunction(async () => {
            function clickOnElement(path) {
                return new Promise(async (resolve) => {
                    const element = document.querySelector(path);
                    if (!element) {
                        console.log(`${path} not found`);
                        return resolve(false);
                    }
                    const { top, left, width, height } = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
                    const clickEvt = new MouseEvent('click', {
                        clientX: left + width / 2,
                        clientY: top + height / 2,
                        bubbles: true,
                        cancelable: false,
                        composed: true
                    });
                    element === null || element === void 0 ? void 0 : element.dispatchEvent(clickEvt);
                    element === null || element === void 0 ? void 0 : element.click();
                    console.log(`${path} found`);
                    resolve(true);
                });
            }
            await Promise.all([
                [
                    "#js_header > div > div > div > div > div",
                    "div > div > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div"
                ].map(async (path) => {
                    return await clickOnElement(path);
                })
            ]);
            return true;
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.waitForFunction(async () => {
            function isElementRendered(paths) {
                return new Promise(resolve => {
                    var _a, _b;
                    const element = (_a = paths === null || paths === void 0 ? void 0 : paths.map(path => document.querySelector(path))) === null || _a === void 0 ? void 0 : _a.find(Boolean);
                    const isAllUndefined = (_b = paths === null || paths === void 0 ? void 0 : paths.map(path => document.querySelector(path))) === null || _b === void 0 ? void 0 : _b.every(p => !p);
                    if (isAllUndefined) {
                        resolve(true);
                    }
                    if (!element) {
                        console.log(`${element} not found`);
                        return resolve(false);
                    }
                    console.log(`${element} found`);
                    resolve(true);
                });
            }
            return await isElementRendered([
                "div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content > div.ant-modal-body > div > section > section > div.common-tabs-content > section > div > div > div > div > div.e8siic_ICXmLcAr12pgU > div:nth-child(3) > section > div > div > span > input",
                ".cms-mango-popup > div > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(3) > div > div:nth-child(3) > div > span > input",
                "div > div > div > div > div > div > input"
            ]);
        });
        await page.waitForFunction(async () => {
            function clickOnElement(path) {
                return new Promise(async (resolve) => {
                    const element = document.querySelector(path);
                    if (!element) {
                        console.log(`${path} not found`);
                        return resolve(false);
                    }
                    const { top, left, width, height } = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
                    const clickEvt = new MouseEvent('click', {
                        clientX: left + width / 2,
                        clientY: top + height / 2,
                        bubbles: true,
                        cancelable: false,
                        composed: true
                    });
                    element === null || element === void 0 ? void 0 : element.dispatchEvent(clickEvt);
                    element === null || element === void 0 ? void 0 : element.click();
                    console.log(`${path} found`);
                    resolve(true);
                });
            }
            function setValueOnElement(path, value) {
                return new Promise(async (resolve) => {
                    var _a, _b;
                    const element = document.querySelector(path);
                    if (!element) {
                        console.log(`${path} not found`);
                        return resolve(false);
                    }
                    (_b = (_a = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')) === null || _a === void 0 ? void 0 : _a.set) === null || _b === void 0 ? void 0 : _b.call(element, value);
                    for (let i = 0; i < value.length; i++) {
                        element.dispatchEvent(new Event("input", { bubbles: true, cancelable: false, composed: true }));
                        element.dispatchEvent(new Event("change", { bubbles: true, cancelable: false, composed: true }));
                        element.dispatchEvent(new Event("blur", { bubbles: true, cancelable: false, composed: true }));
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    console.log(`${path} found`);
                    resolve(true);
                });
            }
            await Promise.all([
                [
                    "div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content > div.ant-modal-body > div > section > section > div.common-tabs-content > section > div > div > div > div > div.e8siic_ICXmLcAr12pgU > div:nth-child(3) > section > div > div > span > input",
                    ".cms-mango-popup > div > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(3) > div > div:nth-child(3) > div > span > input",
                    "div > div > div > div > div > div > input"
                ].map(async (path) => {
                    return await setValueOnElement(path, "10");
                })
            ]);
            await Promise.all([
                [
                    "div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content > div.ant-modal-body > div > section > section > div.common-tabs-content > section > div > div > div > div > div > button",
                    ".cms-mango-popup > div > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(3) > button",
                    "div > div > div > button"
                ].map(async (path) => {
                    return await clickOnElement(path);
                })
            ]);
            return true;
        });
        browsers.push(browser);
        await neverStop();
    }
    catch (e) {
        console.log(e);
    }
}
async function neverStop() {
    return new Promise(() => {
        setInterval(() => {
            console.log();
        }, 1000);
    });
}
