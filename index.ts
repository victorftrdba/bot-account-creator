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
    const quantities = rlSync.question('Quantas contas deseja criar?\n', {
        hideEchoBack: false,
    })
    const accountsPassword = rlSync.question('Informe a senha para as contas: \n', {
        hideEchoBack: false,
    })
    const platformModel = rlSync.question('O modelo da plataforma é o 1 ou 2? \n', {
        hideEchoBack: false,
    })

    const promises = []
    for (let i = 0; i < parseInt(quantities); i++) {
        promises.push(createAccount({link, proxy, accountsPassword, platformModel}))
    }
    await Promise.all(promises)
})()

async function createAccount({
                                 link,
                                 proxy,
                                 accountsPassword,
                                 platformModel
                             }: {
    link: string,
    proxy: string,
    accountsPassword: string,
    platformModel: string
}) {
    const depositLink = `${link.split('?')?.[0]}deposit`

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--proxy-server=${await proxyChain.anonymizeProxy(`http://${proxy}`)}`,
            '--incognito',
            '--ignore-certificate-errors',
            '--no-sandbox',
            '--verbose',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-xss-auditor',
            '--no-zygote',
            '--disable-breakpad',
            '--disable-hang-monitor',
            '--disable-dev-profile',
        ],
    });
    const [page] = await browser.pages();
    await page.setViewport({width: 1280, height: 600});
    await page.goto(link)

    if (platformModel === '1') {
        const usernameInput = "form > div:nth-child(1) > div > div > div > input"
        const passwordInput = "form > div:nth-child(2) > div > div > div > input"
        const confirmPasswordInput = "form > div:nth-child(4) > div > div > div > input"
        const completeNameInput = "form > div:nth-child(5) > div > div > div > input"

        await page.waitForSelector(usernameInput)
        await page.waitForSelector(passwordInput)
        await page.waitForSelector(confirmPasswordInput)
        await page.waitForSelector(completeNameInput)

        await page.type(usernameInput, `${faker.person.firstName().toLowerCase().substring(0, 8)}${faker.string.numeric(6)}`)
        await page.type(passwordInput, accountsPassword)
        await page.type(confirmPasswordInput, accountsPassword)
        await page.type(completeNameInput, `${faker.person.firstName()} ${faker.person.lastName()}`)

        const registerButton = "form > div:nth-child(7) > button"

        await page.waitForSelector(registerButton)
        await page.click(registerButton)

        await page.evaluate(async () => await new Promise(resolve => setTimeout(resolve, 2000)))
        await page.goto(depositLink)

        const depositAmountElement = '#homeBoxScroll > div > div > div > div > section:nth-child(10) > div:nth-child(1)'
        await page.waitForSelector(depositAmountElement)
        await page.click(depositAmountElement)

        const depositButton = "#homeBoxScroll > div > div > div > div > div > button"
        await page.waitForSelector(depositButton)
        await page.click(depositButton)
    } else if (platformModel === '2') {
        const usernameInput = "form > div > div > div > div > div:nth-child(1) > div > div > div > span > span > input"
        const passwordInput = "form > div > div > div > div > div:nth-child(2) > div > div > div > span > span > input"
        const confirmPasswordInput = "form > div > div > div > div > div:nth-child(4) > div > div > div > span > span > input"

        await page.waitForSelector(usernameInput)
        await page.waitForSelector(passwordInput)
        await page.waitForSelector(confirmPasswordInput)

        await page.type(usernameInput, `${faker.person.firstName().toLowerCase().substring(0, 8)}${faker.string.numeric(6)}`)
        await page.type(passwordInput, accountsPassword)
        await page.type(confirmPasswordInput, accountsPassword)

        await clickWithMouseOnElement(page, "div > div > div.ant-row-flex.ant-row-flex-center.ant-row-flex-middle > button")
        await clickWithMouseOnElement(page, "div > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary")
        await clickWithMouseOnElement(page, "section > div > div > div > div > div > div:nth-child(3) > section > div > ul > li:nth-child(1)")
        await clickWithMouseOnElement(page, "section > div.common-tabs-content > section > div > div > div > div > div > button")
    }

    browsers.push(browser)

    await neverStop()
}

async function clickWithMouseOnElement(page: Page, path: string) {
    const element = await page.waitForSelector(path)
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