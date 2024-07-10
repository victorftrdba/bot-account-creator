import puppeteer, { Browser, Page } from "puppeteer";
import { faker } from "@faker-js/faker";
import * as fs from "fs";
import { userAgents } from "./user-agents";

const proxyChain = require("proxy-chain");

process.on("uncaughtException", async () => {
  await Promise.all(browsers.map(async (b) => b?.close()));
});

process.on("SIGINT", async () => {
  await Promise.all(browsers.map(async (b) => b?.close()));
});

const browsers: Browser[] = [];

(async () => {
  const {
    link,
    proxy,
    quantidade_contas,
    senha_contas,
    modelo_plataforma,
    preencher_nome,
  } = JSON.parse(
    Buffer.from(fs.readFileSync("./configs/config.json")).toString("utf8")
  );

  const promises = [];
  for (let i = 0; i < parseInt(quantidade_contas); i++) {
    promises.push(
      createAccount({
        link,
        proxy,
        accountsPassword: senha_contas,
        platformModel: modelo_plataforma,
        isWaitForName: preencher_nome,
        index: i,
      })
    );
  }
  await Promise.allSettled(promises);
})();

function getWindowPosition(
  index: number,
  step: number,
  resetValue: number
): number {
  return (index * step) % resetValue;
}

function getWindowPositionYByIndexMultiple(index: number) {
  return index % 3 === 0 ? 0 : 500;
}

async function createAccount({
  link,
  proxy,
  accountsPassword,
  platformModel,
  isWaitForName,
  index,
}: {
  link: string;
  proxy: string;
  accountsPassword: string;
  platformModel: string;
  isWaitForName: string;
  index: number;
}) {
  const mainLink = link.replace?.("https://", "").split?.("/")?.[0];
  const depositLink = `https://${mainLink}/deposit`;

  const step = 350;
  const resetValue = 1750;
  const show4WindowsSideBySide = `--window-position=${getWindowPosition(
    index,
    step,
    resetValue
  )},${getWindowPositionYByIndexMultiple(index)}`;
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    ignoreDefaultArgs: true,
    args: [
      `--proxy-server=${await proxyChain.anonymizeProxy(`http://${proxy}`)}`,
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
      "--window-size=250,700",
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
    const username = `${faker.person
      .firstName()
      .toLowerCase()
      .substring(0, 8)}${faker.person
      .lastName()
      .toLowerCase()
      .substring(0, 8)
      .replace("-", "")}`;

    if (platformModel === "1") {
      const usernameInput = "form > div:nth-child(1) > div > div > div > input";
      const passwordInput = "form > div:nth-child(2) > div > div > div > input";
      const confirmPasswordInput =
        "form > div:nth-child(4) > div > div > div > input";

      await page.waitForSelector(usernameInput);
      await page.waitForSelector(passwordInput);
      await page.waitForSelector(confirmPasswordInput);

      if (!isWaitForName) {
        await page.type(usernameInput, username);
      }
      await page.type(passwordInput, accountsPassword);
      await page.type(confirmPasswordInput, accountsPassword);

      await page.waitForFunction(
        (usernameInput, isWaitForName) => {
          if (!isWaitForName) {
            return true;
          }

          return (
            (document.querySelector(usernameInput) as any)?.value?.length > 6
          );
        },
        {
          polling: 300,
        },
        usernameInput,
        isWaitForName
      );

      const registerButton = "form > div:nth-child(6) > button";
      await page.waitForSelector(registerButton);

      if (!isWaitForName) {
        await page.click(registerButton);
      }

      await page.evaluate(async (registerButton) => {
        return await new Promise((resolve) => {
          document
            .querySelector(registerButton)
            ?.addEventListener("click", () => {
              resolve(true);
            });
        });
      }, registerButton);

      await page.evaluate(
        async () => await new Promise((resolve) => setTimeout(resolve, 2000))
      );
      await page.goto(depositLink);

      const depositAmountElement =
        "div > div > div > div > div > div > div > input";
      await page.waitForSelector(depositAmountElement);
      await page.type(depositAmountElement, "10");

      const depositButton = "div > div > div > div > button";
      await page.waitForSelector(depositButton);
      await page.click(depositButton);
    } else if (platformModel === "2") {
      const usernameInput =
        "form > div:nth-child(1) > div > div > div > div > input";
      const passwordInput =
        "form > div:nth-child(2) > div > div > div > div > input";
      const confirmPasswordInput =
        "form > div:nth-child(4) > div > div > div > div > input";
      const nameInput =
        "form > div:nth-child(5) > div > div > div > div > input";

      await page.evaluate(
        async () => await new Promise((resolve) => setTimeout(resolve, 2000))
      );

      if (!isWaitForName) {
        await page.type(usernameInput, username);
      }
      await page.type(passwordInput, accountsPassword);
      await page.type(confirmPasswordInput, accountsPassword);
      await page.type(nameInput, faker.person.fullName());

      await page.waitForFunction(
        (usernameInput, isWaitForName) => {
          if (!isWaitForName) {
            return true;
          }

          return (
            (document.querySelector(usernameInput) as any)?.value?.length > 6
          );
        },
        {
          polling: 300,
        },
        usernameInput,
        isWaitForName
      );

      const registerButton =
        "#js_login > div > div > div:nth-child(3) > button";

      if (!isWaitForName) {
        await clickWithMouseOnElement(page, registerButton);
      }

      await page.evaluate(
        async (registerButton, isWaitForName) => {
          if (!isWaitForName) {
            return true;
          }

          return await new Promise((resolve) => {
            document
              .querySelector(registerButton)
              ?.addEventListener("click", () => {
                resolve(true);
              });
          });
        },
        registerButton,
        isWaitForName
      );

      await page.evaluate(
        async () => await new Promise((resolve) => setTimeout(resolve, 5000))
      );
      await page.reload();
      setInterval(() => {
        await clickWithMouseOnElement(
          page,
          ".cms-mango-popup > div > div > div > div > div > div > div:nth-child(3) > span"
        );
      }, 100);
      await clickWithMouseOnElement(
        page,
        ".cms-mango-popup > div > div > div > div > div > div:nth-child(3)"
      );
      await page.evaluate(
        async () => await new Promise((resolve) => setTimeout(resolve, 2000))
      );
      await clickWithMouseOnElement(
        page,
        ".van-popup > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(1)"
      );
      await page.evaluate(
        async () => await new Promise((resolve) => setTimeout(resolve, 2000))
      );
      await clickOnElement(
        page,
        ".van-popup > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(3) > button"
      );
    }

    browsers.push(browser);

    await neverStop();
  } catch (e) {
    console.log(e);
  }
}

async function clickWithMouseOnElement(page: Page, path: string) {
  const element = await page.waitForSelector(path, {
    timeout: 0,
  });
  const rect = await page.evaluate((el) => {
    const { top, left, width, height } = el?.getBoundingClientRect() as DOMRect;
    return { top, left, width, height };
  }, element);
  await page.mouse.click(
    rect?.left + rect?.width / 2,
    rect?.top + rect?.height / 2
  );
}

async function neverStop() {
  return new Promise(() => {
    setInterval(() => {
      console.log();
    }, 1000);
  });
}

async function clickOnElement(page: Page, path: string) {
  await page.evaluate(
    async (path) =>
      await new Promise((resolve) => {
        const element = document.querySelector(path) as any;

        setInterval(() => {
          resolve(element?.click());
        }, 1000);
      }),
    path
  );
}
