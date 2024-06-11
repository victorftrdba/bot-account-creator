import puppeteer, {Browser, Page} from 'puppeteer';
import {faker} from "@faker-js/faker";

const proxyChain = require('proxy-chain');
const rlSync = require('readline-sync');

process.on('uncaughtException', async () => {
    await Promise.all(
        browsers.map(async (b) => b?.close())
    )
});

process.on('SIGINT', async () => {
    await Promise.all(
        browsers.map(async (b) => b?.close())
    )
})

const browsers: Browser[] = [];

(async () => {
    const link = rlSync.question('Informe o link da plataforma: \n', {
        hideEchoBack: false,
    })
    const proxy = rlSync.question('Informe a proxy: \n', {
        hideEchoBack: false,
    })
    const quantities = rlSync.question('Quantidade de contas para criar: \n', {
        hideEchoBack: false,
    })
    const accountsPassword = rlSync.question('Informe a senha para as contas: \n', {
        hideEchoBack: false,
    })
    const platformModel = rlSync.question('Modelo da plataforma (1 ou 2): \n', {
        hideEchoBack: false,
    })

    const promises = []
    for (let i = 0; i < parseInt(quantities); i++) {
        promises.push(createAccount({
            link,
            proxy,
            accountsPassword,
            platformModel,
            index: i
        }))
    }
    await Promise.allSettled(promises)
})()

function getWindowPosition(index: number, step: number, resetValue: number): number {
    return (index * step) % resetValue;
}

function getWindowPositionYByIndexMultiple(index: number) {
    return index % 3 === 0 ? 0 : 500
}

async function createAccount({
                                 link,
                                 proxy,
                                 accountsPassword,
                                 platformModel,
                                 index
                             }: {
    link: string,
    proxy: string,
    accountsPassword: string,
    platformModel: string
    index: number
}) {
    const mainLink = link.replace?.("https://", "").split?.("/")?.[0]
    const depositLink = `https://${mainLink}/deposit`

    const step = 350;
    const resetValue = 1750;
    const show4WindowsSideBySide = `--window-position=${getWindowPosition(index, step, resetValue)},${getWindowPositionYByIndexMultiple(index)}`

    const browser = await puppeteer.launch({
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
            '--window-size=250,500'
        ],
    });

    try {
        const [page] = await browser.pages();
        page.setDefaultNavigationTimeout(0);
        page.setDefaultTimeout(0)
        await page.goto(link)
        await page.reload()
        const username = `${faker.person.firstName().toLowerCase().substring(0, 8)}${faker.person.lastName().toLowerCase().substring(0, 8)}`

        if (platformModel === '1') {
            const usernameInput = "form > div:nth-child(1) > div > div > div > input"
            const passwordInput = "form > div:nth-child(2) > div > div > div > input"
            const confirmPasswordInput = "form > div:nth-child(4) > div > div > div > input"

            await page.waitForSelector(usernameInput)
            await page.waitForSelector(passwordInput)
            await page.waitForSelector(confirmPasswordInput)

            await page.type(usernameInput, username)
            await page.type(passwordInput, accountsPassword)
            await page.type(confirmPasswordInput, accountsPassword)

            const registerButton = "form > div:nth-child(6) > button"
            await page.waitForSelector(registerButton)
            await page.click(registerButton)

            await page.evaluate(async () => await new Promise(resolve => setTimeout(resolve, 2000)))
            await page.goto(depositLink)

            const depositAmountElement = 'div > div > div > div > div > div > div > input'
            await page.waitForSelector(depositAmountElement)
            await page.type(depositAmountElement, '10')

            const depositButton = "div > div > div > div > button"
            await page.waitForSelector(depositButton)
            await page.click(depositButton)
        } else if (platformModel === '2') {
            await page.reload()

            const usernameInput = "form > div > div > div > div > div:nth-child(1) > div > div > div > span > span > input"
            const passwordInput = "form > div > div > div > div > div:nth-child(2) > div > div > div > span > span > input"
            const confirmPasswordInput = "form > div > div > div > div > div:nth-child(4) > div > div > div > span > span > input"

            await page.waitForSelector(usernameInput)
            await page.waitForSelector(passwordInput)
            await page.waitForSelector(confirmPasswordInput)

            await page.type(usernameInput, username)
            await page.type(passwordInput, accountsPassword)
            await page.type(confirmPasswordInput, accountsPassword)

            await clickWithMouseOnElement(page, "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content > div > div > div.ant-row-flex.ant-row-flex-center.ant-row-flex-middle > button")
            await clickOnElement(page, "div.ant-modal-wrap.ant-modal-centered.ant-modal-confirm-centered > div > div.ant-modal-content > div > div > div.ant-modal-confirm-body > div > div > div.closeIcon > img")
            await clickOnElement(page, ".ant-btn-primary")
            await clickWithMouseOnElement(page, "section > div > div > div > div > div > div:nth-child(3) > section > div > ul > li:nth-child(1)")
            await clickWithMouseOnElement(page, "section > div.common-tabs-content > section > div > div > div > div > div > button")
        }

        browsers.push(browser)

        await neverStop()
    } catch (e) {
        console.log(e)
        await browser?.close()
        await createAccount({
            link,
            proxy,
            accountsPassword,
            platformModel,
            index
        })
    }
}

async function clickWithMouseOnElement(page: Page, path: string) {
    const element = await page.waitForSelector(path, {
        timeout: 0
    })
    const rect = await page.evaluate(el => {
        const {top, left, width, height} = el?.getBoundingClientRect() as DOMRect;
        return {top, left, width, height};
    }, element);
    await page.mouse.click(rect?.left + rect?.width / 2, rect?.top + rect?.height / 2);
}

async function neverStop() {
    return new Promise(() => {
        setInterval(() => {
            console.log()
        }, 1000)
    });
}

async function clickOnElement(page: Page, path: string) {
    await page.evaluate(async (path) => await new Promise(resolve => {
        const element = document.querySelector(path) as any

        setInterval(() => {
            resolve(element?.click())
        }, 1000)
    }), path)
}