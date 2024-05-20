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
    // const proxy = rlSync.question('Informe a proxy: \n', {
    //     hideEchoBack: false,
    // })
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
            proxy: "dzmmopgq-rotate:89o959rw0ydt@p.webshare.io:80",
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

    const step = 500;
    const resetValue = 2000;
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
            '--window-size=500,500'
        ],
    });

    try {
        const [page] = await browser.pages();
        await page.goto(link, {
            waitUntil: "networkidle0"
        })

        if (platformModel === '1') {
            try {
                const confirmAfk = await page.waitForSelector("div:nth-child(8) > div > div > div > div", {
                    timeout: 2000,
                    signal: undefined
                })
                await confirmAfk?.click()
                await page.waitForNavigation()
            } catch (e) {
                console.log(e)
            }

            const usernameInput = "form > div:nth-child(1) > div > div > div > input"
            const passwordInput = "form > div:nth-child(2) > div > div > div > input"
            const confirmPasswordInput = "form > div:nth-child(4) > div > div > div > input"

            await page.waitForSelector(usernameInput, {
                timeout: 2000,
                signal: undefined
            })
            await page.waitForSelector(passwordInput, {
                timeout: 2000,
                signal: undefined
            })
            await page.waitForSelector(confirmPasswordInput, {
                timeout: 2000,
                signal: undefined
            })

            await page.type(usernameInput, `${faker.person.firstName().toLowerCase().substring(0, 8)}${faker.string.numeric(6)}`)
            await page.type(passwordInput, accountsPassword)
            await page.type(confirmPasswordInput, accountsPassword)

            const registerButton = "form > div:nth-child(6) > button"
            await page.waitForSelector(registerButton, {
                timeout: 2000,
                signal: undefined
            })
            await page.click(registerButton)

            await page.evaluate(async () => await new Promise(resolve => setTimeout(resolve, 2000)))
            await page.goto(depositLink, {
                waitUntil: "networkidle0"
            })

            const depositAmountElement = 'div > div > div > div > div > div > div > input'
            await page.waitForSelector(depositAmountElement, {
                timeout: 2000,
                signal: undefined
            })
            await page.type(depositAmountElement, '10')

            const depositButton = "div > div > div > div > button"
            await page.waitForSelector(depositButton, {
                timeout: 2000,
                signal: undefined
            })
            await page.click(depositButton)
        } else if (platformModel === '2') {
            const usernameInput = "form > div > div > div > div > div:nth-child(1) > div > div > div > span > span > input"
            const passwordInput = "form > div > div > div > div > div:nth-child(2) > div > div > div > span > span > input"
            const confirmPasswordInput = "form > div > div > div > div > div:nth-child(4) > div > div > div > span > span > input"

            await page.waitForSelector(usernameInput, {
                timeout: 2000,
                signal: undefined
            })
            await page.waitForSelector(passwordInput, {
                timeout: 2000,
                signal: undefined
            })
            await page.waitForSelector(confirmPasswordInput, {
                timeout: 2000,
                signal: undefined
            })

            await page.type(usernameInput, `${faker.person.firstName().toLowerCase().substring(0, 8)}${faker.string.numeric(6)}`)
            await page.type(passwordInput, accountsPassword)
            await page.type(confirmPasswordInput, accountsPassword)

            await clickWithMouseOnElement(page, "div > div.ant-modal-wrap.ant-modal-centered > div > div.ant-modal-content > div > div > div.ant-row-flex.ant-row-flex-center.ant-row-flex-middle > button")
            await clickWithMouseOnElement(page, "div > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary")
            await clickWithMouseOnElement(page, "section > div > div > div > div > div > div:nth-child(3) > section > div > ul > li:nth-child(1)")
            await clickWithMouseOnElement(page, "section > div.common-tabs-content > section > div > div > div > div > div > button")
        }

        browsers.push(browser)

        await neverStop()
    } catch {
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